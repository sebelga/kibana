/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';

import { Forms } from '../../../../shared_imports';
import { FormContents } from './complex-form';
import { Hot } from './hot';

const { useContent } = Forms;

export const HotContainer = () => {
  const { defaultValue, updateContent, getSingleContentData } = useContent<FormContents, 'hot'>(
    'hot'
  );

  return (
    <Hot
      defaultValue={defaultValue}
      onChange={updateContent}
      getHotAdvancedValue={() => getSingleContentData('hotAdvanced')}
    />
  );
};
