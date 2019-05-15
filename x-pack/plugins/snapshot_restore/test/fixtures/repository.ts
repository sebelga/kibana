/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { getRandomString } from '../../../../test_utils';

const defaultSettings: any = { chunkSize: '10mb', location: '/tmp/es-backups' };

export const getRepository = ({
  name = getRandomString(),
  type = 'fs',
  settings = defaultSettings,
} = {}) => ({
  name,
  type,
  settings,
});
