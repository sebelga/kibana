/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useEffect } from 'react';
import { EuiForm } from '@elastic/eui';

import {
  useForm,
  UseField,
} from '../../../../../../../../../src/plugins/elasticsearch_ui_shared/static/forms/hook_form_lib';

import {
  FormRow,
  Field,
} from '../../../../../../../../../src/plugins/elasticsearch_ui_shared/static/forms/components';

import { schema } from '../form.schema';
import { DYNAMIC_SETTING_OPTIONS } from '../constants';

interface Props {
  setGetDataHandler: (handler: () => Promise<{ isValid: boolean; data: any }>) => void;
  defaultValue?: any;
}

export const ConfigurationForm = ({ setGetDataHandler, defaultValue }: Props) => {
  const { form } = useForm({ schema, defaultValue });

  useEffect(() => {
    setGetDataHandler(form.onSubmit);
  }, [form]);

  return (
    <EuiForm className="mappings-editor">
      {/* Global Mappings configuration */}
      <FormRow title="Configuration" description="Global settings for the index mappings">
        <UseField
          path="dynamic"
          form={form}
          componentProps={{
            fieldProps: { options: DYNAMIC_SETTING_OPTIONS },
          }}
          component={Field}
        />
        <UseField path="date_detection" form={form} component={Field} />
        <UseField path="numeric_detection" form={form} component={Field} />
        <UseField path="dynamic_date_formats" form={form} component={Field} />
      </FormRow>
    </EuiForm>
  );
};
