/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment, useState } from 'react';
import {
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButton,
  EuiButtonEmpty,
  EuiForm,
  EuiFormRow,
  EuiSelect,
} from '@elastic/eui';

import {
  useForm,
  UseField,
  FormDataProvider,
  FieldConfig,
} from '../../../../../../../../../../src/plugins/elasticsearch_ui_shared/static/forms/hook_form_lib';
import { Field } from '../../../../../../../../../../src/plugins/elasticsearch_ui_shared/static/forms/components';

import {
  parametersDefinition,
  dataTypesDefinition,
  getTypeFromSubType,
  ParameterName,
  DataType,
  SubType,
} from '../../config';
// import { hasNestedProperties } from '../../helpers';
import { PropertyBasicParameters } from '../property_basic_parameters';
import { getComponentForParameter } from '../parameters';
import { getAdvancedSettingsCompForType } from '../advanced_settings';

interface Props {
  onSubmit: (property: Record<string, any>) => void;
  defaultValue?: Record<string, any>;
}

const fieldConfig = (param: ParameterName): FieldConfig =>
  parametersDefinition[param].fieldConfig || {};

const defaultValueParam = (param: ParameterName): unknown =>
  typeof fieldConfig(param).defaultValue !== 'undefined' ? fieldConfig(param).defaultValue : '';

const sanitizePropParameters = (parameters: Record<string, any>): Record<string, any> =>
  Object.entries(parameters).reduce(
    (acc, [param, value]) => {
      // IF a prop value is "index_default", we remove it
      if (value !== 'index_default') {
        acc[param] = value;
      }
      return acc;
    },
    {} as any
  );

const serializer = (property: Record<string, any>) => {
  // If a subType is present, use it as type for ES
  if ({}.hasOwnProperty.call(property, 'subType')) {
    property.type = property.subType;
    delete property.subType;
  }
  return sanitizePropParameters(property);
};

const deSerializer = (property: Record<string, any>) => {
  if (!(dataTypesDefinition as any)[property.type]) {
    const type = getTypeFromSubType(property.type);
    if (!type) {
      throw new Error(
        `Property type "${property.type}" not recognized and no subType was found for it.`
      );
    }
    property.subType = property.type;
    property.type = type;
  }

  return property;
};

export const PropertyEditor = ({ onSubmit, defaultValue }: Props) => {
  const [isAdvancedSettingsVisible, setIsAdvancedSettingsVisible] = useState<boolean>(false);

  const { form } = useForm({ defaultValue, serializer, deSerializer });
  const isEditMode = typeof defaultValue !== 'undefined';

  const submitForm = async () => {
    const { isValid, data: formData } = await form.onSubmit();
    if (isValid) {
      const data =
        defaultValue && defaultValue.properties
          ? { ...formData, properties: defaultValue.properties }
          : formData;
      onSubmit(data);
    }
  };

  const toggleAdvancedSettings = () => {
    setIsAdvancedSettingsVisible(previous => !previous);
  };

  const renderAdvancedSettings = (type: DataType | SubType) => {
    const AdvancedSettingsComponent = getAdvancedSettingsCompForType(type);

    if (!isAdvancedSettingsVisible || !AdvancedSettingsComponent) {
      return null;
    }
    return (
      <Fragment>
        <EuiSpacer size="m" />
        <div style={{ backgroundColor: '#F5F7FA', padding: '12px' }}>
          <AdvancedSettingsComponent form={form} />
        </div>
      </Fragment>
    );
  };

  return (
    <FormDataProvider form={form} pathsToWatch="type">
      {formData => {
        const selectedDatatype = formData.type as DataType;
        const typeDefinition = dataTypesDefinition[selectedDatatype];

        return (
          <EuiForm className="property-editor ">
            <EuiFlexGroup>
              {/* Field name */}
              <EuiFlexItem grow={false}>
                <UseField
                  path="name"
                  form={form}
                  defaultValue={isEditMode ? undefined : defaultValueParam('name')} // "undefined" means: look into the "defaultValue" object passed to the form
                  config={fieldConfig('name')}
                  component={getComponentForParameter('name')}
                />
              </EuiFlexItem>

              {/* Field type */}
              <EuiFlexItem grow={false}>
                <UseField
                  path="type"
                  form={form}
                  config={fieldConfig('type')}
                  defaultValue={isEditMode ? undefined : defaultValueParam('type')}
                >
                  {field => (
                    <EuiFormRow label={field.label} helpText={field.helpText} fullWidth>
                      <EuiSelect
                        fullWidth
                        value={field.value as string}
                        onChange={e => {
                          setIsAdvancedSettingsVisible(false);
                          field.setValue(e.target.value);
                        }}
                        hasNoInitialSelection={true}
                        isInvalid={false}
                        options={Object.entries(dataTypesDefinition).map(([value, { label }]) => ({
                          value,
                          text: label,
                        }))}
                      />
                    </EuiFormRow>
                  )}
                </UseField>
              </EuiFlexItem>

              {/* Field sub type (if any) */}
              {typeDefinition && typeDefinition.subTypes && (
                <EuiFlexItem grow={false}>
                  <UseField
                    path="subType"
                    form={form}
                    defaultValue={isEditMode ? undefined : typeDefinition.subTypes.types[0]}
                    config={{
                      ...fieldConfig('type'),
                      label: typeDefinition.subTypes.label,
                    }}
                    component={Field}
                    componentProps={{
                      fieldProps: {
                        options: typeDefinition.subTypes.types.map(type => ({
                          value: type,
                          text: type,
                        })),
                        hasNoInitialSelection: false,
                      },
                    }}
                  />
                </EuiFlexItem>
              )}
            </EuiFlexGroup>

            {((typeDefinition && typeDefinition.basicParameters) ||
              getAdvancedSettingsCompForType(selectedDatatype)) && (
              <Fragment>
                <EuiSpacer size="s" />
                <EuiFlexGroup justifyContent="spaceBetween">
                  {typeDefinition && typeDefinition.basicParameters && (
                    <EuiFlexItem>
                      {/* Basic parameters for the selected type */}
                      <PropertyBasicParameters
                        form={form}
                        typeDefinition={typeDefinition}
                        isEditMode={isEditMode}
                      />
                    </EuiFlexItem>
                  )}
                  {getAdvancedSettingsCompForType(selectedDatatype) && (
                    <EuiFlexItem grow={false}>
                      <EuiButtonEmpty size="s" onClick={toggleAdvancedSettings}>
                        {isAdvancedSettingsVisible ? 'Hide' : 'Show'} advanced settings
                      </EuiButtonEmpty>
                    </EuiFlexItem>
                  )}
                </EuiFlexGroup>
              </Fragment>
            )}

            {renderAdvancedSettings(selectedDatatype)}

            <EuiButton color="primary" size="s" onClick={submitForm} className="btn-save">
              Save
            </EuiButton>
          </EuiForm>
        );
      }}
    </FormDataProvider>
  );
};
