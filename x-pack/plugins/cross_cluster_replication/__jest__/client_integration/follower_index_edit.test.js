/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import sinon from 'sinon';

import { initTestBed, registerHttpRequestMockHelpers, nextTick, findTestSubject } from './test_helpers';
import { FollowerIndexAdd } from '../../public/app/sections/follower_index_add';
import { FollowerIndexEdit } from '../../public/app/sections/follower_index_edit';
import { FollowerIndexForm } from '../../public/app/components/follower_index_form/follower_index_form';
import routing from '../../public/app/services/routing';

jest.mock('ui/chrome', () => ({
  addBasePath: (path) => path || 'api/cross_cluster_replication',
  breadcrumbs: { set: () => {} },
}));

jest.mock('ui/index_patterns', () => {
  const { INDEX_PATTERN_ILLEGAL_CHARACTERS_VISIBLE } = jest.requireActual('../../../../../src/legacy/ui/public/index_patterns/constants'); // eslint-disable-line max-len
  const { validateIndexPattern, ILLEGAL_CHARACTERS, CONTAINS_SPACES } = jest.requireActual('../../../../../src/legacy/ui/public/index_patterns/validate/validate_index_pattern'); // eslint-disable-line max-len
  return { INDEX_PATTERN_ILLEGAL_CHARACTERS_VISIBLE, validateIndexPattern, ILLEGAL_CHARACTERS, CONTAINS_SPACES };
});

const FOLLOWER_INDEX_NAME = 'my-follower-index';

const FOLLOWER_INDEX = {
  name: FOLLOWER_INDEX_NAME,
  remoteCluster: 'new-york',
  leaderIndex: 'some-leader-test',
  status: 'active',
  maxReadRequestOperationCount: 7845,
  maxOutstandingReadRequests: 16,
  maxReadRequestSize: '64mb',
  maxWriteRequestOperationCount: 2456,
  maxWriteRequestSize: '1048b',
  maxOutstandingWriteRequests: 69,
  maxWriteBufferCount: 123456,
  maxWriteBufferSize: '256mb',
  maxRetryDelay: '225ms',
  readPollTimeout: '2m'
};

const testBedOptions = {
  memoryRouter: {
    onRouter: (router) => routing.reactRouter = router,
    // The auto-follow pattern id to fetch is read from the router ":id" param
    // so we first set it in our initial entries
    initialEntries: [`/${FOLLOWER_INDEX_NAME}`],
    // and then we declarae the :id param on the component route path
    componentRoutePath: '/:id'
  }
};

describe('Edit Auto-follow pattern', () => {
  let server;
  let find;
  let component;
  let getUserActions;
  let getFormErrorsMessages;
  let clickSaveForm;
  let setLoadRemoteClusteresResponse;
  let setGetFollowerIndexResponse;

  beforeEach(() => {
    server = sinon.fakeServer.create();
    server.respondImmediately = true;

    // Register helpers to mock Http Requests
    ({
      setLoadRemoteClusteresResponse,
      setGetFollowerIndexResponse
    } = registerHttpRequestMockHelpers(server));

    // Set "default" mock responses by not providing any arguments
    setLoadRemoteClusteresResponse();

    // Mock all HTTP Requests that have not been handled previously
    server.respondWith([200, {}, '']);
  });

  describe('on component mount', () => {
    const remoteClusters = [
      { name: 'new-york', seeds: ['localhost:123'], isConnected: true },
    ];

    beforeEach(async () => {
      setLoadRemoteClusteresResponse(remoteClusters);
      setGetFollowerIndexResponse(FOLLOWER_INDEX);
      ({ component, find } = initTestBed(FollowerIndexEdit, undefined, testBedOptions));

      await nextTick();
      component.update();
    });

    /**
     * As the "edit" follower index component uses the same form underneath that
     * the "create" follower index, we won't test it again but simply make sure that
     * the form component is indeed shared between the 2 app sections.
     */
    test('should use the same Form component that the "<FollowerIndexAdd />" component', async () => {
      const { component: addFollowerIndexComponent } = initTestBed(FollowerIndexAdd, undefined, testBedOptions);

      await nextTick();
      addFollowerIndexComponent.update();

      const formEdit = component.find(FollowerIndexForm);
      const formAdd = addFollowerIndexComponent.find(FollowerIndexForm);

      expect(formEdit.length).toBe(1);
      expect(formAdd.length).toBe(1);
    });

    test('should populate the form fields with the values from the follower index loaded', () => {
      expect(find('ccrRemoteClusterInput').props().value).toBe(FOLLOWER_INDEX.remoteCluster);
      expect(find('ccrFollowerIndexFormLeaderIndexInput').props().value).toBe(FOLLOWER_INDEX.leaderIndex);
      expect(find('ccrFollowerIndexFormFollowerIndexInput').props().value).toBe(FOLLOWER_INDEX.name);
      expect(find('ccrFollowerIndexFormMaxReadRequestOperationCountInput').props().value).toBe(FOLLOWER_INDEX.maxReadRequestOperationCount);
      expect(find('ccrFollowerIndexFormMaxOutstandingReadRequestsInput').props().value).toBe(FOLLOWER_INDEX.maxOutstandingReadRequests);
      expect(find('ccrFollowerIndexFormMaxReadRequestSizeInput').props().value).toBe(FOLLOWER_INDEX.maxReadRequestSize);
      expect(find('ccrFollowerIndexFormMaxWriteRequestOperationCountInput').props().value)
        .toBe(FOLLOWER_INDEX.maxWriteRequestOperationCount);
      expect(find('ccrFollowerIndexFormMaxWriteRequestSizeInput').props().value).toBe(FOLLOWER_INDEX.maxWriteRequestSize);
      expect(find('ccrFollowerIndexFormMaxOutstandingWriteRequestsInput').props().value).toBe(FOLLOWER_INDEX.maxOutstandingWriteRequests);
      expect(find('ccrFollowerIndexFormMaxWriteBufferCountInput').props().value).toBe(FOLLOWER_INDEX.maxWriteBufferCount);
      expect(find('ccrFollowerIndexFormMaxWriteBufferSizeInput').props().value).toBe(FOLLOWER_INDEX.maxWriteBufferSize);
      expect(find('ccrFollowerIndexFormMaxRetryDelayInput').props().value).toBe(FOLLOWER_INDEX.maxRetryDelay);
      expect(find('ccrFollowerIndexFormReadPollTimeoutInput').props().value).toBe(FOLLOWER_INDEX.readPollTimeout);
    });
  });

  describe('when the remote cluster is disconnected', () => {
    beforeEach(async () => {
      setLoadRemoteClusteresResponse([{ name: 'new-york', seeds: ['localhost:123'], isConnected: false }]);
      setGetFollowerIndexResponse(FOLLOWER_INDEX);
      ({ component, find, getUserActions, getFormErrorsMessages } = initTestBed(FollowerIndexEdit, undefined, testBedOptions));
      ({ clickSaveForm } = getUserActions('followerIndexForm'));

      await nextTick();
      component.update();
    });

    test('should display an error and have a button to edit the remote cluster', () => {
      const error = find('remoteClusterFieldCallOutError');

      expect(error.length).toBe(1);
      expect(error.find('.euiCallOutHeader__title').text())
        .toBe(`Can't edit follower index because remote cluster '${FOLLOWER_INDEX.remoteCluster}' is not connected`);
      expect(findTestSubject(error, 'ccrRemoteClusterEditButton').length).toBe(1);
    });

    test('should prevent saving the form and display an error message for the required remote cluster', () => {
      clickSaveForm();

      expect(getFormErrorsMessages()).toEqual(['A connected remote cluster is required.']);
      expect(find('ccrFollowerIndexFormSubmitButton').props().disabled).toBe(true);
    });
  });
});
