/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Boom from 'boom';
import { ResponseObject } from 'hapi';
import { Legacy } from 'kibana';
import { ReportingCore } from '../';
import { API_BASE_URL } from '../../common/constants';
import { LevelLogger as Logger } from '../lib';
import { jobsQueryFactory } from '../lib/jobs_query';
import { JobDocOutput, JobSource, ReportingSetupDeps, ServerFacade } from '../types';
import {
  deleteJobResponseHandlerFactory,
  downloadJobResponseHandlerFactory,
} from './lib/job_response_handler';
import { makeRequestFacade } from './lib/make_request_facade';
import {
  getRouteConfigFactoryDeletePre,
  getRouteConfigFactoryDownloadPre,
  getRouteConfigFactoryManagementPre,
} from './lib/route_config_factories';
import { ReportingResponseToolkit } from './types';

interface ListQuery {
  page: string;
  size: string;
  ids?: string; // optional field forbids us from extending RequestQuery
}
const MAIN_ENTRY = `${API_BASE_URL}/jobs`;

function isResponse(response: Boom<null> | ResponseObject): response is ResponseObject {
  return !(response as Boom<unknown>).isBoom;
}

export function registerJobInfoRoutes(
  reporting: ReportingCore,
  server: ServerFacade,
  plugins: ReportingSetupDeps,
  logger: Logger
) {
  const config = reporting.getConfig();
  const { elasticsearch } = plugins;
  const jobsQuery = jobsQueryFactory(config, elasticsearch);
  const getRouteConfig = getRouteConfigFactoryManagementPre(config, plugins, logger);

  // list jobs in the queue, paginated
  server.route({
    path: `${MAIN_ENTRY}/list`,
    method: 'GET',
    options: getRouteConfig(),
    handler: (legacyRequest: Legacy.Request) => {
      const request = makeRequestFacade(legacyRequest);
      const { page: queryPage, size: querySize, ids: queryIds } = request.query as ListQuery;
      const page = parseInt(queryPage, 10) || 0;
      const size = Math.min(100, parseInt(querySize, 10) || 10);
      const jobIds = queryIds ? queryIds.split(',') : null;

      const results = jobsQuery.list(
        request.pre.management.jobTypes,
        request.pre.user,
        page,
        size,
        jobIds
      );
      return results;
    },
  });

  // return the count of all jobs in the queue
  server.route({
    path: `${MAIN_ENTRY}/count`,
    method: 'GET',
    options: getRouteConfig(),
    handler: (legacyRequest: Legacy.Request) => {
      const request = makeRequestFacade(legacyRequest);
      const results = jobsQuery.count(request.pre.management.jobTypes, request.pre.user);
      return results;
    },
  });

  // return the raw output from a job
  server.route({
    path: `${MAIN_ENTRY}/output/{docId}`,
    method: 'GET',
    options: getRouteConfig(),
    handler: (legacyRequest: Legacy.Request) => {
      const request = makeRequestFacade(legacyRequest);
      const { docId } = request.params;

      return jobsQuery.get(request.pre.user, docId, { includeContent: true }).then(
        (result): JobDocOutput => {
          if (!result) {
            throw Boom.notFound();
          }
          const {
            _source: { jobtype: jobType, output: jobOutput },
          } = result;

          if (!request.pre.management.jobTypes.includes(jobType)) {
            throw Boom.unauthorized(`Sorry, you are not authorized to download ${jobType} reports`);
          }

          return jobOutput;
        }
      );
    },
  });

  // return some info about the job
  server.route({
    path: `${MAIN_ENTRY}/info/{docId}`,
    method: 'GET',
    options: getRouteConfig(),
    handler: (legacyRequest: Legacy.Request) => {
      const request = makeRequestFacade(legacyRequest);
      const { docId } = request.params;

      return jobsQuery.get(request.pre.user, docId).then((result): JobSource<any>['_source'] => {
        if (!result) {
          throw Boom.notFound();
        }

        const { _source: job } = result;
        const { jobtype: jobType, payload: jobPayload } = job;
        if (!request.pre.management.jobTypes.includes(jobType)) {
          throw Boom.unauthorized(`Sorry, you are not authorized to view ${jobType} info`);
        }

        return {
          ...job,
          payload: {
            ...jobPayload,
            headers: undefined,
          },
        };
      });
    },
  });

  // trigger a download of the output from a job
  const exportTypesRegistry = reporting.getExportTypesRegistry();
  const getRouteConfigDownload = getRouteConfigFactoryDownloadPre(config, plugins, logger);
  const downloadResponseHandler = downloadJobResponseHandlerFactory(config, elasticsearch, exportTypesRegistry); // prettier-ignore
  server.route({
    path: `${MAIN_ENTRY}/download/{docId}`,
    method: 'GET',
    options: getRouteConfigDownload(),
    handler: async (legacyRequest: Legacy.Request, h: ReportingResponseToolkit) => {
      const request = makeRequestFacade(legacyRequest);
      const { docId } = request.params;

      let response = await downloadResponseHandler(
        request.pre.management.jobTypes,
        request.pre.user,
        h,
        { docId }
      );

      if (isResponse(response)) {
        const { statusCode } = response;

        if (statusCode !== 200) {
          if (statusCode === 500) {
            logger.error(`Report ${docId} has failed: ${JSON.stringify(response.source)}`);
          } else {
            logger.debug(
              `Report ${docId} has non-OK status: [${statusCode}] Reason: [${JSON.stringify(
                response.source
              )}]`
            );
          }
        }

        response = response.header('accept-ranges', 'none');
      }

      return response;
    },
  });

  // allow a report to be deleted
  const getRouteConfigDelete = getRouteConfigFactoryDeletePre(config, plugins, logger);
  const deleteResponseHandler = deleteJobResponseHandlerFactory(config, elasticsearch);
  server.route({
    path: `${MAIN_ENTRY}/delete/{docId}`,
    method: 'DELETE',
    options: getRouteConfigDelete(),
    handler: async (legacyRequest: Legacy.Request, h: ReportingResponseToolkit) => {
      const request = makeRequestFacade(legacyRequest);
      const { docId } = request.params;

      let response = await deleteResponseHandler(
        request.pre.management.jobTypes,
        request.pre.user,
        h,
        { docId }
      );

      if (isResponse(response)) {
        const { statusCode } = response;

        if (statusCode !== 200) {
          if (statusCode === 500) {
            logger.error(`Report ${docId} has failed: ${JSON.stringify(response.source)}`);
          } else {
            logger.debug(
              `Report ${docId} has non-OK status: [${statusCode}] Reason: [${JSON.stringify(
                response.source
              )}]`
            );
          }
        }

        response = response.header('accept-ranges', 'none');
      }

      return response;
    },
  });
}
