/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useMemo } from 'react';
import { EuiButton, EuiSpacer } from '@elastic/eui';

import { Forms } from '../../../../shared_imports';

import { HotContainer } from './hot.container';
import { HotForm } from './hot';
import { HotAdvancedForm } from './hotAdvanced';

const { MultiContentProvider, MultiContentConsumer } = Forms;

export interface FormContents {
  hot: HotForm;
  hotAdvanced: HotAdvancedForm;
  warm: {
    name: string;
  };
  warmAdvanced: {
    merge: boolean;
    numSegments: number;
  };
}

interface Props {
  complexObject: any;
}

export const ComplexForm = ({ complexObject }: Props) => {
  const formDefaultValue: FormContents = useMemo(() => {
    // Parse the complex object and return it into "chunks"
    return {
      hot: {
        name: 'Test value',
      },
      hotAdvanced: {
        merge: true,
      },
      warm: {
        name: 'Another value',
      },
      warmAdvanced: {
        merge: false,
        numSegments: 2,
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
