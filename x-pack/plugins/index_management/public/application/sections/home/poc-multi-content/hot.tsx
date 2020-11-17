/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useState, useEffect } from 'react';
import { EuiSpacer, EuiButton } from '@elastic/eui';

import { Form, useForm, useFormData, UseField, TextField, Forms } from '../../../../shared_imports';
import { HotAdvancedContainer } from './hotAdvanced.container';
import { HotAdvancedForm } from './hotAdvanced';

export interface HotForm {
  name: string;
}

interface Props {
  onChange: (content: Forms.Content<HotForm>) => void;
  defaultValue?: HotForm;
  getHotAdvancedValue: () => HotAdvancedForm;
}

export const Hot = ({ defaultValue, onChange, getHotAdvancedValue }: Props) => {
  const { form } = useForm<HotForm>({ defaultValue });
  const [, getData] = useFormData<HotForm>({ form });
  const { isValid, validate } = form;
  const [isHotConfigVisible, setIsHotConfigVisible] = useState(false);

  useEffect(() => {
    onChange({ isValid, validate, getData });
  }, [onChange, isValid, validate, getData]);

  return (
    <Form form={form}>
      <UseField path="name" component={TextField} />

      <EuiSpacer />

      <EuiButton onClick={() => setIsHotConfigVisible((prev) => !prev)}>
        {isHotConfigVisible ? 'Hide' : 'Show'} advanced settings
      </EuiButton>

      <EuiSpacer />

      {!isHotConfigVisible && <div>{JSON.stringify(getHotAdvancedValue())}</div>}
      {isHotConfigVisible && <HotAdvancedContainer />}
    </Form>
  );
};
