/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { get } from 'lodash';
import { DataType } from './config';

export const hasNestedProperties = (selectedDatatype: DataType) =>
  selectedDatatype === 'object' ||
  selectedDatatype === 'nested' ||
  selectedDatatype === 'text' ||
  selectedDatatype === 'keyword';

export const getNestedFieldsPropName = (selectedDatatype: DataType) => {
  if (selectedDatatype === 'text' || selectedDatatype === 'keyword') {
    return 'fields';
  } else if (selectedDatatype === 'object' || selectedDatatype === 'nested') {
    return 'properties';
  }
  return undefined;
};

// We use an old version of lodash that does not have the _.unset() utility method.
// We implement our own here.
export const unset = (object: Record<string, any>, path: string): boolean => {
  const pathToArray = path.split('.');
  let hasBeenRemoved: boolean;

  if (pathToArray.length === 1) {
    const [prop] = pathToArray;
    hasBeenRemoved = {}.hasOwnProperty.call(object, prop);
    delete object[prop];
  } else {
    const parentPath = pathToArray.slice(0, -1).join('.');
    const parentObject = get(object, parentPath);
    if (!parentObject || typeof parentObject !== 'object') {
      hasBeenRemoved = false;
    } else {
      const prop = pathToArray[pathToArray.length - 1];
      hasBeenRemoved = {}.hasOwnProperty.call(parentObject, prop);
      delete (parentObject as any)[prop];
    }
  }

  return hasBeenRemoved;
};
