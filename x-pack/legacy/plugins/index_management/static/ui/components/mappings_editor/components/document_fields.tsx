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

interface Props {
  onUpdate: (properties: Record<string, any>) => void;
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
            const { properties } = state!;
            onUpdate(properties);

            return (
              <Tree isInitialOpen>
                {Object.entries(properties).map(([name, property], i) => (
                  <TreeItem key={`properties.${name}`}>
                    <PropertyListItem
                      name={name}
                      path={`properties.${name}`}
                      property={property as any}
                    />
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
