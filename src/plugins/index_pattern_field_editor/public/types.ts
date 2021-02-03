/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * and the Server Side Public License, v 1; you may not use this file except in
 * compliance with, at your election, the Elastic License or the Server Side
 * Public License, v 1.
 */

import { FunctionComponent } from 'react';
import { DataPublicPluginStart, RuntimeField, FieldFormat } from './shared_imports';

import { OpenFieldEditorOptions } from './open_editor';
import { FormatEditorServiceSetup, FormatEditorServiceStart } from './service';
import { DeleteProviderProps } from './components/delete_field_provider';

export interface PluginSetup {
  fieldFormatEditors: FormatEditorServiceSetup['fieldFormatEditors'];
}

export interface PluginStart {
  openEditor(options: OpenFieldEditorOptions): () => void;
  fieldFormatEditors: FormatEditorServiceStart['fieldFormatEditors'];
  userPermissions: {
    editIndexPattern: () => boolean;
  };
  DeleteRuntimeFieldProvider: FunctionComponent<DeleteProviderProps>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SetupPlugins {}

export interface StartPlugins {
  data: DataPublicPluginStart;
}

export type InternalFieldType = 'concrete' | 'runtime';

export interface Field {
  name: string;
  type?: RuntimeField['type'] | string;
  script?: RuntimeField['script'];
  customLabel?: string;
  popularity?: number;
  format?: ReturnType<FieldFormat['toJSON']>;
}
