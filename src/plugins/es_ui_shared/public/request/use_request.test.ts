/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { act } from 'react-dom/test-utils';
import sinon from 'sinon';

import { UseRequestHelpers, REQUEST_TIME, createUseRequestHelpers } from './use_request.helpers';

describe('useRequest hook', () => {
  let helpers: UseRequestHelpers;

  beforeEach(() => {
    helpers = createUseRequestHelpers();
  });

  describe('parameters', () => {
    describe('path, method, body', () => {
      it('is used to send the request', async () => {
        const { setupSuccessRequest, completeRequest, hookResult, getSuccessResponse } = helpers;
        setupSuccessRequest();
        await completeRequest();
        expect(hookResult.data).toBe(getSuccessResponse().data);
      });
    });

    describe('pollIntervalMs', () => {
      it('sends another request after the specified time has elapsed', async () => {
        const { setupSuccessRequest, advanceTime, getSendRequestSpy } = helpers;
        setupSuccessRequest({ pollIntervalMs: REQUEST_TIME });

        await advanceTime(REQUEST_TIME);
        expect(getSendRequestSpy().callCount).toBe(1);

        await advanceTime(REQUEST_TIME);
        expect(getSendRequestSpy().callCount).toBe(2);

        await advanceTime(REQUEST_TIME);
        expect(getSendRequestSpy().callCount).toBe(3);
      });
    });

    describe('initialData', () => {
      it('sets the initial data value', async () => {
        const { setupSuccessRequest, completeRequest, hookResult, getSuccessResponse } = helpers;
        setupSuccessRequest({ initialData: 'initialData' });
        expect(hookResult.data).toBe('initialData');

        // The initial data value will be overwritten once the request resolves.
        await completeRequest();
        expect(hookResult.data).toBe(getSuccessResponse().data);
      });
    });

    describe('deserializer', () => {
      it('is called with the response once the request resolves', async () => {
        const { setupSuccessRequest, completeRequest, getSuccessResponse } = helpers;

        const deserializer = sinon.stub();
        setupSuccessRequest({ deserializer });
        sinon.assert.notCalled(deserializer);
        await completeRequest();

        sinon.assert.calledOnce(deserializer);
        sinon.assert.calledWith(deserializer, getSuccessResponse().data);
      });

      it('processes data', async () => {
        const { setupSuccessRequest, completeRequest, hookResult } = helpers;
        setupSuccessRequest({ deserializer: () => 'intercepted' });
        await completeRequest();
        expect(hookResult.data).toBe('intercepted');
      });
    });
  });

  describe('state', () => {
    describe('isInitialRequest', () => {
      it('is true for the first request and false for subsequent requests', async () => {
        const { setupSuccessRequest, completeRequest, hookResult } = helpers;
        setupSuccessRequest();
        expect(hookResult.isInitialRequest).toBe(true);

        hookResult.sendRequest();
        await completeRequest();
        expect(hookResult.isInitialRequest).toBe(false);
      });
    });

    describe('isLoading', () => {
      it('represents in-flight request status', async () => {
        const { setupSuccessRequest, completeRequest, hookResult } = helpers;
        setupSuccessRequest();
        expect(hookResult.isLoading).toBe(true);

        await completeRequest();
        expect(hookResult.isLoading).toBe(false);
      });
    });

    describe('error', () => {
      it('surfaces errors from requests', async () => {
        const { setupErrorRequest, completeRequest, hookResult, getErrorResponse } = helpers;
        setupErrorRequest();
        await completeRequest();
        expect(hookResult.error).toBe(getErrorResponse().error);
      });

      it('surfaces body-shaped errors from requests', async () => {
        const {
          setupErrorWithBodyRequest,
          completeRequest,
          hookResult,
          getErrorWithBodyResponse,
        } = helpers;

        setupErrorWithBodyRequest();
        await completeRequest();
        expect(hookResult.error).toBe(getErrorWithBodyResponse().error);
      });

      it('persists while a request is in-flight', async () => {
        const { setupErrorRequest, completeRequest, hookResult, getErrorResponse } = helpers;
        setupErrorRequest();
        await completeRequest();
        expect(hookResult.isLoading).toBe(false);
        expect(hookResult.error).toBe(getErrorResponse().error);

        act(() => {
          hookResult.sendRequest();
        });
        expect(hookResult.isLoading).toBe(true);
        expect(hookResult.error).toBe(getErrorResponse().error);
      });

      it('is null when the request is successful', async () => {
        const { setupSuccessRequest, completeRequest, hookResult } = helpers;
        setupSuccessRequest();
        expect(hookResult.error).toBeNull();

        await completeRequest();
        expect(hookResult.isLoading).toBe(false);
        expect(hookResult.error).toBeNull();
      });
    });

    describe('data', () => {
      it('surfaces payloads from requests', async () => {
        const { setupSuccessRequest, completeRequest, hookResult, getSuccessResponse } = helpers;
        setupSuccessRequest();
        expect(hookResult.data).toBeUndefined();

        await completeRequest();
        expect(hookResult.data).toBe(getSuccessResponse().data);
      });

      it('persists while a request is in-flight', async () => {
        const { setupSuccessRequest, completeRequest, hookResult, getSuccessResponse } = helpers;
        setupSuccessRequest();
        await completeRequest();
        expect(hookResult.isLoading).toBe(false);
        expect(hookResult.data).toBe(getSuccessResponse().data);

        act(() => {
          hookResult.sendRequest();
        });
        expect(hookResult.isLoading).toBe(true);
        expect(hookResult.data).toBe(getSuccessResponse().data);
      });

      it('persists from last successful request when the next request fails', async () => {
        const {
          setupSuccessRequest,
          completeRequest,
          hookResult,
          getErrorResponse,
          setErrorResponse,
          getSuccessResponse,
        } = helpers;

        setupSuccessRequest();
        await completeRequest();
        expect(hookResult.isLoading).toBe(false);
        expect(hookResult.error).toBeNull();
        expect(hookResult.data).toBe(getSuccessResponse().data);

        act(() => setErrorResponse());
        await completeRequest();
        expect(hookResult.isLoading).toBe(false);
        expect(hookResult.error).toBe(getErrorResponse().error);
        expect(hookResult.data).toBe(getSuccessResponse().data);
      });
    });
  });

  describe('callbacks', () => {
    describe('sendRequest', () => {
      it('sends the request', async () => {
        const { setupSuccessRequest, completeRequest, hookResult, getSendRequestSpy } = helpers;
        setupSuccessRequest();

        await completeRequest();
        expect(getSendRequestSpy().callCount).toBe(1);

        await act(async () => {
          hookResult.sendRequest();
          await completeRequest();
        });
        expect(getSendRequestSpy().callCount).toBe(2);
      });

      it('resets the pollIntervalMs', async () => {
        const { setupSuccessRequest, advanceTime, hookResult, getSendRequestSpy } = helpers;
        const DOUBLE_REQUEST_TIME = REQUEST_TIME * 2 + 50; // We add 50 to avoid a race condition
        setupSuccessRequest({ pollIntervalMs: DOUBLE_REQUEST_TIME });

        // The initial request resolves, and then we'll immediately send a new one manually...
        await advanceTime(REQUEST_TIME);
        expect(getSendRequestSpy().callCount).toBe(1);

        act(() => {
          hookResult.sendRequest();
        });

        // The manual request resolves, and we'll send yet another one...
        await advanceTime(REQUEST_TIME);
        expect(getSendRequestSpy().callCount).toBe(2);
        act(() => {
          hookResult.sendRequest();
        });

        // At this point, we've moved forward 3000 ms. The poll is set at 2050s. If sendRequest didn't
        // reset the poll, the request call count would be 4, not 3.
        await advanceTime(REQUEST_TIME);
        expect(getSendRequestSpy().callCount).toBe(3);
      });

      it(`doesn't block requests that are in flight`, async () => {
        const {
          setupSuccessRequest,
          advanceTime,
          hookResult,
          getSendRequestSpy,
          getSuccessResponse,
        } = helpers;

        const HALF_REQUEST_TIME = REQUEST_TIME * 0.5;
        setupSuccessRequest({ pollIntervalMs: REQUEST_TIME });

        // We'll interrupt the poll with a sendRequest call before the original request resolves.
        await advanceTime(HALF_REQUEST_TIME);
        expect(getSendRequestSpy().callCount).toBe(0);
        act(() => {
          hookResult.sendRequest();
        });

        // The original request will resolve and still set its result, despite the sendRequest call
        // "interrupting" it.
        await advanceTime(HALF_REQUEST_TIME);
        expect(getSendRequestSpy().callCount).toBe(1);
        expect(hookResult.data).toBe(getSuccessResponse().data);
      });
    });
  });
});
