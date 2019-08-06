/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useEffect, useRef } from 'react';
// import { get, set } from 'lodash';

import { ConfigurationForm, DocumentFields } from './components';

interface Props {
  setGetDataHandler: (
    handler: () => Promise<{ isValid: boolean; data: Record<string, any> }>
  ) => void;
  defaultValue?: Record<string, any>;
  areErrorsVisible?: boolean;
}

export type Mappings = Record<string, any>;

type GetFormDataHandler = () => Promise<{ isValid: boolean; data: Record<string, any> }>;

export const MappingsEditor = ({
  setGetDataHandler,
  areErrorsVisible = true,
  defaultValue = {},
}: Props) => {
  const getConfigurationFormData = useRef<GetFormDataHandler>(() =>
    Promise.resolve({
      isValid: true,
      data: {},
    })
  );
  const properties = useRef<Record<string, any>>({});

  useEffect(() => {
    setGetDataHandler(async () => {
      const { isValid, data } = await getConfigurationFormData.current();
      return { isValid, data: { ...data, properties: properties.current } };
    });
  }, []);

  const setGetConfigurationFormDataHandler = (handler: GetFormDataHandler) =>
    (getConfigurationFormData.current = handler);

  const onPropertiesUpdate = (props: Record<string, any>) => {
    properties.current = props;
  };

  return (
    <div className="mappings-editor">
      {/* Global Mappings configuration */}
      <ConfigurationForm
        setGetDataHandler={setGetConfigurationFormDataHandler}
        defaultValue={defaultValue}
      />

      {/* Document fields */}
      <DocumentFields defaultProperties={defaultValue.properties} onUpdate={onPropertiesUpdate} />
    </div>
  );
};
