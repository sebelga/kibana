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

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

import { HttpSetup } from '../../../../../src/core/public';
import {
  sendRequest as _sendRequest,
  SendRequestConfig,
  SendRequestResponse,
} from './send_request';

export interface UseRequestConfig extends SendRequestConfig {
  pollIntervalMs?: number;
  initialData?: any;
  deserializer?: (data: any) => any;
}

export interface UseRequestResponse<D = any, E = Error> {
  isInitialRequest: boolean;
  isLoading: boolean;
  error: E | null;
  data?: D | null;
  sendRequest: () => Promise<SendRequestResponse<D | null, E | null>>;
}

export const useRequest = <D = any, E = Error>(
  httpClient: HttpSetup,
  {
    path,
    method,
    query: _query,
    body: _body,
    pollIntervalMs,
    initialData,
    deserializer,
  }: UseRequestConfig
): UseRequestResponse<D, E> => {
  const isMounted = useRef(false);
  const pollIntervalIdRef = useRef<any>(null);

  // Main states for tracking request status and data
  const [error, setError] = useState<null | any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<any>(initialData);

  // Consumers can use isInitialRequest to implement a polling UX.
  const [totalRequests, setTotalRequests] = useState(0);
  const isInitialRequest = totalRequests === 0;

  // Convert our object to string to be able to compare them in our useMemo
  // This allows the consumer to freely passed new objects to the hook on each
  // render without asking him to memoize them.
  const bodyToString = _body ? JSON.stringify(_body) : undefined;
  const queryToString = _query ? JSON.stringify(_query) : undefined;

  const requestBody = useMemo(() => {
    return {
      path,
      method,
      query: queryToString ? JSON.parse(queryToString) : undefined,
      body: bodyToString ? JSON.parse(bodyToString) : undefined,
    };
  }, [path, method, queryToString, bodyToString]);

  const cleanUpPollInterval = useCallback(() => {
    if (pollIntervalIdRef.current) {
      clearTimeout(pollIntervalIdRef.current);
    }
  }, []);

  const sendRequest = useCallback(async () => {
    cleanUpPollInterval();

    // We don't clear error or data, so it's up to the consumer to decide whether to display the
    // "old" error/data or loading state when a new request is in-flight.
    setIsLoading(true);

    const response = await _sendRequest<D, E>(httpClient, requestBody);
    const { data: serializedResponseData, error: responseError } = response;

    if (isMounted.current === false) {
      return { data: null, error: null };
    }

    setIsLoading(false);
    setTotalRequests((prev) => prev + 1);

    setError(responseError);
    // If there's an error, keep the data from the last request in case it's still useful to the user.
    if (!responseError) {
      const responseData = deserializer
        ? deserializer(serializedResponseData)
        : serializedResponseData;
      setData(responseData);
    }

    return { data: serializedResponseData, error: responseError };
  }, [requestBody, httpClient, deserializer, cleanUpPollInterval]);

  const scheduleRequest = useCallback(() => {
    cleanUpPollInterval();

    if (pollIntervalMs) {
      pollIntervalIdRef.current = setTimeout(sendRequest, pollIntervalMs);
    }
  }, [pollIntervalMs, sendRequest, cleanUpPollInterval]);

  useEffect(() => {
    sendRequest();
  }, [sendRequest]);

  // Whenever the scheduleRequest() changes (which changes when the pollIntervalMs changes)
  // we schedule a new request
  useEffect(() => {
    scheduleRequest();
    return cleanUpPollInterval;
  }, [scheduleRequest, cleanUpPollInterval]);

  // Whenever the totalRequests state changes
  // we schedule a new request
  useEffect(() => {
    if (isMounted.current === false) {
      // Don't schedule on component mount
      return;
    }

    scheduleRequest();
    return cleanUpPollInterval;
  }, [totalRequests, scheduleRequest, cleanUpPollInterval]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      // When the component unmounts, clear any existing interval.
      cleanUpPollInterval();
    };
  }, [cleanUpPollInterval]);

  return {
    isInitialRequest,
    isLoading,
    error,
    data,
    sendRequest, // Gives the user the ability to manually request data
  };
};
