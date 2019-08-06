/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';
import { EuiFlexItem, EuiFlexGroup, EuiButtonIcon } from '@elastic/eui';

import { PropertyView } from './property_view';
import { Tree, TreeItem } from '../tree';
import { usePropertiesState, usePropertiesDispatch } from '../properties_contex';

interface Props {
  name: string;
  path: string;
  // form: Form;
  property: Record<string, any>;
  onRemove?: () => void;
  fieldPathPrefix?: string;
  // isEditMode?: boolean;
}

export const PropertyListItem = ({ name, property, path }: Props) => {
  const hasChildren = Boolean(property.properties);
  const { selectedPath } = usePropertiesState();
  const dispatch = usePropertiesDispatch();

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

  return hasChildren ? (
    <Tree
      headerContent={<PropertyView name={name} property={property} />}
      rightHeaderContent={renderActionButtons()}
    >
      {Object.entries(property.properties).map(([childName, childProperty], i) => (
        <TreeItem key={`${path}.properties.${childName}`}>
          <PropertyListItem
            name={childName}
            path={`${path}.properties.${childName}`}
            property={childProperty as any}
            // parentPath={`${path}.${i}`}
          />
        </TreeItem>
      ))}
    </Tree>
  ) : (
    <EuiFlexGroup>
      <EuiFlexItem>
        <PropertyView name={name} property={property} />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>{renderActionButtons()}</EuiFlexItem>
    </EuiFlexGroup>
  );
};
