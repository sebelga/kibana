/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
/* eslint-disable @kbn/eslint/no-restricted-paths */
import { TestUtils } from 'src/plugins/es_ui_shared/public';
import { RepositoryEdit } from '../../../public/application/sections/repository_edit';
import { WithAppDependencies } from './setup_environment';
import { REPOSITORY_NAME } from './constant';

const { registerTestBed } = TestUtils;

const testBedConfig: TestUtils.TestBedConfig = {
  memoryRouter: {
    initialEntries: [`/${REPOSITORY_NAME}`],
    componentRoutePath: '/:name',
  },
  doMountAsync: true,
};

export const setup = registerTestBed<RepositoryEditTestSubjects>(
  WithAppDependencies(RepositoryEdit),
  testBedConfig
);

export type RepositoryEditTestSubjects = TestSubjects | ThreeLevelDepth | NonVisibleTestSubjects;

type NonVisibleTestSubjects =
  | 'uriInput'
  | 'schemeSelect'
  | 'clientInput'
  | 'containerInput'
  | 'basePathInput'
  | 'maxSnapshotBytesInput'
  | 'locationModeSelect'
  | 'bucketInput'
  | 'urlInput'
  | 'pathInput'
  | 'loadDefaultsToggle'
  | 'securityPrincipalInput'
  | 'serverSideEncryptionToggle'
  | 'bufferSizeInput'
  | 'cannedAclSelect'
  | 'storageClassSelect';

type ThreeLevelDepth = 'repositoryForm.stepTwo.title';

type TestSubjects =
  | 'chunkSizeInput'
  | 'compressToggle'
  | 'locationInput'
  | 'maxRestoreBytesInput'
  | 'maxSnapshotBytesInput'
  | 'readOnlyToggle'
  | 'repositoryForm'
  | 'repositoryForm.chunkSizeInput'
  | 'repositoryForm.compressToggle'
  | 'repositoryForm.locationInput'
  | 'repositoryForm.maxRestoreBytesInput'
  | 'repositoryForm.maxSnapshotBytesInput'
  | 'repositoryForm.readOnlyToggle'
  | 'repositoryForm.stepTwo'
  | 'repositoryForm.submitButton'
  | 'repositoryForm.title'
  | 'snapshotRestoreApp'
  | 'snapshotRestoreApp.chunkSizeInput'
  | 'snapshotRestoreApp.compressToggle'
  | 'snapshotRestoreApp.locationInput'
  | 'snapshotRestoreApp.maxRestoreBytesInput'
  | 'snapshotRestoreApp.maxSnapshotBytesInput'
  | 'snapshotRestoreApp.readOnlyToggle'
  | 'snapshotRestoreApp.repositoryForm'
  | 'snapshotRestoreApp.stepTwo'
  | 'snapshotRestoreApp.submitButton'
  | 'snapshotRestoreApp.title'
  | 'stepTwo'
  | 'stepTwo.chunkSizeInput'
  | 'stepTwo.compressToggle'
  | 'stepTwo.locationInput'
  | 'stepTwo.maxRestoreBytesInput'
  | 'stepTwo.maxSnapshotBytesInput'
  | 'stepTwo.readOnlyToggle'
  | 'stepTwo.submitButton'
  | 'stepTwo.title'
  | 'submitButton'
  | 'title';
