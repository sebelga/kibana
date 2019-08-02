/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment, useState } from 'react';
import {
  EuiText,
  EuiFlexItem,
  EuiFlexGroup,
  EuiAccordion,
  EuiBadge,
} from '@elastic/eui';

export function childrenToArray(children) {
  if (!children) {
    return [];
  }

  return Object.keys(children).map(name => ({
    name,
    ...children[name]
  }));
}

function isFieldOpen(field, children) {
  // Of course a selected item is open.
  if (field.isSelected) {
    return true;
  }

  // The item has to be open if it has a child that's open.
  if (children) {
    return children.some(isFieldOpen);
  }
};

const ReadOnlyField = ({
  children,
  onToggle,
  isOpen,
  isSelected,
  isParent,
  fields,
  depth,
  ...rest
}) => {
  const {
    type,
  } = rest;

  console.log('rest', rest)

  const badges = (
    <Fragment>
      {['index', 'doc_values', 'store'].reduce((accum, field) => {
        if (rest[field]) {
          accum.push(
            <EuiFlexItem grow={false}>
              <EuiBadge color="hollow">{field}</EuiBadge>
            </EuiFlexItem>
          );
        }
        return accum;
      }, [])}
    </Fragment>
  );

  const accordion = isParent ? (
    <EuiAccordion
      id={children}
      buttonContent={`${children.length} fields`}
    >
      <div style={{ marginLeft: '8px' }}>
        {fields}
      </div>
    </EuiAccordion>
  ) : null;

  return (
    <div>
      <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiText>{children}</EuiText>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiFlexGroup alignItems="center">
            {badges}
            <EuiFlexItem grow={false}>
              <EuiText size="s">{type}</EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>

      {accordion}
    </div>
  );
};

export const ReadOnlyFields = ({
  fields
}) => {
  const [setFieldSelection, selectedFields] = useState({});

  function toggleFieldSelection(name) {
    if (selectedFields[name]) {
      delete selectedFields[name];
    } else {
      selectedFields[name] = true;
    }
    setFieldSelection(selectedFields);
  }
  console.log('fields', fields)
  function renderTree(fields, depth = 0) {
    return fields.map(field => {
      const {
        name,
        properties,
        fields,
        ...rest
      } = field;

      const children = childrenToArray(properties || fields);

      // Root items are always open.
      const isOpen = depth === 0 ? true : isFieldOpen(field, children);

      let renderedFields;

      if (children) {
        renderedFields = renderTree(children, depth + 1);
      }

      return (
        <ReadOnlyField
          isOpen={isOpen}
          isSelected={selectedFields[name]}
          isParent={!!children.length}
          fields={renderedFields}
          depth={depth}
          onToggle={() => toggleFieldSelection(name)}
          {...rest}
        >
          {name}
        </ReadOnlyField>
      );
    });
  }
  return (
    <div>
      {renderTree(fields)}
    </div>
  );
};
