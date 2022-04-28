/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { IRouter } from '@kbn/core/server';

import { withApiBaseBath } from '../../common';
import type { RouteDependencies } from './types';

export const registerUpdateViewsCountRoute = (
  router: IRouter,
  { metadataEventsService }: RouteDependencies
) => {
  router.post(
    {
      path: withApiBaseBath('/update_views_count'),
      validate: false,
    },
    router.handleLegacyErrors(async (context, req, res) => {
      const result = await metadataEventsService.updateViewCounts();

      return res.ok({
        body: result,
      });
    })
  );
};
