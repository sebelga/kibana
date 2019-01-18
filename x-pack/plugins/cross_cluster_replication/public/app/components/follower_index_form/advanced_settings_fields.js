/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';

export const advancedSettingsFields = [
  {
    field: 'maxReadRequestOperationCount',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxReadRequestOperationCountTitle', {
        defaultMessage: 'Max read request operation count'
      }
    ),
    description: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxReadRequestOperationCountDescription', {
        defaultMessage: 'The maximum number of operations to pull per read from the remote cluster.'
      }
    ),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxReadRequestOperationCountLabel', {
        defaultMessage: 'Max read request operation count (optional)'
      }
    ),
    type: 'number',
  }, {
    field: 'maxOutstandingReadRequests',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxOutstandingReadRequestsTitle', {
        defaultMessage: 'Max outstanding read requests'
      }
    ),
    description: i18n.translate('xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxOutstandingReadRequestsDescription', {
      defaultMessage: 'The maximum number of outstanding read requests from the remote cluster.'
    }),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxOutstandingReadRequestsLabel', {
        defaultMessage: 'Max outstanding read requests (optional)'
      }
    ),
    type: 'number',
  }, {
    field: 'maxReadRequestSize',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxReadRequestSizeTitle', {
        defaultMessage: 'Max read request size'
      }
    ),
    description: i18n.translate('xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxReadRequestSizeDescription', {
      defaultMessage: 'The maximum size in bytes of per read of a batch of operations pulled from the remote cluster.'
    }),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxReadRequestSizeLabel', {
        defaultMessage: 'Max read request size (optional)'
      }
    ),
  }, {
    field: 'maxWriteRequestOperationCount',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteRequestOperationCountTitle', {
        defaultMessage: 'Max write request operation count'
      }
    ),
    description: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteRequestOperationCountDescription', {
        defaultMessage: 'The maximum number of operations per bulk write request executed on the follower.'
      }
    ),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteRequestOperationCountLabel', {
        defaultMessage: 'Max write request operation count (optional)'
      }
    ),
    type: 'number',
  }, {
    field: 'maxWriteRequestSize',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteRequestSizeTitle', {
        defaultMessage: 'Max write request size'
      }
    ),
    description: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteRequestSizeDescription', {
        defaultMessage: 'The maximum total bytes of operations per bulk write request executed on the follower.'
      }
    ),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteRequestSizeLabel', {
        defaultMessage: 'Max write request size (optional)'
      }
    ),
  }, {
    field: 'maxOutstandingWriteRequests',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxOutstandingWriteRequestsTitle', {
        defaultMessage: 'Max outstanding write requests'
      }
    ),
    description: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxOutstandingWriteRequestsDescription', {
        defaultMessage: 'The maximum number of outstanding write requests on the follower.'
      }
    ),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxOutstandingWriteRequestsLabel', {
        defaultMessage: 'Max outstanding write requests (optional)'
      }
    ),
    type: 'number',
  }, {
    field: 'maxWriteBufferCount',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteBufferCountTitle', {
        defaultMessage: 'Max write buffer count'
      }
    ),
    description: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteBufferCountDescription', {
        defaultMessage: `The maximum number of operations that can be queued for writing; when this
          limit is reached, reads from the remote cluster will be deferred until the number of queued
          operations goes below the limit.`
      }
    ),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteBufferCountLabel', {
        defaultMessage: 'Max write buffer count (optional)'
      }
    ),
    type: 'number',
  }, {
    field: 'maxWriteBufferSize',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteBufferSizeTitle', {
        defaultMessage: 'Max write buffer size'
      }
    ),
    description: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteBufferSizeDescription', {
        defaultMessage: `The maximum total bytes of operations that can be queued for writing; when
          this limit is reached, reads from the remote cluster will be deferred until the total bytes
          of queued operations goes below the limit.`
      }
    ),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxWriteBufferSizeLabel', {
        defaultMessage: 'Max write buffer size (optional)'
      }
    ),
  }, {
    field: 'maxRetryDelay',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxRetryDelayTitle', {
        defaultMessage: 'Max retry delay'
      }
    ),
    description: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxRetryDelayDescription', {
        defaultMessage: `The maximum time to wait before retrying an operation that failed exceptionally;
        an exponential backoff strategy is employed when retrying.`
      }
    ),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.maxRetryDelayLabel', {
        defaultMessage: 'Max retry delay (optional)'
      }
    ),
  }, {
    field: 'readPollTimeout',
    title: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.readPollTimeoutTitle', {
        defaultMessage: 'Read poll timeout'
      }
    ),
    description: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.readPollTimeoutDescription', {
        defaultMessage: `The maximum time to wait for new operations on the remote cluster when the
          follower index is synchronized with the leader index; when the timeout has elapsed, the
          poll for operations will return to the follower so that it can update some statistics, and
          then the follower will immediately attempt to read from the leader again.`
      }
    ),
    label: i18n.translate(
      'xpack.crossClusterReplication.followerIndexForm.advancedSettings.readPollTimeoutLabel', {
        defaultMessage: 'Read poll timeout (optional)'
      }
    ),
  },
];

export const emptyAdvancedSettings = advancedSettingsFields.reduce((obj, advancedSetting) => {
  return { ...obj, [advancedSetting.field]: '' };
}, {});
