/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

type Method = 'get' | 'post' | 'put' | 'delete' | 'head';

export interface EndpointDefinition {
  method: Method;
  path: string;
}

const replacePlaceholders = (path: string, data: { [key: string]: any }): string =>
  Object.entries(data).reduce((updatedPath, [key, value]) => {
    const regEx = new RegExp(`{${key}}`);
    return updatedPath.replace(regEx, value);
  }, path);

export const createEndPointsGetter = <T>(appEndPoints: T) => <
  S extends keyof T,
  E extends keyof T[S]
>(
  section: S,
  endpoint: E,
  data?: { [key: string]: any }
): EndpointDefinition => {
  const endpointDefinition = (appEndPoints[section][endpoint] as unknown) as EndpointDefinition;

  return data
    ? { ...endpointDefinition, path: replacePlaceholders(endpointDefinition.path, data) } // Replace placeholders with data
    : endpointDefinition;
};
