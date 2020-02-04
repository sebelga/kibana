/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { schema } from '@kbn/config-schema';

import { RouteDependencies } from '../../../types';
import { addBasePath } from '../index';

const paramsSchema = schema.object({
  indexName: schema.string(),
});

function formatHit(hit: { _shards: any; indices: { [key: string]: any } }, indexName: string) {
  const { _shards, indices } = hit;
  const stats = indices[indexName];
  return {
    _shards,
    stats,
  };
}

export function registerStatsRoute({ router }: RouteDependencies) {
  router.get(
    { path: addBasePath('/stats/{indexName}'), validate: { params: paramsSchema } },
    async (ctx, req, res) => {
      const { indexName } = req.params;
      const params = {
        expand_wildcards: 'none',
        index: indexName,
      };
      const hit = await ctx.core.elasticsearch.dataClient.callAsCurrentUser(
        'indices.stats',
        params
      );

      return res.ok({ body: formatHit(hit, indexName) });
    }
  );
}
