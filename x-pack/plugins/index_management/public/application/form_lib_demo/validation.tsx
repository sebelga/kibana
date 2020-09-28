/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { i18n } from '@kbn/i18n';
import { EuiFieldText, EuiComboBox, EuiComboBoxOptionOption } from '@elastic/eui';

import {
  useForm,
  Form,
  UseField,
  FieldConfig,
  fieldValidators,
  FormConfig,
  ComboBoxField,
  VALIDATION_TYPES,
} from '../../shared_imports';

interface MyForm {
  name: string;
}

const { emptyField, indexNameField, containsCharsField } = fieldValidators;

// const nameConfig: FieldConfig<MyForm, string> = {
//   validations: [
//     {
//       validator: ({ value }) => {
//         if (value.trim() === '') {
//           return {
//             message: 'The name cannot be empty.',
//           };
//         }
//       },
//     },
//     // ...
//     // You can add as many validations as you need.
//     // It is better to kepp validators single purposed.
//   ],
// };

export const ValidationBasic = () => {
  const { form } = useForm<MyForm>();

  return (
    <Form form={form}>
      <UseField path="name" config={nameConfig}>
        {(field) => {
          return (
            <>
              <EuiFieldText
                isInvalid={!field.isChangingValue && field.errors.length > 0}
                value={field.value}
                onChange={field.onChange}
                fullWidth
              />
              {!field.isValid && <div>{field.getErrorsMessages()}</div>}
            </>
          );
        }}
      </UseField>
    </Form>
  );
};

// ---------------------------------------------

// const nameConfig: FieldConfig<MyForm, string> = {
//   validations: [
//     {
//       validator: emptyField('The name cannot be empty,'),
//     },
//     {
//       validator: indexNameField(i18n),
//     },
//   ],
// };

export const ReusableValidations = () => {
  const { form } = useForm<MyForm>();

  return (
    <Form form={form}>
      <UseField<string> path="name" config={nameConfig}>
        {(field) => {
          return (
            <>
              <EuiFieldText
                isInvalid={!field.isChangingValue && field.errors.length > 0}
                value={field.value}
                onChange={field.onChange}
                fullWidth
              />
              {!field.isValid && <div>{field.getErrorsMessages()}</div>}
            </>
          );
        }}
      </UseField>
    </Form>
  );
};

// ---------------------------------------------

// const tagsConfig: FieldConfig<MyForm, string[]> = {
//   defaultValue: [],
//   validations: [
//     {
//       // Validator for the Array
//       validator: emptyField('You need to add at least one tag'),
//     },
//     {
//       // Validator for the Array item
//       validator: containsCharsField({
//         message: ({ charsFound }) => {
//           return `Remove the char ${charsFound.join(', ')} from the field.`;
//         },
//         chars: ['?', '/'],
//       }),
//       // We give a custom type to this validation.
//       // We will need to manually call field.validate({ validationType: 'arrayItem }).
//       type: 'arrayItem',
//     },
//   ],
// };

export const ValidationWithType = () => {
  const onSubmit: FormConfig['onSubmit'] = async (data, isValid) => {
    console.log('Is form valid:', isValid);
    console.log('Form data', data);
  };

  const { form } = useForm<MyForm>({ onSubmit });

  return (
    <Form form={form}>
      <UseField<string[]> path="tags" config={tagsConfig}>
        {(field) => {
          // Look for error message on both the default validation **and** the "arrayItem" type
          const errorMessage =
            field.getErrorsMessages() ?? field.getErrorsMessages({ validationType: 'arrayItem' });

          const onCreateOption = (value: string) => {
            const { isValid } = field.validate({
              value: value as any,
              validationType: 'arrayItem', // Validate  **only** this validation type against the value provided
            }) as { isValid: boolean };

            if (!isValid) {
              // Reject the user's input.
              return false;
            }

            field.setValue([...field.value, value]);
          };

          const onChange = (options: EuiComboBoxOptionOption[]) => {
            field.setValue(options.map((option) => option.label));
          };

          const onSearchChange = (value: string) => {
            if (value !== undefined) {
              // Clear immediately the "arrayItem" validation type
              field.clearErrors('arrayItem');
            }
          };

          return (
            <>
              <EuiComboBox
                noSuggestions
                placeholder="Type and then hit ENTER"
                selectedOptions={field.value.map((v) => ({ label: v }))}
                onCreateOption={onCreateOption}
                onChange={onChange}
                onSearchChange={onSearchChange}
                fullWidth
              />
              {!field.isValid && <div>{errorMessage}</div>}
              <button onClick={form.submit}>Submit</button>
            </>
          );
        }}
      </UseField>
    </Form>
  );
};

const tagsConfig: FieldConfig<MyForm, string[]> = {
  defaultValue: [],
  validations: [
    {
      // Validator for the Array
      validator: emptyField('You need to add at least one tag'),
    },
    {
      // Validator for the Array item
      validator: containsCharsField({
        message: ({ charsFound }) => {
          return `Remove the char ${charsFound.join(', ')} from the field.`;
        },
        chars: ['?', '/'],
      }),
      // Make sure to use the "ARRAY_ITEM" constant
      type: VALIDATION_TYPES.ARRAY_ITEM,
    },
  ],
};

export const ValidationWithTypeComboBoxField = () => {
  const onSubmit: FormConfig['onSubmit'] = async (data, isValid) => {
    console.log('Is form valid:', isValid);
    console.log('Form data', data);
  };

  const { form } = useForm<MyForm>({ onSubmit });

  return (
    <Form form={form}>
      <UseField<string[]> path="tags" config={tagsConfig} component={ComboBoxField} />
      <button onClick={form.submit}>Submit</button>
    </Form>
  );
};

// const nameConfig: FieldConfig<MyForm, string> = {
//   validations: [
//     {
//       validator: emptyField('The name cannot be empty,'),
//     },
//     {
//       validator: indexNameField(i18n),
//     },
//     {
//       validator: async ({ value }) => {
//         return new Promise((resolve) => {
//           setTimeout(() => {
//             if (value === 'bad') {
//               resolve({ message: 'This index already exists' });
//             }
//             resolve();
//           }, 2000);
//         });
//       },
//     },
//   ],
// };

export const AsyncValidation = () => {
  const { form } = useForm<MyForm>();
  return (
    <Form form={form}>
      <UseField<string> path="name" config={nameConfig}>
        {(field) => {
          const isInvalid = !field.isChangingValue && field.errors.length > 0;
          return (
            <>
              <EuiFieldText
                isInvalid={isInvalid}
                value={field.value}
                onChange={field.onChange}
                isLoading={field.isValidating}
                fullWidth
              />
              {isInvalid && <div>{field.getErrorsMessages()}</div>}
            </>
          );
        }}
      </UseField>
    </Form>
  );
};

const nameConfig: FieldConfig<MyForm, string> = {
  validations: [
    {
      validator: ({ value }) => {
        let isCanceled = false;
        const promise: Promise<any> & { cancel?(): void } = new Promise((resolve) => {
          setTimeout(() => {
            if (isCanceled) {
              console.log('This promise has been canceled, skipping');
              return resolve();
            }

            if (value === 'bad') {
              resolve({ message: 'This index already exists' });
            }
            resolve();
          }, 2000);
        });

        promise.cancel = () => {
          isCanceled = true;
        };

        return promise;
      },
    },
  ],
};

export const CancelAsyncValidation = () => {
  const { form } = useForm<MyForm>();
  return (
    <Form form={form}>
      <UseField<string> path="name" config={nameConfig}>
        {(field) => {
          const isInvalid = !field.isChangingValue && field.errors.length > 0;
          return (
            <>
              <EuiFieldText
                isInvalid={isInvalid}
                value={field.value}
                onChange={field.onChange}
                isLoading={field.isValidating}
                fullWidth
              />
              {isInvalid && <div>{field.getErrorsMessages()}</div>}
            </>
          );
        }}
      </UseField>
    </Form>
  );
};
