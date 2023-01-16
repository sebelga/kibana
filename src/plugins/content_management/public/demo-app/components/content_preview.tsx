/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC } from 'react';
import {
  EuiDescriptionListTitle,
  EuiDescriptionListDescription,
  EuiSplitPanel,
  EuiText,
  EuiCode,
} from '@elastic/eui';

import { useContentItemPreview } from '../../content_client';

export const ContentPreview: FC<{ type: string; id: string }> = ({ type, id }) => {
  const isIdEmpty = !(type && id);

  const { isLoading, isError, data } = useContentItemPreview({ id, type }, { enabled: !isIdEmpty });

  if (isIdEmpty) {
    return <EuiText>Provide an id to load the content</EuiText>;
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error</span>;
  }

  return (
    <EuiSplitPanel.Outer grow>
      <EuiSplitPanel.Inner>
        <EuiText>
          <EuiDescriptionListTitle>{data.title}</EuiDescriptionListTitle>
          {Boolean(data.description) && (
            <EuiDescriptionListDescription>{data.description}</EuiDescriptionListDescription>
          )}
        </EuiText>
      </EuiSplitPanel.Inner>
      <EuiSplitPanel.Inner grow={false} color="subdued">
        <EuiText>
          <p>
            Type <EuiCode>{data.type}</EuiCode>
          </p>
        </EuiText>
      </EuiSplitPanel.Inner>
    </EuiSplitPanel.Outer>
  );
};
