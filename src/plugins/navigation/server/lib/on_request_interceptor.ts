/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type {
  CoreSetup,
  KibanaRequest,
  LifecycleResponseFactory,
  OnPreRoutingToolkit,
} from '@kbn/core/server';

import { addSolutionIdToPath, getSolutionIdFromPath, stripSolutionIdFromPath } from '../../common';
import type { NavigationConfig } from '../config';
export interface OnRequestInterceptorDeps {
  http: CoreSetup['http'];
  defaultSolution: NavigationConfig['solutionNavigation']['defaultSolution'];
  getIsEnabledInGlobalSettings: () => Promise<boolean>;
}

export function initSolutionOnRequestInterceptor({
  http,
  defaultSolution,
  getIsEnabledInGlobalSettings,
}: OnRequestInterceptorDeps) {
  http.registerOnPreRouting(async function solutionOnPreRoutingHandler(
    request: KibanaRequest,
    response: LifecycleResponseFactory,
    toolkit: OnPreRoutingToolkit
  ) {
    const serverBasePath = http.basePath.serverBasePath;
    const requestBasePath = http.basePath.get(request);
    let path = request.url.pathname;
    let redirectUrl: string | null = null;
    const isRequestingApplication = path.includes('/app/');

    // If navigating within the context of a solution, then we store the Solution's URL Context on the request,
    // and rewrite the request to not include the solution identifier in the URL.
    let { solutionId, pathHasExplicitSolutionIdentifier } = getSolutionIdFromPath(
      path,
      serverBasePath
    );

    // To avoid a double full page reload in case no solutionId is in the base path when accessing
    // the first Kibana app (or the space selector screen), we proactively redirect to the default solution.
    // The client (`packages/core/chrome/core-chrome-browser-internal/src/project_navigation/project_navigation_service.ts`)
    // has a detection mechanism that will redirect to the correct solution if the current page
    // does not belong to this default solution.
    if (path.includes('spaces/space_selector') || isRequestingApplication) {
      const enabledInGlobalSettings = await getIsEnabledInGlobalSettings();
      if (enabledInGlobalSettings && !pathHasExplicitSolutionIdentifier) {
        solutionId = defaultSolution;
        path = addSolutionIdToPath('/', solutionId, path);
        pathHasExplicitSolutionIdentifier = true;
        redirectUrl = `${serverBasePath}${path}`;
      } else if (!enabledInGlobalSettings && pathHasExplicitSolutionIdentifier) {
        // We have a solutionId in the path but the feature is disabled in advanced settings
        // ---> Remove the solution id from the path
        solutionId = null;
        path = stripSolutionIdFromPath(path);
        pathHasExplicitSolutionIdentifier = false;
        redirectUrl = `${requestBasePath}${path}`;
      }
    }

    if (pathHasExplicitSolutionIdentifier) {
      const reqBasePath = `/n/${solutionId}`;

      const indexBasePath = path.indexOf(reqBasePath);
      const newPathname = stripSolutionIdFromPath(path) || '/';

      http.basePath.set(request, { id: 'solutions', basePath: reqBasePath, index: indexBasePath });

      if (redirectUrl) {
        return response.redirected({
          headers: { location: redirectUrl },
        });
      }

      return toolkit.rewriteUrl(`${newPathname}${request.url.search}`);
    } else if (redirectUrl) {
      return response.redirected({
        headers: { location: redirectUrl },
      });
    }

    return toolkit.next();
  });
}
