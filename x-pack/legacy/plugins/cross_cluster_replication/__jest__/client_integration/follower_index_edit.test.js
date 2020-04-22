/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import '../../public/np_ready/app/services/breadcrumbs.mock';
import { setupEnvironment, pageHelpers, nextTick, getRandomString } from './helpers';
import { FollowerIndexForm } from '../../public/np_ready/app/components/follower_index_form/follower_index_form';
import { endPoints } from '../../common/routes_endpoints';
import { FOLLOWER_INDEX_EDIT } from './helpers/constants';

jest.mock('ui/new_platform');

const { setup } = pageHelpers.followerIndexEdit;
const { setup: setupFollowerIndexAdd } = pageHelpers.followerIndexAdd;

describe('Edit follower index', () => {
  let server;
  let httpRequestsMockHelpers;

  beforeAll(() => {
    ({ server, httpRequestsMockHelpers } = setupEnvironment());
  });

  afterAll(() => {
    server.restore();
  });

  describe('on component mount', () => {
    let find;
    let component;
    let waitFor;

    const remoteClusters = [{ name: 'new-york', seeds: ['localhost:123'], isConnected: true }];

    beforeEach(async () => {
      httpRequestsMockHelpers.setLoadRemoteClustersResponse(remoteClusters);
      httpRequestsMockHelpers.setGetFollowerIndexResponse(FOLLOWER_INDEX_EDIT);
      ({ component, find, waitFor } = setup());

      await waitFor('followerIndexForm');
    });

    /**
     * As the "edit" follower index component uses the same form underneath that
     * the "create" follower index, we won't test it again but simply make sure that
     * the form component is indeed shared between the 2 app sections.
     */
    test('should use the same Form component as the "<FollowerIndexAdd />" component', async () => {
      const { component: addFollowerIndexComponent } = setupFollowerIndexAdd();

      await nextTick();
      addFollowerIndexComponent.update();

      const formEdit = component.find(FollowerIndexForm);
      const formAdd = addFollowerIndexComponent.find(FollowerIndexForm);

      expect(formEdit.length).toBe(1);
      expect(formAdd.length).toBe(1);
    });

    test('should populate the form fields with the values from the follower index loaded', () => {
      const inputToPropMap = {
        remoteClusterInput: 'remoteCluster',
        leaderIndexInput: 'leaderIndex',
        followerIndexInput: 'name',
        maxReadRequestOperationCountInput: 'maxReadRequestOperationCount',
        maxOutstandingReadRequestsInput: 'maxOutstandingReadRequests',
        maxReadRequestSizeInput: 'maxReadRequestSize',
        maxWriteRequestOperationCountInput: 'maxWriteRequestOperationCount',
        maxWriteRequestSizeInput: 'maxWriteRequestSize',
        maxOutstandingWriteRequestsInput: 'maxOutstandingWriteRequests',
        maxWriteBufferCountInput: 'maxWriteBufferCount',
        maxWriteBufferSizeInput: 'maxWriteBufferSize',
        maxRetryDelayInput: 'maxRetryDelay',
        readPollTimeoutInput: 'readPollTimeout',
      };

      Object.entries(inputToPropMap).forEach(([input, prop]) => {
        const expected = FOLLOWER_INDEX_EDIT[prop];
        const { value } = find(input).props();
        try {
          expect(value).toBe(expected);
        } catch {
          throw new Error(
            `Input "${input}" does not equal "${expected}". (Value received: "${value}")`
          );
        }
      });
    });
  });

  describe('payload and API endpoint validation', () => {
    const remoteClusters = [{ name: 'new-york', seeds: ['localhost:123'], isConnected: true }];
    let testBed;

    beforeEach(async () => {
      httpRequestsMockHelpers.setLoadRemoteClustersResponse(remoteClusters);
      httpRequestsMockHelpers.setGetFollowerIndexResponse(FOLLOWER_INDEX_EDIT);

      testBed = await setup();
      await testBed.waitFor('followerIndexForm');
    });

    test('should send the correct payload', async () => {
      const { actions, form, component, find, waitFor } = testBed;
      const maxRetryDelay = getRandomString();

      form.setInputValue('maxRetryDelayInput', maxRetryDelay);

      actions.clickSaveForm();
      component.update(); // The modal to confirm the update opens
      await waitFor('confirmModalTitleText');
      find('confirmModalConfirmButton').simulate('click');

      await nextTick(); // Make sure the Request went through

      const { method, path } = endPoints.get('followerIndex', 'edit', {
        id: FOLLOWER_INDEX_EDIT.name,
      });

      // const path = `${API_BASE_PATH}/follower_indices/${FOLLOWER_INDEX_EDIT.name}`;
      // const method = 'post';

      const expectedBody = { ...FOLLOWER_INDEX_EDIT, maxRetryDelay };
      delete expectedBody.name;
      delete expectedBody.remoteCluster;
      delete expectedBody.leaderIndex;
      delete expectedBody.status;

      const latestRequest = server.requests[server.requests.length - 1];
      const requestBody = JSON.parse(JSON.parse(latestRequest.requestBody).body);

      // Validate the API endpoint called: method, path and payload
      expect(latestRequest.method).toBe(method.toUpperCase());
      expect(latestRequest.url).toBe(path);
      expect(requestBody).toEqual(expectedBody);
    });
  });

  describe('when the remote cluster is disconnected', () => {
    let find;
    let exists;
    let component;
    let actions;
    let form;

    beforeEach(async () => {
      httpRequestsMockHelpers.setLoadRemoteClustersResponse([
        { name: 'new-york', seeds: ['localhost:123'], isConnected: false },
      ]);
      httpRequestsMockHelpers.setGetFollowerIndexResponse(FOLLOWER_INDEX_EDIT);
      ({ component, find, exists, actions, form } = setup());

      await nextTick();
      component.update();
    });

    test('should display an error and have a button to edit the remote cluster', () => {
      const error = find('remoteClusterFormField.notConnectedError');

      expect(error.length).toBe(1);
      expect(error.find('.euiCallOutHeader__title').text()).toBe(
        `Can't edit follower index because remote cluster '${FOLLOWER_INDEX_EDIT.remoteCluster}' is not connected`
      );
      expect(exists('remoteClusterFormField.notConnectedError.editButton')).toBe(true);
    });

    test('should prevent saving the form and display an error message for the required remote cluster', () => {
      actions.clickSaveForm();

      expect(form.getErrorsMessages()).toEqual(['A connected remote cluster is required.']);
      expect(find('submitButton').props().disabled).toBe(true);
    });
  });
});
