/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';

import { Forms } from '../../../../../shared_imports';
import { FormContents } from '../complex-form';
import { WarmAdvanced } from './warmAdvanced';

const { useContent } = Forms;

export const HotAdvancedContainer = () => {
  const { defaultValue, updateContent } = useContent<FormContents, 'warmAdvanced'>('warmAdvanced');

  return <WarmAdvanced defaultValue={defaultValue} onChange={updateContent} />;
};
