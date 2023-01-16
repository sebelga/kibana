/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import React, { FC, useState } from 'react';
import {
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { EuiCodeEditor } from '@kbn/es-ui-shared-plugin/public';

import { useContentItem } from '../../content_client';

export const ContentDetailsSection: FC = () => {
  const [contentId, setContentId] = useState('');
  const [contentType, setContentType] = useState('foo');

  const { error, data } = useContentItem(
    { type: contentType, id: contentId },
    { enabled: !!(contentType && contentId) }
  );

  return (
    <>
      <EuiTitle>
        <h2>Content details</h2>
      </EuiTitle>
      <EuiSpacer />
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Type" helpText="The content type" fullWidth>
            <EuiFieldText
              value={contentType}
              onChange={(e) => {
                setContentType(e.currentTarget.value);
              }}
              fullWidth
            />
          </EuiFormRow>

          <EuiFormRow label="Id" helpText="The content id" fullWidth>
            <EuiFieldText
              value={contentId}
              onChange={(e) => {
                setContentId(e.currentTarget.value);
              }}
              fullWidth
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiCodeEditor
            value={JSON.stringify(error || data, null, 4)}
            width="100%"
            height="500px"
            mode="json"
            readOnly
            wrapEnabled
            showPrintMargin={false}
            theme="textmate"
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              tabSize: 2,
              useSoftTabs: true,
            }}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
