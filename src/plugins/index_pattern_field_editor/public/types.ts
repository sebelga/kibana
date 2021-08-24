/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { FunctionComponent } from 'react';

import {
  DataPublicPluginStart,
  RuntimeField,
  UsageCollectionStart,
  EnhancedRuntimeField,
} from './shared_imports';
import { OpenFieldEditorOptions } from './open_editor';
import { OpenFieldDeleteModalOptions } from './open_delete_modal';
import { FormatEditorServiceSetup, FormatEditorServiceStart } from './service';
import { DeleteFieldProviderProps } from './components';

export interface PluginSetup {
  fieldFormatEditors: FormatEditorServiceSetup['fieldFormatEditors'];
}

export interface PluginStart {
  openEditor(options: OpenFieldEditorOptions): () => void;
  openDeleteModal(options: OpenFieldDeleteModalOptions): () => void;
  fieldFormatEditors: FormatEditorServiceStart['fieldFormatEditors'];
  userPermissions: {
    editIndexPattern: () => boolean;
  };
  DeleteRuntimeFieldProvider: FunctionComponent<DeleteFieldProviderProps>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SetupPlugins {}

export interface StartPlugins {
  data: DataPublicPluginStart;
  usageCollection: UsageCollectionStart;
}

export type InternalFieldType = 'concrete' | 'runtime';

export interface Field extends EnhancedRuntimeField {
  name: string;
}

export interface CompositeField extends RuntimeField {
  type: 'composite';
  name: string;
  subFields: Record<string, EnhancedRuntimeField>;
}

export interface FieldFormatConfig {
  id: string;
  params?: { [key: string]: any };
}

export type CloseEditor = () => void;

export type FieldPreviewContext =
  | 'boolean_field'
  | 'date_field'
  | 'double_field'
  | 'geo_point_field'
  | 'ip_field'
  | 'keyword_field'
  | 'long_field';

export interface FieldPreviewResponse {
  values: unknown[];
  error?: Record<string, any>;
}
