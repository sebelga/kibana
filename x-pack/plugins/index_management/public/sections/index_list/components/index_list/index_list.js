/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';

import {
  DetailPanel,
  IndexTable,
} from '../../components';
import {
  REFRESH_RATE_INDEX_LIST
} from '../../../../constants';

import { EuiTabs, EuiTab } from '@elastic/eui';

export class IndexList extends React.PureComponent {
  componentWillMount() {
    this.props.loadIndices();
  }

  componentDidMount() {
    this.interval = setInterval(this.props.reloadIndices, REFRESH_RATE_INDEX_LIST);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  renderTabs() {
    const { history } = this.props;

    return (
      <EuiTabs>
        <EuiTab
          isSelected={true}
          onClick={() => undefined}
          key={0}
        >
        Index list
        </EuiTab>
        <EuiTab
          onClick={() => history.push('/management/elasticsearch/cross_cluster_replication')}
          key={1}
        >
        Cross Cluster Repication
        </EuiTab>
      </EuiTabs>
    );
  }

  render() {
    return (
      <div className="indTable__horizontalScroll im-snapshotTestSubject">
        {this.renderTabs()}
        <IndexTable />
        <DetailPanel />
      </div>
    );
  }
}
