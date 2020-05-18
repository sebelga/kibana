/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { TestUtils } from '../../../../../../../src/plugins/es_ui_shared/public';
import { AutoFollowPatternAdd } from '../../../app/sections/auto_follow_pattern_add';
import { ccrStore } from '../../../app/store';
import { routing } from '../../../app/services/routing';

const { registerTestBed } = TestUtils;
const testBedConfig = {
  store: ccrStore,
  memoryRouter: {
    onRouter: router => (routing.reactRouter = router),
  },
};

const initTestBed = registerTestBed(AutoFollowPatternAdd, testBedConfig);

export const setup = props => {
  const testBed = initTestBed(props);

  // User actions
  const clickSaveForm = () => {
    testBed.find('submitButton').simulate('click');
  };

  return {
    ...testBed,
    actions: {
      clickSaveForm,
    },
  };
};
