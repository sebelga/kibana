/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';

import { Form } from '../../../../../../../../../src/plugins/elasticsearch_ui_shared/static/forms/hook_form_lib';

import { PropertyListItem } from './property';
import { Tree, TreeItem } from './tree';

interface Props {
  form?: Form;
  properties: Record<string, any>;
  parentType?: string;
  path?: string;
  fieldName?: string;
}

export const PropertiesManager = ({
  form,
  properties,
  parentType = 'root',
  path = 'properties',
  fieldName = '',
}: Props) => {
  return (
    <Fragment>
      {properties ? (
        <Fragment>
          <Tree>
            {Object.entries(properties).map(([name, property], i) => {
              return (
                <TreeItem key={i}>
                  <PropertyListItem name={name} property={property} parentPath={`${path}.${i}`} />
                </TreeItem>
              );
            })}
          </Tree>
        </Fragment>
      ) : null}
      {/* <EuiButton color="primary" onClick={addItem}>
        {parentType === 'text' || parentType === 'keyword' ? 'Add child field' : 'Add property'}
      </EuiButton> */}
    </Fragment>
  );
};
