/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  FormLibDemo1,
  FormLibDemo2,
  FormLibDemo3,
  FormLibDemo4,
  FormLibDemo5,
} from './form_lib_demos';

import {
  ValidationBasic,
  ReusableValidations,
  ValidationWithType,
  ValidationWithTypeComboBoxField,
  AsyncValidation,
  CancelAsyncValidation,
} from './validation';

import {
  ReactToChangesBasic,
  ReactToSpecificFields,
  OnChangeHandler,
  ForwardFormStateToParent,
} from './react_to_changes';

import { StyleFieldsBasic, StyleFieldsChildrenProp, StyleFieldsComponent } from './style_fields';

import { FieldsComposition } from './fields_composition';

import { DynamicFields, DynamicFieldsValidation, DynamicFieldsReorder } from './dynamic_fields';

import { SerializersAndDeserializers } from './serializers_deserializers';

export const FormLibDemo = OnChangeHandler;
