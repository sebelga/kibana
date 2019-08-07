/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment, useState } from 'react';
import { EuiFlexItem, EuiFlexGroup, EuiButtonEmpty, EuiButtonIcon } from '@elastic/eui';

import { PropertyView } from './property_view';
import { PropertyEditor } from './property_editor';
import { Tree, TreeItem } from '../tree';
import { usePropertiesState, usePropertiesDispatch } from '../properties_contex';
import { getNestedFieldsPropName } from '../../helpers';
interface Props {
  name: string;
  path: string;
  property: Record<string, any>;
  nestedDepth: number;
}

export const PropertyListItem = ({ name, property, path, nestedDepth }: Props) => {
  const { selectedPath } = usePropertiesState();
  const dispatch = usePropertiesDispatch();

  const hasChildren = Boolean(property.properties);
  const nestedFieldPropName = getNestedFieldsPropName(property.type);
  const isEditMode = selectedPath === path;
  const [showChildren, setShowChildren] = useState<boolean>(isEditMode);
  const mapNestedFieldNameToButtonLabel = {
    fields: 'Add field',
    properties: 'Add property',
  };

  const onSubmitProperty = ({ name: updatedName, ...rest }: Record<string, any>) => {
    if (updatedName !== name) {
      // The name has been updated, we need to
      // 1. Change the property path to the new path
      // 2. Replace the old property at the new path
      const pathToArray = path.split('.');
      pathToArray[pathToArray.length - 1] = updatedName;
      const newPath = pathToArray.join('.');

      dispatch({ type: 'updatePropertyPath', oldPath: path, newPath });
      dispatch({ type: 'saveProperty', path: newPath, value: rest });
    } else {
      dispatch({ type: 'saveProperty', path, value: rest });
    }
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

  const renderEditForm = (style = {}) => (
    <PropertyEditor
      onSubmit={onSubmitProperty}
      defaultValue={{ name, ...property }}
      style={{ ...style, marginLeft: `${nestedDepth * -24 + 1}px` }}
    />
  );

  const renderNoChildren = () => (
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

  const renderAddSubField = () => (
    <div>
      <EuiButtonEmpty
        size="xs"
        onClick={() => window.alert('Button clicked')}
        iconType="plusInCircle"
      >
        {mapNestedFieldNameToButtonLabel[nestedFieldPropName!]}
      </EuiButtonEmpty>
    </div>
  );

  return Boolean(nestedFieldPropName) ? (
    <Fragment>
      {isEditMode && <div className="property-list-item__overlay"></div>}
      {hasChildren ? (
        <Tree
          headerContent={<PropertyView name={name} property={property} />}
          rightHeaderContent={renderActionButtons()}
          isOpen={isEditMode ? true : showChildren}
          onToggle={() => setShowChildren(prev => !prev)}
        >
          <Fragment>
            {isEditMode && renderEditForm({ marginTop: 0, marginBottom: '12px' })}
            {Object.entries(property.properties)
              // Make sure to display the fields in alphabetical order
              .sort(([a], [b]) => (a < b ? -1 : 1))
              .map(([childName, childProperty], i) => (
                <TreeItem key={`${path}.properties.${childName}`}>
                  <PropertyListItem
                    name={childName}
                    path={`${path}.properties.${childName}`}
                    property={childProperty as any}
                    nestedDepth={nestedDepth + 1}
                  />
                </TreeItem>
              ))}
          </Fragment>
        </Tree>
      ) : (
        <Fragment>{renderNoChildren()}</Fragment>
      )}
    </Fragment>
  ) : (
    renderNoChildren()
  );
};
