/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState, useEffect } from 'react';
import { get, set } from 'lodash';
import { EuiTitle, EuiSpacer, EuiForm } from '@elastic/eui';
import {
  useForm,
  UseField,
} from '../../../../../../../../src/plugins/elasticsearch_ui_shared/static/forms/hook_form_lib';
import {
  FormRow,
  Field,
} from '../../../../../../../../src/plugins/elasticsearch_ui_shared/static/forms/components';

import { schema } from './form.schema';
import { Tree, TreeItem, PropertyListItem } from './components';
import { createCtx } from './helpers';
import { DYNAMIC_SETTING_OPTIONS } from './constants';

interface Props {
  setGetDataHandler: (handler: () => Promise<{ isValid: boolean; data: Mappings }>) => void;
  defaultValue?: Mappings;
  areErrorsVisible?: boolean;
}

export interface Mappings {
  [key: string]: any;
}

// const sanitizePropParameters = (parameters: Record<string, any>): Record<string, any> =>
//   Object.entries(parameters).reduce(
//     (acc, [param, value]) => {
//       // IF a prop value is "index_default", we remove it
//       if (value !== 'index_default') {
//         acc[param] = value;
//       }
//       return acc;
//     },
//     {} as any
//   );

// const serializeProperties = (properties: any[]) =>
//   properties.map(prop => {
//     // If a subType is present, use it as type for ES
//     if ({}.hasOwnProperty.call(prop, 'subType')) {
//       prop.type = prop.subType;
//       delete prop.subType;
//     }

//     return sanitizePropParameters(prop);
//   });

// const deSerializeProperties = (properties: { [key: string]: any }) => {
//   Object.entries(properties).forEach(([name, prop]: [string, any]) => {
//     // Check if the type provided is a subType (e.g: "float" is a subType of the "numeric" type in the UI)
//     if (!(dataTypesDefinition as any)[prop.type]) {
//       const type = getTypeFromSubType(prop.type);
//       if (!type) {
//         throw new Error(
//           `Property type "${prop.type}" not recognized and no subType was found for it.`
//         );
//       }
//       prop.subType = prop.type;
//       prop.type = type;
//     }
//   });

//   return properties;
// };

// const serializer = (data: Record<string, unknown>): Record<string, unknown> => ({
//   ...data,
//   properties: propertiesArrayToObject(serializeProperties(data.properties as any[])),
// });

// const deSerializer = (data: Record<string, unknown>): Record<string, unknown> => ({
//   ...data,
//   properties: propertiesObjectToArray(
//     deSerializeProperties(data.properties as { [key: string]: any })
//   ),
// });

interface PropertiesContextInterface {
  properties: Record<string, any>;
  selectedProp: string | null;
  setSelectedProp: (path: string) => void;
  getProperty: (path: string) => any;
  saveProperty: (path: string, value: any) => void;
}

export const [usePropertiesCtx, PropertiesProvider] = createCtx<PropertiesContextInterface>();

export const MappingsEditor = ({
  setGetDataHandler,
  areErrorsVisible = true,
  defaultValue = {},
}: Props) => {
  const [state, setState] = useState<PropertiesContextInterface>({
    properties: defaultValue.properties,
    selectedProp: null,
    setSelectedProp: (path: string) => {
      setState(prev => ({ ...prev, selectedProp: path }));
    },
    getProperty: (path): any => get(state.properties, path),
    saveProperty: (path, value) =>
      setState(prev => ({
        ...prev,
        properties: set(prev.properties, path, value),
      })),
  });

  const { form } = useForm({ schema, defaultValue });

  useEffect(() => {
    setGetDataHandler(async () => {
      const { isValid, data } = await form.onSubmit();
      return { isValid, data: { ...data, properties: state.properties } };
    });
  }, [form]);

  return (
    <EuiForm className="mappings-editor">
      {/* Global Mappings configuration */}
      <FormRow title="Configuration" description="Global settings for the index mappings">
        <UseField
          path="dynamic"
          form={form}
          componentProps={{
            fieldProps: { options: DYNAMIC_SETTING_OPTIONS },
          }}
          component={Field}
        />
        <UseField path="date_detection" form={form} component={Field} />
        <UseField path="numeric_detection" form={form} component={Field} />
        <UseField path="dynamic_date_formats" form={form} component={Field} />
      </FormRow>

      {/* Document fields */}
      <EuiTitle size="s">
        <h4>Document fields</h4>
      </EuiTitle>
      <EuiSpacer size="m" />

      <PropertiesProvider value={state}>
        <Tree isInitialOpen>
          {Object.entries(state.properties).map(([name, property], i) => (
            <TreeItem key={`${state.properties}.${name}`}>
              <PropertyListItem
                name={name}
                path={name}
                property={property as any}
                // parentPath={`${path}.${i}`}
              />
            </TreeItem>
          ))}
        </Tree>
      </PropertiesProvider>
    </EuiForm>
  );
};
