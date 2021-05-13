/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import { HttpSetup } from 'src/core/public';
import { API_BASE_PATH } from '../../common/constants';
import { useRequest, UseRequestResponse } from '../shared_imports';

type FieldPreviewContext =
  | 'boolean_field'
  | 'date_field'
  | 'double_field'
  | 'geo_point_field'
  | 'ip_field'
  | 'keyword_field'
  | 'long_field';

export const initApi = (httpClient: HttpSetup) => {
  const useFieldPreview = ({
    index,
    context,
    script,
    document,
  }: {
    index: string;
    context: FieldPreviewContext;
    script: { source: string } | null;
    document: Record<string, any>;
  }): UseRequestResponse => {
    return useRequest(httpClient, {
      method: 'post',
      path: `${API_BASE_PATH}/field_preview`,
      body: {
        index,
        context,
        script,
        document,
      },
    });
  };

  return {
    useFieldPreview,
  };
};

export type ApiService = ReturnType<typeof initApi>;
