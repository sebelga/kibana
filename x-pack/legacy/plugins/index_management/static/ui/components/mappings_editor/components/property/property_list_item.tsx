/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { Fragment, useState } from 'react';
import { EuiFlexItem, EuiFlexGroup, EuiSpacer, EuiIcon, EuiButtonIcon } from '@elastic/eui';

import { PropertiesManager } from '../properties_manager';
import { PropertyView } from './property_view';
// import { PropertyEditor } from './property_editor';

interface Props {
  parentPath: string;
  // form: Form;
  name: string;
  property: Record<string, any>;
  onRemove?: () => void;
  fieldPathPrefix?: string;
  // isEditMode?: boolean;
}

export const PropertyListItem = ({ name, property }: Props) => {
  // const isEditMode = false;
  const hasChildren = Boolean(property.properties);
  const [showChildren, setShowChildren] = useState<boolean>(false);

  const toggleShowChildren = () => setShowChildren(previous => !previous);

  const renderItem = () => {
    // Buttons actions
    const buttons = () => (
      <EuiFlexGroup gutterSize="xs">
        <EuiFlexItem>
          <EuiButtonIcon
            color="primary"
            onClick={() => window.alert('Button clicked')}
            iconType="pencil"
            aria-label="Edit"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButtonIcon
            color="danger"
            onClick={() => window.alert('Button clicked')}
            iconType="trash"
            aria-label="Delete"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );

    return (
      <EuiFlexGroup>
        {hasChildren ? (
          <Fragment>
            <EuiFlexItem>
              <button
                onClick={toggleShowChildren}
                type="button"
                style={{
                  animation: 'none',
                }}
              >
                <EuiFlexGroup alignItems="center" responsive={false}>
                  <EuiFlexItem grow={false} style={{ marginLeft: '6px', marginRight: '6px' }}>
                    <EuiIcon type={showChildren ? 'arrowDown' : 'arrowRight'} size="m" />
                  </EuiFlexItem>

                  <EuiFlexItem style={{ marginLeft: '6px' }}>
                    <PropertyView name={name} property={property} />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </button>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>{buttons()}</EuiFlexItem>
          </Fragment>
        ) : (
          <Fragment>
            <EuiFlexItem>
              <PropertyView name={name} property={property} />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>{buttons()}</EuiFlexItem>
          </Fragment>
        )}
      </EuiFlexGroup>
    );
  };

  return (
    <Fragment>
      {renderItem()}
      {showChildren && hasChildren && (
        <Fragment>
          <EuiSpacer size="m" />
          <PropertiesManager
            // form={form}
            parentType="object"
            // path={`${path}.${i}.properties`}
            properties={property.properties}
          />
        </Fragment>
      )}
    </Fragment>
  );
};
