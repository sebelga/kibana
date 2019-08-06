/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment } from 'react';
import { EuiTitle, EuiSpacer } from '@elastic/eui';

import { Tree, TreeItem } from './tree';
import { PropertyListItem } from './property';
import { PropertiesProvider, PropertiesConsumer } from './properties_contex';

export interface DocumentFieldsState {
  isValid: boolean;
  properties: Record<string, any>;
}

interface Props {
  onUpdate: (state: DocumentFieldsState) => void;
  defaultProperties?: Record<string, any>;
}

export const DocumentFields = ({ defaultProperties = {}, onUpdate }: Props) => {
  return (
    <Fragment>
      <EuiTitle size="s">
        <h4>Document fields</h4>
      </EuiTitle>
      <EuiSpacer size="m" />

      <PropertiesProvider defaultProperties={defaultProperties}>
        <PropertiesConsumer>
          {state => {
            const { properties, selectedPath } = state!;
            onUpdate({ properties, isValid: selectedPath === null });

            return (
              <Tree isInitialOpen>
                {Object.entries(properties)
                  // Make sure to present the fields in alphabetical order
                  .sort(([a], [b]) => (a < b ? -1 : 1))
                  .map(([name, property], i) => (
                    <TreeItem key={`properties.${name}`}>
                      <PropertyListItem name={name} path={name} property={property as any} />
                    </TreeItem>
                  ))}
              </Tree>
            );
          }}
        </PropertiesConsumer>
      </PropertiesProvider>
    </Fragment>
  );
};
