/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

/**
 * --------------------------------------------------------
 * Single source of truth for the CCR routes endpoints
 * To be used in server, client and api integration tests
 * --------------------------------------------------------
 */

import { API_BASE_PATH } from './constants';

type Section = 'followerIndex';
type Method = 'get' | 'post' | 'put' | 'delete' | 'head';

interface EndpointDefinition {
  method: Method;
  path: string;
}

// Follower indices
const followerIndexEndpoints = {
  edit: {
    method: 'put',
    path: `${API_BASE_PATH}/follower_indices/{id}`,
  } as EndpointDefinition,
};

// TODO: Add autoFollowPatternEndpoints & ccrEndpoints

const ccrRoutesEndpoints = {
  followerIndex: followerIndexEndpoints,
};

type CcrRoutesEndPoints = typeof ccrRoutesEndpoints;

const replacePlaceholders = (path: string, data: { [key: string]: any }): string =>
  Object.entries(data).reduce((updatedPath, [key, value]) => {
    const regEx = new RegExp(`{${key}}`);
    return updatedPath.replace(regEx, value);
  }, path);

export const getEndpoint = <S extends Section, E extends keyof CcrRoutesEndPoints[S]>(
  section: S,
  endpoint: E,
  data?: { [key: string]: any }
): EndpointDefinition => {
  const endpointDefinition = (ccrRoutesEndpoints[section][
    endpoint
  ] as unknown) as EndpointDefinition;

  return data
    ? { ...endpointDefinition, path: replacePlaceholders(endpointDefinition.path, data) } // Replace placeholders with data
    : endpointDefinition;
};
