/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useRef, useState } from 'react';
import { EuiPageContent, EuiButton, EuiSpacer, EuiTitle } from '@elastic/eui';

import { MappingsEditor, Mappings } from '../../../static/ui';

type GetMappingsEditorDataHandler = () => Promise<{ isValid: boolean; data: Mappings }>;

const initialData = {
  dynamic: 'strict',
  date_detection: false,
  numeric_detection: true,
  dynamic_date_formats: ['MM/dd/yyyy'],
  properties: {
    title: {
      type: 'text',
      store: true,
      index: false,
      fielddata: true,
      fields: {
        raw: {
          type: 'keyword',
          store: false,
          index: true,
          doc_values: true,
        },
      },
    },
    myObject: {
      type: 'object',
      dynamic: true,
      enabled: true,
      properties: {
        prop1: {
          type: 'text',
          store: false,
          index: true,
          fielddata: true,
        },
        prop2: {
          type: 'text',
          store: true,
          index: true,
          fielddata: false,
        },
      },
    },
  },
};

// TODO: find solution when going back to a previsouly set type

export const CreateIndex = () => {
  const getMappingsEditorData = useRef<GetMappingsEditorDataHandler>(() =>
    Promise.resolve({
      isValid: true,
      data: {},
    })
  );
  const [mappings, setMappings] = useState<Mappings>(initialData);
  const [isMappingsValid, setIsMappingsValid] = useState<boolean>(true);

  const setGetMappingsEditorDataHandler = (handler: GetMappingsEditorDataHandler) =>
    (getMappingsEditorData.current = handler);

  const onClick = async () => {
    const { isValid, data } = await getMappingsEditorData.current();
    // console.log(isValid, data);
    setIsMappingsValid(isValid);
    setMappings(data);
  };

  return (
    <EuiPageContent>
      <EuiTitle size="l">
        <h1>Index Mappings</h1>
      </EuiTitle>
      <EuiSpacer size="xl" />

      <MappingsEditor
        setGetDataHandler={setGetMappingsEditorDataHandler}
        defaultValue={initialData}
      />

      <EuiSpacer size="xl" />
      <EuiButton color="primary" fill onClick={onClick}>
        Send form
      </EuiButton>

      <EuiSpacer size="xl" />
      <hr />

      <EuiSpacer size="l" />
      <EuiTitle size="m">
        <h3>Mappings editor data:</h3>
      </EuiTitle>

      <EuiSpacer size="l" />
      {isMappingsValid ? (
        <pre>
          <code>{JSON.stringify(mappings, null, 2)}</code>
        </pre>
      ) : (
        <div>The mappings JSON data is not valid.</div>
      )}
    </EuiPageContent>
  );
};
