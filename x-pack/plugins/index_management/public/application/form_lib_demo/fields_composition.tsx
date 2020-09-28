/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';
import { EuiButton, EuiSpacer } from '@elastic/eui';

import {
  useForm,
  Form,
  UseField,
  TextField,
  ToggleField,
  SelectField,
  NumericField,
  useFormData,
} from '../../shared_imports';

const indexConfig = {
  label: 'Index',
  defaultValue: true,
};

const IndexParameter = () => {
  return <UseField path="index" config={indexConfig} component={ToggleField} />;
};

const analyzerConfig = {
  label: 'Analyzer',
  defaultValue: 'standard',
};

const TextType = () => {
  return (
    <>
      <IndexParameter />
      <UseField path="analyzer" config={analyzerConfig} component={TextField} />
    </>
  );
};

const coerceConfig = {
  label: 'Coerce',
  defaultValue: true,
};

const FloatType = () => {
  return (
    <>
      <IndexParameter />
      <UseField path="corece" config={coerceConfig} component={ToggleField} />
    </>
  );
};

const boostConfig = {
  label: 'Boost',
  defaultValue: 1.0,
  serializer: parseFloat,
};

const BooleanType = () => {
  return (
    <>
      <IndexParameter />
      <UseField path="boost" config={boostConfig} component={NumericField} />
    </>
  );
};

const typeToCompMap: { [key: string]: React.FunctionComponent } = {
  text: TextType,
  float: FloatType,
  boolean: BooleanType,
};

const typeConfig = {
  label: 'Type',
  defaultValue: 'text',
};

const typeOptions = [
  {
    text: 'text',
  },
  {
    text: 'float',
  },
  {
    text: 'boolean',
  },
];

export const FieldsComposition = () => {
  const { form } = useForm();
  const [{ type }] = useFormData({ form, watch: 'type' });

  const renderFieldsForType = () => {
    if (type === undefined) {
      return null;
    }

    const FieldsForType = typeToCompMap[type as string];
    return <FieldsForType />;
  };

  const submitForm = () => {
    console.log(form.getFormData());
  };

  return (
    <Form form={form}>
      <UseField
        path="type"
        config={typeConfig}
        component={SelectField}
        componentProps={{
          euiFieldProps: { options: typeOptions },
        }}
      />
      {renderFieldsForType()}
      <EuiSpacer />
      <EuiButton onClick={submitForm} fill>
        Submit
      </EuiButton>
    </Form>
  );
};
