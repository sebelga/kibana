/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';
import type { RpcClient } from '../rpc';
import { createQueryObservable } from './query_observable';
import type { SearchIn } from '../../common';
import { CreateIn, CreateOut } from '../../common';

const contentQueryKeyBuilder = {
  all: (type?: string) => [type ? type : '*'] as const,
  // lists: (type: string) => [...contentQueryKeyBuilder.all(type), 'list'] as const,
  // list: (type: string, filters: any) =>
  //   [...contentQueryKeyBuilder.lists(type), { filters }] as const,
  item: (type: string, id: string) => {
    return [...contentQueryKeyBuilder.all(type), id] as const;
  },
  itemPreview: (type: string, id: string) => {
    return [...contentQueryKeyBuilder.item(type, id), 'preview'] as const;
  },
  search: (searchParams: SearchIn = {}) => {
    const { type, ...otherParams } = searchParams;
    return [...contentQueryKeyBuilder.all(type), 'search', otherParams] as const;
  },
};

const createContentQueryOptionBuilder = ({ rpcClient }: { rpcClient: RpcClient }) => {
  return {
    get: <TContentItem extends object = object>(type: string, id: string) => {
      return {
        queryKey: contentQueryKeyBuilder.item(type, id),
        queryFn: () => rpcClient.get<TContentItem>({ type, id }),
      };
    },
    getPreview: (type: string, id: string) => {
      return {
        queryKey: contentQueryKeyBuilder.itemPreview(type, id),
        queryFn: () => rpcClient.getPreview({ type, id }),
      };
    },
    search: (searchParams: SearchIn) => {
      return {
        queryKey: contentQueryKeyBuilder.search(searchParams),
        queryFn: () => rpcClient.search(searchParams),
      };
    },
  };
};

export class ContentClient {
  private readonly queryClient: QueryClient;
  private readonly contentQueryOptionBuilder: ReturnType<typeof createContentQueryOptionBuilder>;

  public get _queryClient() {
    return this.queryClient;
  }

  public get _contentItemQueryOptionBuilder() {
    return this.contentQueryOptionBuilder;
  }

  constructor(private readonly rpcClient: RpcClient) {
    this.queryClient = new QueryClient();
    this.contentQueryOptionBuilder = createContentQueryOptionBuilder({
      rpcClient: this.rpcClient,
    });
  }

  get<ContentItem extends object = object>({
    type,
    id,
  }: {
    type: string;
    id: string;
  }): Promise<ContentItem> {
    return this.queryClient.fetchQuery(this.contentQueryOptionBuilder.get<ContentItem>(type, id));
  }

  get$<ContentItem extends object = object>({ type, id }: { type: string; id: string }) {
    return createQueryObservable<ContentItem>(
      this.queryClient,
      this.contentQueryOptionBuilder.get(type, id)
    );
  }

  getPreview({ type, id }: { type: string; id: string }) {
    return this.queryClient.fetchQuery(this.contentQueryOptionBuilder.getPreview(type, id));
  }

  getPreview$({ type, id }: { type: string; id: string }) {
    return createQueryObservable(
      this.queryClient,
      this.contentQueryOptionBuilder.getPreview(type, id)
    );
  }

  search(searchParams: SearchIn) {
    return this.queryClient.fetchQuery(this.contentQueryOptionBuilder.search(searchParams));
  }

  search$(searchParams: SearchIn) {
    return createQueryObservable(
      this.queryClient,
      this.contentQueryOptionBuilder.search(searchParams)
    );
  }

  create<I extends object, O extends CreateOut, Options extends object | undefined = undefined>(
    input: CreateIn<I, Options>
  ): Promise<O> {
    return this.rpcClient.create(input);
  }
}

const ContentClientContext = React.createContext<ContentClient>(null as unknown as ContentClient);

export const useContentClient = (): ContentClient => {
  const contentClient = React.useContext(ContentClientContext);
  if (!contentClient) throw new Error('contentClient not found');
  return contentClient;
};

export const ContentClientProvider: React.FC<{ contentClient: ContentClient }> = ({
  contentClient,
  children,
}) => {
  return (
    <ContentClientContext.Provider value={contentClient}>
      <QueryClientProvider client={contentClient._queryClient}>{children}</QueryClientProvider>
    </ContentClientContext.Provider>
  );
};

export const useContentItem = <ContentItem extends object = object>(
  {
    id,
    type,
  }: {
    id: string;
    type: string;
  },
  queryOptions: { enabled?: boolean } = { enabled: true }
) => {
  const contentQueryClient = useContentClient();
  const query = useQuery({
    ...contentQueryClient._contentItemQueryOptionBuilder.get<ContentItem>(type, id),
    ...queryOptions,
  });
  return query;
};

export const useContentItemPreview = (
  {
    id,
    type,
  }: {
    id: string;
    type: string;
  },
  queryOptions: { enabled?: boolean } = { enabled: true }
) => {
  const contentQueryClient = useContentClient();
  const query = useQuery({
    ...contentQueryClient._contentItemQueryOptionBuilder.getPreview(type, id),
    ...queryOptions,
  });
  return query;
};

export const useContentSearch = (
  searchParams: SearchIn = {},
  queryOptions: { enabled?: boolean } = { enabled: true }
) => {
  const contentQueryClient = useContentClient();
  const query = useQuery({
    ...contentQueryClient._contentItemQueryOptionBuilder.search(searchParams),
    ...queryOptions,
  });
  return query;
};

export const useCreateContentItemMutation = <
  I extends object,
  O extends CreateOut,
  Options extends object | undefined = undefined
>() => {
  const contentQueryClient = useContentClient();
  return useMutation({
    mutationFn: (input: CreateIn<I, Options>) => {
      return contentQueryClient.create(input);
    },
  });
};
