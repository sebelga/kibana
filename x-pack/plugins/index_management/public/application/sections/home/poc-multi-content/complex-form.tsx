/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useMemo } from 'react';
import { EuiButton, EuiSpacer, EuiHorizontalRule } from '@elastic/eui';

import { Forms } from '../../../../shared_imports';

import {
  HotContainer,
  WarmContainer,
  HotForm,
  HotAdvancedForm,
  WarmForm,
  WarmAdvancedForm,
} from './contents';

const { MultiContentProvider, MultiContentConsumer } = Forms;

export interface FormContents {
  hot: HotForm;
  hotAdvanced: HotAdvancedForm;
  warm: WarmForm;
  warmAdvanced: WarmAdvancedForm;
}

interface Props {
  complexObject: any;
}

export const ComplexForm = ({ complexObject }: Props) => {
  const formDefaultValue: FormContents = useMemo(() => {
    // Parse the complex object and return it into "chunks"
    return {
      hot: {
        name: 'Initial hot value',
      },
      hotAdvanced: {
        merge: true,
      },
      warm: {
        name: 'Initial warm value',
      },
      warmAdvanced: {
        merge: false,
      },
    };
  }, [complexObject]); // eslint-disable-line

  return (
    <MultiContentProvider<FormContents> defaultValue={formDefaultValue}>
      <MultiContentConsumer>
        {({ validate, getData }: Forms.MultiContent<FormContents>) => {
          const saveForm = async () => {
            console.log('About to save form...'); // eslint-disable-line
            console.log('Is valid:', await validate()); // eslint-disable-line
            console.log('Data:', getData()); // eslint-disable-line
          };

          return (
            <>
              <HotContainer />

              <EuiHorizontalRule />

              <WarmContainer />

              <EuiSpacer size="l" />
              <EuiButton onClick={saveForm} fill>
                Save form
              </EuiButton>
            </>
          );
        }}
      </MultiContentConsumer>
    </MultiContentProvider>
  );
};
