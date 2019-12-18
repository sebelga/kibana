/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useEffect } from 'react';

import { EuiSpacer } from '@elastic/eui';

import { useForm, Form, SerializerFunc } from '../../shared_imports';
import { Types, useDispatch } from '../../mappings_state';
import { configurationFormSchema } from './configuration_form_schema';
import { DynamicMapping } from './dynamic_mapping';
import { SourceField } from './source_field';

type MappingsConfiguration = Types['MappingsConfiguration'];

interface Props {
  defaultValue?: MappingsConfiguration;
}

const formSerializer: SerializerFunc<MappingsConfiguration> = formData => {
  const { enabled, throwErrorsForUnmappedFields, ...configurationData } = formData;
  const dynamic = enabled ? true : throwErrorsForUnmappedFields ? 'strict' : false;

  return {
    ...configurationData,
    dynamic,
  };
};

const formDeserializer = (formData: { [key: string]: any }) => {
  const { dynamic, ...rest } = formData;
  const throwErrorsForUnmappedFields = dynamic === 'strict';
  const enabled = dynamic === true || dynamic === undefined;

  return {
    ...rest,
    throwErrorsForUnmappedFields,
    enabled,
  };
};

export const ConfigurationForm = React.memo(({ defaultValue }: Props) => {
  const { form } = useForm<MappingsConfiguration>({
    schema: configurationFormSchema,
    serializer: formSerializer,
    deserializer: formDeserializer,
    defaultValue,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = form.subscribe(updatedConfiguration => {
      dispatch({ type: 'configuration.update', value: updatedConfiguration });
    });
    return subscription.unsubscribe;
  }, [form]);

  return (
    <Form form={form}>
      <DynamicMapping />
      <EuiSpacer size="xl" />
      <SourceField />
    </Form>
  );
});
