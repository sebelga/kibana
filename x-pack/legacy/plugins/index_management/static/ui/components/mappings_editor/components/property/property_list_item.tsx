/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment } from 'react';
import { EuiFlexItem, EuiFlexGroup, EuiButtonIcon } from '@elastic/eui';

import { PropertyView } from './property_view';
import { PropertyEditor } from './property_editor';
import { Tree, TreeItem } from '../tree';
import { usePropertiesState, usePropertiesDispatch } from '../properties_contex';

interface Props {
  name: string;
  path: string;
  property: Record<string, any>;
  // onRemove?: () => void;
  // fieldPathPrefix?: string;
}

export const PropertyListItem = ({ name, property, path }: Props) => {
  const { selectedPath } = usePropertiesState();
  const dispatch = usePropertiesDispatch();

  const hasChildren = Boolean(property.properties);
  const isEditMode = selectedPath === path;

  const onSubmitProperty = ({ name: _, ...rest }: Record<string, any>) => {
    dispatch({ type: 'saveProperty', path, value: rest });
  };

  const renderActionButtons = () => (
    <EuiFlexGroup gutterSize="xs">
      <EuiFlexItem>
        <EuiButtonIcon
          color="primary"
          onClick={() => dispatch({ type: 'selectPath', value: path })}
          iconType="pencil"
          aria-label="Edit"
          disabled={selectedPath !== null}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiButtonIcon
          color="danger"
          onClick={() => window.alert('Ok')}
          iconType="trash"
          aria-label="Delete"
        />
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const renderEditForm = () => (
    <PropertyEditor onSubmit={onSubmitProperty} defaultValue={{ name, ...property }} />
  );

  return hasChildren ? (
    <Tree
      headerContent={<PropertyView name={name} property={property} />}
      rightHeaderContent={renderActionButtons()}
    >
      <Fragment>
        {isEditMode && renderEditForm()}
        {Object.entries(property.properties)
          // Make sure to present the fields in alphabetical order
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([childName, childProperty], i) => (
            <TreeItem key={`${path}.properties.${childName}`}>
              <PropertyListItem
                name={childName}
                path={`${path}.properties.${childName}`}
                property={childProperty as any}
              />
            </TreeItem>
          ))}
      </Fragment>
    </Tree>
  ) : (
    <Fragment>
      <EuiFlexGroup>
        <EuiFlexItem>
          <PropertyView name={name} property={property} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>{renderActionButtons()}</EuiFlexItem>
      </EuiFlexGroup>
      {isEditMode && renderEditForm()}
    </Fragment>
  );
};
