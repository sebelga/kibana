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

// Reusable lib accross our apps
import { EndpointDefinition, createEndPointsGetter } from './my_lib';

import { API_BASE_PATH } from './constants';

// Follower indices
const followerIndexEndpoints = {
  list: {
    method: 'get',
    path: `${API_BASE_PATH}/follower_indices`,
  } as EndpointDefinition,
  get: {
    method: 'get',
    path: `${API_BASE_PATH}/follower_indices/{id}`,
  } as EndpointDefinition,
  create: {
    method: 'post',
    path: `${API_BASE_PATH}/follower_indices`,
  } as EndpointDefinition,
  edit: {
    method: 'put',
    path: `${API_BASE_PATH}/follower_indices/{id}`,
  } as EndpointDefinition,
  delete: {
    method: 'delete',
    path: `${API_BASE_PATH}/follower_indices/{id}`,
  } as EndpointDefinition,
};

const autoFollowPatternEndpoints = {
  list: {
    method: 'get',
    path: `${API_BASE_PATH}/auto-follow-patterns`,
  } as EndpointDefinition,
  get: {
    method: 'get',
    path: `${API_BASE_PATH}/auto-follow-patterns/{id}`,
  } as EndpointDefinition,
  create: {
    method: 'post',
    path: `${API_BASE_PATH}/auto-follow-patterns`,
  } as EndpointDefinition,
  edit: {
    method: 'put',
    path: `${API_BASE_PATH}/auto-follow-patterns/{id}`,
  } as EndpointDefinition,
  delete: {
    method: 'delete',
    path: `${API_BASE_PATH}/auto-follow-patterns/{id}`,
  } as EndpointDefinition,
  pause: {
    method: 'post',
    path: `${API_BASE_PATH}/auto-follow-patterns/{id}/pause`,
  } as EndpointDefinition,
  resume: {
    method: 'post',
    path: `${API_BASE_PATH}/auto-follow-patterns/{id}/resume`,
  } as EndpointDefinition,
};

// Redux like reducer composition
const ccrRoutesEndpoints = {
  followerIndex: followerIndexEndpoints,
  autoFollowPattern: autoFollowPatternEndpoints,
};

export const endPoints = {
  get: createEndPointsGetter(ccrRoutesEndpoints),
};
