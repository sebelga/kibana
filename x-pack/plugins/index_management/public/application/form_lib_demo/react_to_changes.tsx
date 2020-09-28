/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { EuiCode, EuiButton } from '@elastic/eui';

import {
  useForm,
  Form,
  UseField,
  TextField,
  ToggleField,
  FormSchema,
  useFormData,
} from '../../shared_imports';

export const ReactToChangesBasic = () => {
  const { form } = useForm();
  const [data] = useFormData({ form });

  return (
    <Form form={form}>
      <UseField path="firstname" config={{ label: 'First name' }} component={TextField} />
      <UseField path="lastName" config={{ label: 'Last name' }} component={TextField} />
      <EuiCode>{JSON.stringify(data)}</EuiCode>
    </Form>
  );
};

// ----------------------------------------------

export const ReactToSpecificFields = () => {
  const { form } = useForm();
  const [{ showAddress }] = useFormData({ form, watch: 'showAddress' });

  return (
    <Form form={form}>
      <UseField path="name" config={{ label: 'First name' }} component={TextField} />
      <UseField
        path="showAddress"
        config={{ defaultValue: false, label: 'Show address' }}
        component={ToggleField}
      />

      {showAddress && (
        <>
          <p>800 W El Camino Real #350</p>
        </>
      )}
    </Form>
  );
};

// ----------------------------------------------

export const OnChangeHandler = () => {
  const { form } = useForm();

  const onNameChange = (value: string) => {
    console.log(value);
  };

  return (
    <Form form={form}>
      <UseField
        path="name"
        config={{ label: 'Name' }}
        component={TextField}
        onChange={onNameChange}
      />
    </Form>
  );
};

// ----------------------------------------------

interface MyForm {
  name: string;
}

interface FormState {
  isValid: boolean | undefined;
  validate(): Promise<boolean>;
  getData(): MyForm;
}

const schema: FormSchema<MyForm> = {
  name: {
    validations: [
      {
        validator: ({ value }) => {
          if (value === 'John') {
            return { message: `The username "John" already exists` };
          }
        },
      },
    ],
  },
};

interface Props {
  defaultValue: MyForm;
  onChange(formState: FormState): void;
}

const MyForm = ({ defaultValue, onChange }: Props) => {
  const { form } = useForm<MyForm>({ defaultValue, schema });
  const { isValid, validate, getFormData } = form;

  useEffect(() => {
    onChange({ isValid, validate, getData: getFormData });
  }, [onChange, isValid, validate, getFormData]);

  return (
    <Form form={form}>
      <UseField path="name" component={TextField} />
    </Form>
  );
};

export const ForwardFormStateToParent = () => {
  // This would probably come from the server
  const formDefaultValue: MyForm = {
    name: 'John',
  };

  const initialState = {
    isValid: true,
    validate: async () => true,
    getData: () => formDefaultValue,
  };

  const [formState, setFormState] = useState<FormState>(initialState);

  const sendForm = useCallback(async () => {
    // The form isValid state will stay "undefined" until all the fields are dirty.
    // This is why we check first if its undefined, and if so  we call the validate() method
    // to trigger the validation on all the fields that haven't been validated yet.
    const isValid = formState.isValid ?? (await formState.validate());
    if (!isValid) {
      // Maybe show a callout?
      return;
    }

    console.log('Form data', formState.getData());
  }, [formState]);

  return (
    <>
      <h1>My form</h1>
      <MyForm defaultValue={formDefaultValue} onChange={setFormState} />
      <EuiButton color="primary" onClick={sendForm} disabled={formState.isValid === false} fill>
        Submit
      </EuiButton>
    </>
  );
};
