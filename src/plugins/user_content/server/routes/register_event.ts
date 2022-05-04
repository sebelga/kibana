/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { schema } from '@kbn/config-schema';
import { IRouter } from '@kbn/core/server';

import { withApiBaseBath } from '../../common';
import { incrementViewsCounters } from '../lib';
import { eventTypeSchema } from './schemas';

import type { RouteDependencies } from './types';

export const registerRegisterEventRoute = (
  router: IRouter,
  { depsFromPluginStartPromise }: RouteDependencies
) => {
  router.post(
    {
      path: withApiBaseBath('/event/{eventType}'),
      validate: {
        params: schema.object({
          eventType: eventTypeSchema,
        }),
        body: schema.object({
          soId: schema.string(),
          soType: schema.string(),
        }),
      },
    },
    router.handleLegacyErrors(async (context, req, res) => {
      const { body, params } = req;

      const { userContentEventsStream, savedObjectRepository } = await depsFromPluginStartPromise;

      if (params.eventType.startsWith('viewed')) {
        incrementViewsCounters(body.soType, body.soId, savedObjectRepository);
      }

      userContentEventsStream.registerEvent({
        type: params.eventType,
        data: {
          so_id: body.soId,
          so_type: body.soType,
        },
      });

      return res.ok({
        body: 'ok',
      });
    })
  );
};
