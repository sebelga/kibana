/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useEffect } from 'react';

import {
  Form,
  useForm,
  useFormData,
  UseField,
  ToggleField,
  Forms,
} from '../../../../../shared_imports';

export interface WarmAdvancedForm {
  merge: boolean;
}

interface Props {
  onChange: (content: Forms.Content<WarmAdvancedForm>) => void;
  defaultValue?: WarmAdvancedForm;
}

export const WarmAdvanced = ({ defaultValue, onChange }: Props) => {
  const { form } = useForm<WarmAdvancedForm>({ defaultValue });
  const [, getData] = useFormData<WarmAdvancedForm>({ form });
  const { isValid, validate } = form;

  useEffect(() => {
    onChange({ isValid, validate, getData });
  }, [onChange, isValid, validate, getData]);

  return (
    <Form form={form}>
      <UseField path="merge" component={ToggleField} config={{ defaultValue: false }} />
    </Form>
  );
};
