/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import { EuiTabs, EuiTab } from '@elastic/eui';

import routing from './services/routing';
import { BASE_PATH } from '../../common/constants';

import { CrossClusterReplicationHome, AutoFollowPatternAdd } from './sections';

export class App extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.shape({
        push: PropTypes.func.isRequired,
        createHref: PropTypes.func.isRequired
      }).isRequired
    }).isRequired
  }

  constructor(...args) {
    super(...args);
    this.registerRouter();
  }

  componentWillUnmount() {
    routing.userHasLeftApp = true;
  }

  registerRouter() {
    const { router } = this.context;
    routing.reactRouter = router;
  }

  renderTabs() {
    const { router: { history } } = this.context;

    return (
      <EuiTabs>
        <EuiTab
          onClick={() => history.push('/management/elasticsearch/index_management/home')}
          key={0}
        >
        Index list
        </EuiTab>
        <EuiTab
          isSelected={true}
          onClick={() => undefined}
          key={1}
        >
        Cross Cluster Repication
        </EuiTab>
      </EuiTabs>
    );
  }

  render() {
    return (
      <div>
        {this.renderTabs()}
        <Switch>
          <Redirect exact from={`${BASE_PATH}`} to={`${BASE_PATH}/auto_follow_patterns`} />
          <Route path={`${BASE_PATH}/auto_follow_patterns/add`} component={AutoFollowPatternAdd} />
          <Route path={`${BASE_PATH}/:section`} component={CrossClusterReplicationHome} />
        </Switch>
      </div>
    );
  }
}
