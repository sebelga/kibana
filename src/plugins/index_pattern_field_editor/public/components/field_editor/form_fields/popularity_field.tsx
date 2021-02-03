/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * and the Server Side Public License, v 1; you may not use this file except in
 * compliance with, at your election, the Elastic License or the Server Side
 * Public License, v 1.
 */
import React from 'react';

import { UseField, NumericField } from '../../../shared_imports';

export const PopularityField = () => {
  // TODO how to pass props down to input for functional test
  return (
    <UseField
      path="popularity"
      component={NumericField}
      componentProps={{ euiFieldProps: { 'data-test-subj': 'editorFieldCount' } }}
    />
  );
};
