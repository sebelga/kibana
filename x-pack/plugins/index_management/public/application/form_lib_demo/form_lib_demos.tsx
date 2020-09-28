/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState, useEffect } from 'react';

import {
  useForm,
  useFormData,
  Form,
  UseField,
  FormConfig,
  getUseField,
  Field,
  FIELD_TYPES,
  ValidationFunc,
} from '../../shared_imports';

interface UserFormData {
  firstName: string;
  lastName: string;
}

export const FormLibDemo1 = () => {
  const onFormSubmit: FormConfig<UserFormData>['onSubmit'] = async (data, isValid) => {
    console.log('Is form valid:', isValid);
    console.log('Form data', data);
  };

  const { form } = useForm({ onSubmit: onFormSubmit });

  return (
    <Form form={form}>
      <UseField path="firstName" />
      <UseField path="lastName" />

      <button onClick={form.submit}>Submit</button>
    </Form>
  );
};

// deserializer
const MyField = getUseField({ component: Field });

interface UserFormDataExtended {
  name: string;
  address: {
    street: string;
  };
}

// Data coming from the server
const fetchedData = {
  name: 'John',
  address: {
    street: 'El Camino Real #350',
  },
};

const deserializer = (value: any) => {
  return {
    ...value,
    showAddress: value.hasOwnProperty('address'),
  };
};

const serializer = (value: any) => {
  const { showAddress, ...rest } = value;
  return rest;
};

export const FormLibDemo2 = () => {
  const onFormSubmit: FormConfig<UserFormDataExtended>['onSubmit'] = async (data, isValid) => {
    console.log('Is form valid:', isValid);
    console.log('Form data', data);
  };

  const { form } = useForm<UserFormDataExtended>({
    onSubmit: onFormSubmit,
    defaultValue: fetchedData,
    deserializer,
    serializer,
  });
  const [{ showAddress }] = useFormData({ form, watch: 'showAddress' });

  return (
    <Form form={form}>
      <MyField path="firstName" />
      <MyField path="showAddress" config={{ type: FIELD_TYPES.TOGGLE }} />

      {/* Show the street address when the toggle is "true" */}
      {showAddress ? <MyField path="address.street" /> : null}
      <button onClick={form.submit}>Submit</button>
    </Form>
  );
};

// options
export const FormLibDemo3 = () => {
  const onFormSubmit: FormConfig<UserFormDataExtended>['onSubmit'] = async (data, isValid) => {
    console.log('Is form valid:', isValid);
    console.log('Form data', data);
  };

  const { form } = useForm<UserFormDataExtended>({
    onSubmit: onFormSubmit,
    defaultValue: fetchedData,
    deserializer,
    serializer,
    options: { valueChangeDebounceTime: 0 },
  });

  const validator = ({ value }) => {
    if (value === 'Johnx') {
      return {
        message: 'Houston we got a problem',
      };
    }
  };

  return (
    <Form form={form}>
      <UseField<string> path="name" config={{ validations: [{ validator }] }}>
        {(field) => {
          let isInvalid = false;
          let errorMessage = null;

          if (!field.isChangingValue) {
            // Only update this derived state when the field is not changing
            isInvalid = field.errors.length > 0;
            errorMessage = isInvalid ? field.errors[0].message : null;
          }

          return (
            <div>
              <input type="text" value={field.value} onChange={field.onChange} />
              {isInvalid && <div>{errorMessage}</div>}
              <div>Is changing: {field.isChangingValue}</div>
            </div>
          );
        }}
      </UseField>

      <button onClick={form.submit}>Submit</button>
    </Form>
  );
};

// async validation + validate()
export const FormLibDemo4 = ({ onFormUpdate }: Props) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { form } = useForm<UserFormData>();

  const validator: ValidationFunc = async ({ value }: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (value === 'Johnx') {
          return resolve({
            message: 'Houston we got a problem',
          });
        }
        resolve();
      }, 1000);
    });
  };

  const onClickSubmit = async () => {
    setIsSubmitted(true);
    setIsSubmitting(true);

    // If the validity is "undefined", call validate() to run validation on all fields
    const isValid = form.isValid ?? (await form.validate());
    setIsSubmitting(false);

    if (isValid) {
      console.log('Form data:', form.getFormData());
    }
  };

  const isBtnDisabled = isSubmitting || (isSubmitted && form.isValid === false);
  const color = isBtnDisabled ? '#ccc' : 'black';

  return (
    <Form form={form}>
      <UseField path="firstName" config={{ validations: [{ validator }] }} />
      <UseField path="lastName" />

      <button onClick={onClickSubmit} disabled={isBtnDisabled} style={{ color }}>
        {isSubmitting ? 'Sending...' : 'Submit'}
      </button>
      <div>
        Form validity:{' '}
        {form.isValid === undefined ? 'undefined' : form.isValid === false ? 'false' : 'true'}
      </div>
      {isSubmitted && form.isValid === false && <div>Form is invalid.</div>}
    </Form>
  );
};

// Forward handlers to parent + async validation
export const FormLibDemo5 = ({ onFormUpdate }: Props) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { form } = useForm<UserFormData>();
  const { isValid, validate, getFormData } = form;

  const validator: ValidationFunc = async ({ value }: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (value === 'Johnx') {
          return resolve({
            message: 'Houston we got a problem',
          });
        }
        resolve();
      }, 1000);
    });
  };

  const onClickSubmit = async () => {
    setIsSubmitted(true);
    setIsSubmitting(true);

    // If the validity is "undefined", call validate() to run validation on all fields
    const isFormValid = isValid ?? (await form.validate());
    setIsSubmitting(false);

    if (isFormValid) {
      console.log('Form data:', getFormData());
    }
  };

  useEffect(() => {
    if (onFormUpdate) {
      onFormUpdate({ isValid, validate, getFormData });
    }
  }, [isValid, validate, getFormData, onFormUpdate]);

  return (
    <Form form={form}>
      <UseField path="firstName" config={{ validations: [{ validator }] }} />
      <UseField path="lastName" />

      <button
        onClick={onClickSubmit}
        disabled={isSubmitting || (isSubmitted && form.isValid === false)}
      >
        {isSubmitting ? 'Sending...' : 'Submit'}
      </button>
      <div>
        Form validity:{' '}
        {form.isValid === undefined ? 'undefined' : form.isValid === false ? 'false' : 'true'}
      </div>
      {isSubmitted && form.isValid === false && <div>Form is invalid.</div>}
    </Form>
  );
};
