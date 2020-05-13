/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';

import { ComponentTemplateSerialized } from '../../../../common';
import { ComponentTemplates } from './component_templates';

export const ComponentTemplatesContainer = () => {
  const components = [] as ComponentTemplateSerialized[];
  return <ComponentTemplates isLoading={false} components={components} />;
};
