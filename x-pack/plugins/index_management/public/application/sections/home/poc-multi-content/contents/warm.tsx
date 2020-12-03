/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useState, useEffect } from 'react';
import { EuiTitle, EuiSpacer, EuiButton } from '@elastic/eui';

import {
  Form,
  useForm,
  useFormData,
  UseField,
  TextField,
  Forms,
} from '../../../../../shared_imports';
import { HotAdvancedContainer } from './hotAdvanced.container';
import { HotAdvancedForm } from './hotAdvanced';

export interface WarmForm {
  name: string;
}

interface Props {
  onChange: (content: Forms.Content<WarmForm>) => void;
  defaultValue?: WarmForm;
  getWarmAdvancedSettings: () => HotAdvancedForm;
}

export const Warm = ({ defaultValue, onChange, getWarmAdvancedSettings }: Props) => {
  const { form } = useForm<WarmForm>({ defaultValue });
  const [, getData] = useFormData<WarmForm>({ form });
  const { isValid, validate } = form;
  const [isWarmConfigVisible, setIsWarmConfigVisible] = useState(false);

  useEffect(() => {
    onChange({ isValid, validate, getData });
  }, [onChange, isValid, validate, getData]);

  return (
    <Form form={form}>
      <EuiTitle size="l">
        <h2>Warm section</h2>
      </EuiTitle>

      <EuiSpacer />

      <UseField path="name" component={TextField} />

      <EuiSpacer />

      <EuiButton onClick={() => setIsWarmConfigVisible((prev) => !prev)}>
        Configure some settings
      </EuiButton>

      <EuiSpacer />

      {!isWarmConfigVisible && <div>{JSON.stringify(getWarmAdvancedSettings())}</div>}
      {isWarmConfigVisible && <HotAdvancedContainer />}
    </Form>
  );
};
