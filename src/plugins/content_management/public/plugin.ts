/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { CoreSetup, Plugin } from '@kbn/core/public';
import { ManagementAppMountParams, ManagementSetup } from '@kbn/management-plugin/public';
import { PLUGIN_ID } from '../common';
import { RpcClient } from './rpc';
import type { Context } from './demo-app';
import { ContentManagementPublicStart, ContentManagementPublicSetup } from './types';
import { ContentClient } from './content_client';
import { ContentRegistry } from './registry';

interface SetupDependencies {
  management: ManagementSetup;
}

export class ContentManagementPlugin implements Plugin {
  private rpcClient: RpcClient | undefined;
  private contentClient: ContentClient | undefined;
  private contentRegistry: ContentRegistry | undefined;

  public setup(core: CoreSetup, { management }: SetupDependencies): ContentManagementPublicSetup {
    const httpClient = {
      post: core.http.post,
    };

    const rpcClient = new RpcClient(httpClient);
    const registry = new ContentRegistry();
    const contentClient = new ContentClient(rpcClient);
    this.contentRegistry = registry;
    this.rpcClient = rpcClient;
    this.contentClient = contentClient;

    this.contentRegistry.register({
      id: 'foo',
      name: 'Foo',
      description: 'Foo content',
      icon: 'accessibility',
    });

    management.sections.section.kibana.registerApp({
      id: PLUGIN_ID,
      title: 'Content Management',
      order: 1,
      async mount(params: ManagementAppMountParams) {
        if (!rpcClient) {
          throw new Error('Rcp client has not been initialized');
        }

        const { mountApp } = await import('./demo-app/mount_app');
        const [coreStart] = await core.getStartServices();
        const ctx: Context = {
          rpc: rpcClient,
          contentClient,
          contentRegistry: registry,
        };
        return mountApp(coreStart, ctx, params);
      },
    });

    return {
      registry: this.contentRegistry,
    };
  }

  public start(): ContentManagementPublicStart {
    if (!this.rpcClient) {
      throw new Error('Rcp client has not been initialized');
    }

    if (!this.contentClient) {
      throw new Error('ContentQueryClient has not been initialized');
    }

    if (!this.contentRegistry) {
      throw new Error('ContentRegistry has not been initialized');
    }

    return {
      client: this.contentClient,
      registry: this.contentRegistry,
    };
  }
}
