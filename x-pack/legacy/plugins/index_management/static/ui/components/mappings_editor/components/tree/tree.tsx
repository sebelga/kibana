/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState, Fragment } from 'react';
import { EuiFlexItem, EuiFlexGroup, EuiSpacer, EuiIcon } from '@elastic/eui';

interface Props {
  children: React.ReactNode;
  isInitialOpen?: boolean;
  headerContent?: React.ReactNode;
  rightHeaderContent?: React.ReactNode;
}

export const Tree = ({
  children,
  headerContent,
  rightHeaderContent,
  isInitialOpen = false,
}: Props) => {
  const hasHeader = Boolean(headerContent);
  const [showChildren, setShowChildren] = useState<boolean>(isInitialOpen);

  const toggleShowChildren = () => setShowChildren(previous => !previous);

  return (
    <Fragment>
      {hasHeader && (
        <EuiFlexGroup>
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

                <EuiFlexItem style={{ marginLeft: '6px' }}>{headerContent}</EuiFlexItem>
              </EuiFlexGroup>
            </button>
          </EuiFlexItem>
          {rightHeaderContent && <EuiFlexItem grow={false}>{rightHeaderContent}</EuiFlexItem>}
        </EuiFlexGroup>
      )}
      {showChildren && (
        <Fragment>
          {hasHeader && <EuiSpacer size="m" />}
          <ul className="tree">{children}</ul>
        </Fragment>
      )}
    </Fragment>
  );
};
