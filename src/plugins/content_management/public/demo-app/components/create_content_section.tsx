/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, useState } from 'react';
import {
  EuiButton,
  EuiCallOut,
  EuiCode,
  EuiCodeBlock,
  EuiDescribedFormGroup,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';

import { useCreateContentItemMutation } from '../../content_client';

export const CreateContentSection: FC = () => {
  const createContentMutation = useCreateContentItemMutation();
  const [title, setContentType] = useState('');
  const [description, setContentDescription] = useState('');

  const createContent = async () => {
    const content = { title, description };
    createContentMutation.mutate({ type: 'foo', data: content });
  };

  return (
    <>
      <EuiTitle>
        <h2>Create</h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiDescribedFormGroup
        title={<h3>Create a new content</h3>}
        style={{ maxWidth: '100%' }}
        description={
          <p>
            Create a new <EuiCode>foo</EuiCode> type content. This content is persisted in memory.
          </p>
        }
      >
        <EuiFormRow label="Title" helpText="The content title" fullWidth>
          <EuiFieldText
            value={title}
            onChange={(e) => {
              setContentType(e.currentTarget.value);
            }}
            fullWidth
          />
        </EuiFormRow>

        <EuiFormRow
          label="Description"
          helpText="Some detailed information for this content"
          fullWidth
        >
          <EuiFieldText
            value={description}
            onChange={(e) => {
              setContentDescription(e.currentTarget.value);
            }}
            fullWidth
          />
        </EuiFormRow>
        <EuiSpacer />

        {createContentMutation.isSuccess && (
          <>
            <EuiCallOut title="Content created!" color="success" iconType="package">
              <EuiCodeBlock isCopyable>{createContentMutation.data.id}</EuiCodeBlock>
            </EuiCallOut>
            <EuiSpacer />
          </>
        )}

        <EuiFlexGroup justifyContent="flexEnd">
          <EuiFlexItem grow={false}>
            <EuiButton color="primary" onClick={createContent}>
              Send
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiDescribedFormGroup>
    </>
  );
};
