/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

export const DISCOVER_APP_ID = 'discover';

export const DASHBOARD_APP_ID = 'dashboard';

export const VISUALIZE_APP_ID = 'visualize';

export type AppId = typeof DISCOVER_APP_ID | typeof DASHBOARD_APP_ID | typeof VISUALIZE_APP_ID;

export type DeepLinkId = AppId;
