/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectI18n, FormattedMessage } from '@kbn/i18n/react';
import chrome from 'ui/chrome';
import { MANAGEMENT_BREADCRUMB } from 'ui/management';

import {
  EuiPageContent,
  EuiButton,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiIcon,

} from '@elastic/eui';

import { listBreadcrumb, editBreadcrumb } from '../../services/breadcrumbs';
import routing from '../../services/routing';
import {
  FollowerIndexForm,
  FollowerIndexPageTitle,
  SectionLoading,
  SectionError,
  RemoteClustersProvider,
} from '../../components';
import { API_STATUS } from '../../constants';

export const FollowerIndexEdit = injectI18n(
  class extends PureComponent {
    static propTypes = {
      getFollowerIndex: PropTypes.func.isRequired,
      selectFollowerIndex: PropTypes.func.isRequired,
      saveFollowerIndex: PropTypes.func.isRequired,
      clearApiError: PropTypes.func.isRequired,
      apiError: PropTypes.object.isRequired,
      apiStatus: PropTypes.object.isRequired,
      followerIndex: PropTypes.object,
      followerIndexId: PropTypes.string,
    }

    static getDerivedStateFromProps({ followerIndexId }, { lastFollowerIndexId }) {
      if (lastFollowerIndexId !== followerIndexId) {
        return { lastFollowerIndexId: followerIndexId };
      }
      return null;
    }

    state = {
      lastFollowerIndexId: undefined,
      showConfirmModal: false,
    }

    componentDidMount() {
      const { match: { params: { id } }, selectFollowerIndex } = this.props;
      let decodedId;
      try {
        // When we navigate through the router (history.push) we need to decode both the uri and the id
        decodedId = decodeURI(id);
        decodedId = decodeURIComponent(decodedId);
      } catch (e) {
        // This is a page load. I guess that AngularJS router does already a decodeURI so it is not
        // necessary in this case.
        decodedId = decodeURIComponent(id);
      }

      selectFollowerIndex(decodedId);

      chrome.breadcrumbs.set([ MANAGEMENT_BREADCRUMB, listBreadcrumb, editBreadcrumb ]);
    }

    componentDidUpdate(prevProps, prevState) {
      const { followerIndex, getFollowerIndex } = this.props;
      if (!followerIndex && prevState.lastFollowerIndexId !== this.state.lastFollowerIndexId) {
        // Fetch the auto-follow pattern on the server
        getFollowerIndex(this.state.lastFollowerIndexId);
      }
    }

    componentWillUnmount() {
      this.props.clearApiError();
    }

    saveFollowerIndex = (name, followerIndex) => {
      this.inflightPayload = { name, followerIndex };
      this.showConfirmModal();
    }

    confirmSaveFollowerIhdex = () => {
      const { name, followerIndex } = this.inflightPayload;
      this.props.saveFollowerIndex(name, followerIndex);
      this.closeConfirmModal();
    }

    showConfirmModal = () => this.setState({ showConfirmModal: true });

    closeConfirmModal = () => this.setState({ showConfirmModal: false });

    renderLoadingFollowerIndex() {
      return (
        <SectionLoading>
          <FormattedMessage
            id="xpack.crossClusterReplication.followerIndexEditForm.loadingFollowerIndexTitle"
            defaultMessage="Loading follower index..."
          />
        </SectionLoading>
      );
    }

    renderGetFollowerIndexError(error) {
      const { intl } = this.props;
      const title = intl.formatMessage({
        id: 'xpack.crossClusterReplication.followerIndexEditForm.loadingErrorTitle',
        defaultMessage: 'Error loading follower index',
      });

      return (
        <Fragment>
          <SectionError title={title} error={error} />
          <EuiSpacer />
          <EuiFlexGroup justifyContent="spaceAround">
            <EuiFlexItem grow={false}>
              <EuiButton
                {...routing.getRouterLinkProps('/follower_indices')}
                fill
                iconType="plusInCircle"
              >
                <FormattedMessage
                  id="xpack.crossClusterReplication.followerIndexEditForm.viewFollowerIndicesButtonLabel"
                  defaultMessage="View follower indices"
                />
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </Fragment>
      );
    }

    renderConfirmModal = () => {
      const { followerIndexId, intl } = this.props;
      const title = intl.formatMessage({
        id: 'xpack.crossClusterReplication.followerIndexEditForm.confirmModal.title',
        defaultMessage: 'Update follower index \'{id}\'',
      }, { id: followerIndexId });

      return (
        <EuiOverlayMask>
          <EuiConfirmModal
            title={title}
            onCancel={this.closeConfirmModal}
            onConfirm={this.confirmSaveFollowerIhdex}
            cancelButtonText={
              intl.formatMessage({
                id: 'xpack.crossClusterReplication.followerIndexEditForm.confirmModal.cancelButtonText',
                defaultMessage: 'Cancel',
              })
            }
            buttonColor="danger"
            confirmButtonText={
              intl.formatMessage({
                id: 'xpack.crossClusterReplication.followerIndexEditForm.confirmModal.confirmButtonText',
                defaultMessage: 'Update',
              })
            }
          >
            <p>
              <EuiIcon type="alert" color="danger" />{' '}
              <FormattedMessage
                id="xpack.crossClusterReplication.followerIndexEditForm.confirmModal.description"
                defaultMessage="To update the follower index, it will first be paused and then resumed."
              />
            </p>
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    render() {
      const {
        clearApiError,
        apiStatus,
        apiError,
        followerIndex,
        match: { url: currentUrl }
      } = this.props;

      const { showConfirmModal } = this.state;

      /* remove non-editable properties */
      const { shards, ...rest } = followerIndex || {}; // eslint-disable-line no-unused-vars

      return (
        <EuiPageContent
          horizontalPosition="center"
          className="ccrPageContent"
        >
          <FollowerIndexPageTitle
            title={(
              <FormattedMessage
                id="xpack.crossClusterReplication.followerIndex.editTitle"
                defaultMessage="Edit follower index"
              />
            )}
          />

          {apiStatus.get === API_STATUS.LOADING && this.renderLoadingFollowerIndex()}

          {apiError.get && this.renderGetFollowerIndexError(apiError.get)}
          { followerIndex && (
            <RemoteClustersProvider>
              {({ isLoading, error, remoteClusters }) => {
                if (isLoading) {
                  return (
                    <SectionLoading>
                      <FormattedMessage
                        id="xpack.crossClusterReplication.followerIndexCreateForm.loadingRemoteClusters"
                        defaultMessage="Loading remote clusters..."
                      />
                    </SectionLoading>
                  );
                }

                if (error) {
                  remoteClusters = [];
                }

                return (
                  <FollowerIndexForm
                    followerIndex={rest}
                    apiStatus={apiStatus.save}
                    apiError={apiError.save}
                    currentUrl={currentUrl}
                    remoteClusters={remoteClusters}
                    saveFollowerIndex={this.saveFollowerIndex}
                    clearApiError={clearApiError}
                  />
                );
              }}
            </RemoteClustersProvider>
          ) }

          { showConfirmModal && this.renderConfirmModal() }
        </EuiPageContent>
      );
    }
  }
);
