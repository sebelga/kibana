/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment, useState } from 'react';
import { EuiFlexItem, EuiFlexGroup, EuiButtonIcon } from '@elastic/eui';

import { PropertyView } from './property_view';
import { PropertyEditor } from './property_editor';
import { DeletePropertyProvider } from './delete_property_provider';
import { Tree, TreeItem } from '../tree';
import { usePropertiesState, usePropertiesDispatch } from '../properties_contex';
import { getNestedFieldMeta, getParentObject } from '../../helpers';
interface Props {
  name: string;
  path: string;
  property: Record<string, any>;
  nestedDepth: number;
}

export const PropertyListItem = ({ name, property, path, nestedDepth }: Props) => {
  const { selectedPath, selectedObjectToAddProperty, properties } = usePropertiesState();
  const dispatch = usePropertiesDispatch();

  const {
    hasChildren,
    nestedFieldPropName,
    allowChildProperty,
    childProperties,
  } = getNestedFieldMeta(property);

  const isEditMode = selectedPath === path;
  const isCreateMode = selectedObjectToAddProperty === path;
  const isPropertyEditorVisible = isEditMode || isCreateMode;
  const parentObject = getParentObject(path, properties);
  const [showChildren, setShowChildren] = useState<boolean>(isPropertyEditorVisible);
  // const mapNestedFieldNameToButtonLabel = {
  //   fields: 'Add field',
  //   properties: 'Add property',
  // };

  const onSubmitProperty = ({ name: updatedName, ...rest }: Record<string, any>) => {
    let pathToSaveProperty = path;
    if (isEditMode && updatedName !== name) {
      // The name has been updated, we need to
      // 1. Change the property path to the new path
      // 2. Replace the old property at the new path
      const pathToArray = path.split('.');
      pathToArray[pathToArray.length - 1] = updatedName;
      pathToSaveProperty = pathToArray.join('.');

      dispatch({ type: 'updatePropertyPath', oldPath: path, newPath: pathToSaveProperty });
    } else if (isCreateMode) {
      // nestedFieldPropName is either "properties" (for object and nested types)
      // or "fields" (for text and keyword types).
      pathToSaveProperty = `${path}.${nestedFieldPropName}.${updatedName}`;
      // Make sure the object is unfolded
      setShowChildren(true);
    }
    dispatch({ type: 'saveProperty', path: pathToSaveProperty, value: rest });
  };

  const renderActionButtons = () => (
    <EuiFlexGroup gutterSize="xs">
      {allowChildProperty && (
        <EuiFlexItem>
          <EuiButtonIcon
            color="primary"
            onClick={() => dispatch({ type: 'selectObjectToAddProperty', value: path })}
            iconType="plusInCircle"
            aria-label="Add property"
            disabled={selectedPath !== null || selectedObjectToAddProperty !== null}
          />
        </EuiFlexItem>
      )}
      <EuiFlexItem>
        <EuiButtonIcon
          color="primary"
          onClick={() => dispatch({ type: 'selectPath', value: path })}
          iconType="pencil"
          aria-label="Edit property"
          disabled={selectedPath !== null || selectedObjectToAddProperty !== null}
        />
      </EuiFlexItem>
      <EuiFlexItem>
        <DeletePropertyProvider>
          {deleteProperty => (
            <EuiButtonIcon
              color="danger"
              onClick={() => deleteProperty({ name, ...property }, path)}
              iconType="trash"
              aria-label="Delete property"
              disabled={selectedPath !== null || selectedObjectToAddProperty !== null}
            />
          )}
        </DeletePropertyProvider>
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  const renderEditForm = (style = {}) => (
    <PropertyEditor
      onSubmit={onSubmitProperty}
      onCancel={() =>
        isCreateMode
          ? dispatch({ type: 'selectObjectToAddProperty', value: null })
          : dispatch({ type: 'selectPath', value: null })
      }
      defaultValue={isCreateMode ? undefined : { name, ...property }}
      parentObject={isCreateMode ? property[nestedFieldPropName!] : parentObject}
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
      {isPropertyEditorVisible && renderEditForm()}
    </Fragment>
  );

  return allowChildProperty ? (
    <Fragment>
      {isPropertyEditorVisible && <div className="property-list-item__overlay"></div>}
      {hasChildren ? (
        <Tree
          headerContent={<PropertyView name={name} property={property} />}
          rightHeaderContent={renderActionButtons()}
          isOpen={isPropertyEditorVisible ? true : showChildren}
          onToggle={() => setShowChildren(prev => !prev)}
        >
          <Fragment>
            {isPropertyEditorVisible && renderEditForm({ marginTop: 0, marginBottom: '12px' })}
            {Object.entries(childProperties)
              // Make sure to display the fields in alphabetical order
              .sort(([a], [b]) => (a < b ? -1 : 1))
              .map(([childName, childProperty], i) => (
                <TreeItem key={`${path}.${nestedFieldPropName}.${childName}`}>
                  <PropertyListItem
                    name={childName}
                    path={`${path}.${nestedFieldPropName}.${childName}`}
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
