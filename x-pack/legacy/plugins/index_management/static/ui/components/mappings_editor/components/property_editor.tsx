/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment } from 'react';
import { EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiButtonIcon } from '@elastic/eui';
import {
  UseField,
  Form,
  FormDataProvider,
} from '../../../../../../../../../src/plugins/elasticsearch_ui_shared/static/forms/hook_form_lib';
import { Field } from '../../../../../../../../../src/plugins/elasticsearch_ui_shared/static/forms/components';

import { parametersDefinition, dataTypesDefinition, DataType } from '../config';
import { hasNestedProperties } from '../helpers';
import { PropertyBasicParameters } from './property_basic_parameters';
import { PropertiesManager } from './properties_manager';

interface Props {
  form: Form;
  onRemove?: () => void;
  fieldPathPrefix?: string;
  isDeletable?: boolean;
  isAnonymous?: boolean;
  isEditMode?: boolean;
}

export const PropertyEditor = ({
  form,
  fieldPathPrefix = '',
  onRemove = () => undefined,
  isAnonymous = false,
  isDeletable = true,
  isEditMode = false,
}: Props) => {
  const renderNestedProperties = (selectedType: DataType, fieldName: string) =>
    hasNestedProperties(selectedType) ? (
      <Fragment>
        <EuiSpacer size="l" />
        <PropertiesManager
          form={form}
          path={`${fieldPathPrefix}properties`}
          fieldName={fieldName}
        />
      </Fragment>
    ) : null;

  return (
    <FormDataProvider
      form={form}
      pathsToWatch={[`${fieldPathPrefix}type`, `${fieldPathPrefix}name`]}
    >
      {formData => {
        const fieldName = formData[`${fieldPathPrefix}name`] as string;
        const selectedDatatype = formData[`${fieldPathPrefix}type`] as DataType;
        const typeDefinition = dataTypesDefinition[selectedDatatype];

        return (
          <div className="property-editor ">
            <EuiFlexGroup justifyContent="spaceBetween">
              {/* Field name */}
              {isAnonymous !== true && (
                <EuiFlexItem grow={false}>
                  <UseField
                    path={`${fieldPathPrefix}name`}
                    form={form}
                    defaultValue={isEditMode ? undefined : ''} // "undefined" will  into the "defaultValue" object passed to the form
                    config={parametersDefinition.name.fieldConfig}
                    component={Field}
                  />
                </EuiFlexItem>
              )}
              {/* Field type */}
              <EuiFlexItem grow={false}>
                <UseField
                  path={`${fieldPathPrefix}type`}
                  form={form}
                  config={parametersDefinition.type.fieldConfig}
                  defaultValue={isEditMode ? undefined : 'text'}
                  component={Field}
                  componentProps={{
                    fieldProps: {
                      options: Object.entries(dataTypesDefinition).map(([value, { label }]) => ({
                        value,
                        text: label,
                      })),
                    },
                  }}
                />
              </EuiFlexItem>
              {/* Field sub type (if any) */}
              {typeDefinition && typeDefinition.subTypes && (
                <EuiFlexItem grow={false}>
                  <UseField
                    path={`${fieldPathPrefix}subType`}
                    form={form}
                    defaultValue={isEditMode ? undefined : typeDefinition.subTypes.types[0]}
                    config={{
                      ...parametersDefinition.type.fieldConfig,
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
              {/* Empty flex item to fill the space in between */}
              <EuiFlexItem />

              {/* Delete field button */}
              {isDeletable && (
                <EuiFlexItem grow={false}>
                  <EuiButtonIcon
                    color="danger"
                    iconType="trash"
                    onClick={onRemove}
                    aria-label="Remove property"
                  />
                </EuiFlexItem>
              )}
            </EuiFlexGroup>

            {typeDefinition && typeDefinition.basicParameters && (
              <Fragment>
                <EuiSpacer size="s" />

                {/* Basic parameters for the selected type */}
                <PropertyBasicParameters
                  form={form}
                  typeDefinition={typeDefinition}
                  fieldPathPrefix={fieldPathPrefix}
                  isEditMode={isEditMode}
                />
              </Fragment>
            )}

            {renderNestedProperties(selectedDatatype, fieldName)}
          </div>
        );
      }}
    </FormDataProvider>
  );
};
