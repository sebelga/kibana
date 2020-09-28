/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';
import { i18n } from '@kbn/i18n';
import {
  EuiCode,
  EuiButton,
  EuiFieldText,
  EuiComboBox,
  EuiComboBoxOptionOption,
} from '@elastic/eui';

import { useForm, Form, UseField, FieldHook } from '../../shared_imports';

import './style_fields.scss';

export const StyleFieldsBasic = () => {
  const { form } = useForm();

  return (
    <Form form={form}>
      <UseField path="username" className="text-input" />
      <UseField path="password" type="password" className="text-input" />
    </Form>
  );
};

// ----------------------------------------------

export const StyleFieldsChildrenProp = () => {
  const { form } = useForm();

  return (
    <Form form={form}>
      <UseField<string> path="firstname" config={{ label: 'First name' }}>
        {(field) => {
          // The styling is all yours!
          const errors = field.getErrorsMessages();
          return (
            <div style={{ border: field.isValid ? 'none' : '1px solid red' }}>
              <label>{field.label}</label>
              <input id="firstName" type="text" value={field.value} onChange={field.onChange} />
              {!field.isValid && <div>{errors}</div>}
            </div>
          );
        }}
      </UseField>
    </Form>
  );
};

// ----------------------------------------------

const MyTextField = ({ field }: { field: FieldHook<string> }) => {
  const errors = field.getErrorsMessages();
  return (
    <div style={{ border: field.isValid ? 'none' : '1px solid red' }}>
      <label>{field.label}</label>
      <input id="firstName" type="text" value={field.value} onChange={field.onChange} />
      {!field.isValid && <div>{errors}</div>}
    </div>
  );
};

export const StyleFieldsComponent = () => {
  const { form } = useForm();

  return (
    <Form form={form}>
      <UseField<string> path="firstname" config={{ label: 'First name' }} component={MyTextField} />
    </Form>
  );
};
