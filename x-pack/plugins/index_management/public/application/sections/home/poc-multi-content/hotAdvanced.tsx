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
} from '../../../../shared_imports';

export interface HotAdvancedForm {
  merge: boolean;
}

interface Props {
  onChange: (content: Forms.Content<HotAdvancedForm>) => void;
  defaultValue?: HotAdvancedForm;
}

export const HotAdvanced = ({ defaultValue, onChange }: Props) => {
  const { form } = useForm<HotAdvancedForm>({ defaultValue });
  const [, getData] = useFormData<HotAdvancedForm>({ form });
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
