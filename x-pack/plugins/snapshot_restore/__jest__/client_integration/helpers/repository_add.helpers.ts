/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { registerTestBed, TestBed } from '../../../../../test_utils';
import { RepositoryType } from '../../../common/types';
import { RepositoryAdd } from '../../../public/app/sections/repository_add';
import { WithProviders } from './providers';

const initTestBed = registerTestBed<TestSubjects>(WithProviders(RepositoryAdd));

export interface RepositoryAddTestBed extends TestBed<TestSubjects> {
  actions: {
    clickNextButton: () => void;
    clickBackButton: () => void;
    clickSubmitButton: () => void;
    selectRepositoryType: (type: RepositoryType) => void;
  };
}

export const setup = async (): Promise<RepositoryAddTestBed> => {
  const testBed = await initTestBed();

  // User actions
  const clickNextButton = () => {
    testBed.find('nextButton').simulate('click');
  };

  const clickBackButton = () => {
    testBed.find('backButton').simulate('click');
  };

  const clickSubmitButton = () => {
    testBed.find('submitButton').simulate('click');
  };

  const selectRepositoryType = (type: RepositoryType) => {
    const button = testBed.find(`${type}RepositoryType` as 'fsRepositoryType').find('button');
    if (!button.length) {
      throw new Error(`Repository type "${type}" button not found.`);
    }
    button.simulate('click');
  };

  return {
    ...testBed,
    actions: {
      clickNextButton,
      clickBackButton,
      clickSubmitButton,
      selectRepositoryType,
    },
  };
};

export type TestSubjects =
  | 'azureRepositoryType'
  | 'backButton'
  | 'basePathInput'
  | 'bucketInput'
  | 'bufferSizeInput'
  | 'cannedAclSelect'
  | 'chunkSizeInput'
  | 'clientInput'
  | 'codeEditorContainer'
  | 'codeEditorContainer.codeEditorHint'
  | 'codeEditorHint'
  | 'compressToggle'
  | 'containerInput'
  | 'fsRepositoryType'
  | 'gcsRepositoryType'
  | 'hdfsRepositoryType'
  | 'loadDefaultToggle'
  | 'locationInput'
  | 'locationModeSelect'
  | 'maxRestoreBytesInput'
  | 'maxSnapshotBytesInput'
  | 'maxSnashotBytesInput'
  | 'nameInput'
  | 'nextButton'
  | 'noRepositoryTypesError'
  | 'pageTitle'
  | 'pathInput'
  | 'readOnlyToggle'
  | 'repositoryForm'
  | 'repositoryForm.azureRepositoryType'
  | 'repositoryForm.backButton'
  | 'repositoryForm.basePathInput'
  | 'repositoryForm.bucketInput'
  | 'repositoryForm.bufferSizeInput'
  | 'repositoryForm.cannedAclSelect'
  | 'repositoryForm.chunkSizeInput'
  | 'repositoryForm.clientInput'
  | 'repositoryForm.codeEditorContainer'
  | 'repositoryForm.codeEditorContainer.codeEditorHint'
  | 'repositoryForm.codeEditorHint'
  | 'repositoryForm.compressToggle'
  | 'repositoryForm.containerInput'
  | 'repositoryForm.fsRepositoryType'
  | 'repositoryForm.gcsRepositoryType'
  | 'repositoryForm.hdfsRepositoryType'
  | 'repositoryForm.loadDefaultToggle'
  | 'repositoryForm.locationInput'
  | 'repositoryForm.locationModeSelect'
  | 'repositoryForm.maxRestoreBytesInput'
  | 'repositoryForm.maxSnapshotBytesInput'
  | 'repositoryForm.maxSnashotBytesInput'
  | 'repositoryForm.nameInput'
  | 'repositoryForm.nextButton'
  | 'repositoryForm.pathInput'
  | 'repositoryForm.readOnlyToggle'
  | 'repositoryForm.s3RepositoryType'
  | 'repositoryForm.schemeSelect'
  | 'repositoryForm.securityPrincipalInput'
  | 'repositoryForm.serverSideEncryptionToggle'
  | 'repositoryForm.sourceOnlyToggle'
  | 'repositoryForm.sourceRepositoryType'
  | 'repositoryForm.stepTwo'
  | 'repositoryForm.stepTwo.backButton'
  | 'repositoryForm.stepTwo.basePathInput'
  | 'repositoryForm.stepTwo.bucketInput'
  | 'repositoryForm.stepTwo.bufferSizeInput'
  | 'repositoryForm.stepTwo.cannedAclSelect'
  | 'repositoryForm.stepTwo.chunkSizeInput'
  | 'repositoryForm.stepTwo.clientInput'
  | 'repositoryForm.stepTwo.codeEditorContainer'
  | 'repositoryForm.stepTwo.codeEditorContainer.codeEditorHint'
  | 'repositoryForm.stepTwo.compressToggle'
  | 'repositoryForm.stepTwo.containerInput'
  | 'repositoryForm.stepTwo.loadDefaultToggle'
  | 'repositoryForm.stepTwo.locationInput'
  | 'repositoryForm.stepTwo.locationModeSelect'
  | 'repositoryForm.stepTwo.maxRestoreBytesInput'
  | 'repositoryForm.stepTwo.maxSnapshotBytesInput'
  | 'repositoryForm.stepTwo.maxSnashotBytesInput'
  | 'repositoryForm.stepTwo.pathInput'
  | 'repositoryForm.stepTwo.readOnlyToggle'
  | 'repositoryForm.stepTwo.schemeSelect'
  | 'repositoryForm.stepTwo.securityPrincipalInput'
  | 'repositoryForm.stepTwo.serverSideEncryptionToggle'
  | 'repositoryForm.stepTwo.storageClassSelect'
  | 'repositoryForm.stepTwo.submitButton'
  | 'repositoryForm.stepTwo.title'
  | 'repositoryForm.stepTwo.uriInput'
  | 'repositoryForm.stepTwo.urlInput'
  | 'repositoryForm.storageClassSelect'
  | 'repositoryForm.submitButton'
  | 'repositoryForm.title'
  | 'repositoryForm.uriInput'
  | 'repositoryForm.urlInput'
  | 'repositoryForm.urlRepositoryType'
  | 'saveRepositoryApiError'
  | 's3RepositoryType'
  | 'schemeSelect'
  | 'sectionLoading'
  | 'securityPrincipalInput'
  | 'serverSideEncryptionToggle'
  | 'snapshotRestoreApp'
  | 'snapshotRestoreApp.azureRepositoryType'
  | 'snapshotRestoreApp.backButton'
  | 'snapshotRestoreApp.basePathInput'
  | 'snapshotRestoreApp.bucketInput'
  | 'snapshotRestoreApp.bufferSizeInput'
  | 'snapshotRestoreApp.cannedAclSelect'
  | 'snapshotRestoreApp.chunkSizeInput'
  | 'snapshotRestoreApp.clientInput'
  | 'snapshotRestoreApp.codeEditorContainer'
  | 'snapshotRestoreApp.codeEditorContainer.codeEditorHint'
  | 'snapshotRestoreApp.codeEditorHint'
  | 'snapshotRestoreApp.compressToggle'
  | 'snapshotRestoreApp.containerInput'
  | 'snapshotRestoreApp.fsRepositoryType'
  | 'snapshotRestoreApp.gcsRepositoryType'
  | 'snapshotRestoreApp.hdfsRepositoryType'
  | 'snapshotRestoreApp.loadDefaultToggle'
  | 'snapshotRestoreApp.locationInput'
  | 'snapshotRestoreApp.locationModeSelect'
  | 'snapshotRestoreApp.maxRestoreBytesInput'
  | 'snapshotRestoreApp.maxSnapshotBytesInput'
  | 'snapshotRestoreApp.maxSnashotBytesInput'
  | 'snapshotRestoreApp.nameInput'
  | 'snapshotRestoreApp.nextButton'
  | 'snapshotRestoreApp.pageTitle'
  | 'snapshotRestoreApp.pathInput'
  | 'snapshotRestoreApp.readOnlyToggle'
  | 'snapshotRestoreApp.repositoryForm'
  | 'snapshotRestoreApp.repositoryForm.azureRepositoryType'
  | 'snapshotRestoreApp.repositoryForm.fsRepositoryType'
  | 'snapshotRestoreApp.repositoryForm.gcsRepositoryType'
  | 'snapshotRestoreApp.repositoryForm.hdfsRepositoryType'
  | 'snapshotRestoreApp.repositoryForm.nameInput'
  | 'snapshotRestoreApp.repositoryForm.nextButton'
  | 'snapshotRestoreApp.repositoryForm.s3RepositoryType'
  | 'snapshotRestoreApp.repositoryForm.sourceOnlyToggle'
  | 'snapshotRestoreApp.repositoryForm.sourceRepositoryType'
  | 'snapshotRestoreApp.repositoryForm.stepTwo'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.backButton'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.basePathInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.bucketInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.bufferSizeInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.cannedAclSelect'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.chunkSizeInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.clientInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.codeEditorContainer'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.codeEditorContainer.codeEditorHint'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.compressToggle'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.containerInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.loadDefaultToggle'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.locationInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.locationModeSelect'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.maxRestoreBytesInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.maxSnapshotBytesInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.maxSnashotBytesInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.pathInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.readOnlyToggle'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.schemeSelect'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.securityPrincipalInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.serverSideEncryptionToggle'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.storageClassSelect'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.submitButton'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.title'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.uriInput'
  | 'snapshotRestoreApp.repositoryForm.stepTwo.urlInput'
  | 'snapshotRestoreApp.repositoryForm.urlRepositoryType'
  | 'snapshotRestoreApp.s3RepositoryType'
  | 'snapshotRestoreApp.schemeSelect'
  | 'snapshotRestoreApp.securityPrincipalInput'
  | 'snapshotRestoreApp.serverSideEncryptionToggle'
  | 'snapshotRestoreApp.sourceOnlyToggle'
  | 'snapshotRestoreApp.sourceRepositoryType'
  | 'snapshotRestoreApp.stepTwo'
  | 'snapshotRestoreApp.stepTwo.backButton'
  | 'snapshotRestoreApp.stepTwo.basePathInput'
  | 'snapshotRestoreApp.stepTwo.bucketInput'
  | 'snapshotRestoreApp.stepTwo.bufferSizeInput'
  | 'snapshotRestoreApp.stepTwo.cannedAclSelect'
  | 'snapshotRestoreApp.stepTwo.chunkSizeInput'
  | 'snapshotRestoreApp.stepTwo.clientInput'
  | 'snapshotRestoreApp.stepTwo.codeEditorContainer'
  | 'snapshotRestoreApp.stepTwo.codeEditorContainer.codeEditorHint'
  | 'snapshotRestoreApp.stepTwo.compressToggle'
  | 'snapshotRestoreApp.stepTwo.containerInput'
  | 'snapshotRestoreApp.stepTwo.loadDefaultToggle'
  | 'snapshotRestoreApp.stepTwo.locationInput'
  | 'snapshotRestoreApp.stepTwo.locationModeSelect'
  | 'snapshotRestoreApp.stepTwo.maxRestoreBytesInput'
  | 'snapshotRestoreApp.stepTwo.maxSnapshotBytesInput'
  | 'snapshotRestoreApp.stepTwo.maxSnashotBytesInput'
  | 'snapshotRestoreApp.stepTwo.pathInput'
  | 'snapshotRestoreApp.stepTwo.readOnlyToggle'
  | 'snapshotRestoreApp.stepTwo.schemeSelect'
  | 'snapshotRestoreApp.stepTwo.securityPrincipalInput'
  | 'snapshotRestoreApp.stepTwo.serverSideEncryptionToggle'
  | 'snapshotRestoreApp.stepTwo.storageClassSelect'
  | 'snapshotRestoreApp.stepTwo.submitButton'
  | 'snapshotRestoreApp.stepTwo.title'
  | 'snapshotRestoreApp.stepTwo.uriInput'
  | 'snapshotRestoreApp.stepTwo.urlInput'
  | 'snapshotRestoreApp.storageClassSelect'
  | 'snapshotRestoreApp.submitButton'
  | 'snapshotRestoreApp.title'
  | 'snapshotRestoreApp.uriInput'
  | 'snapshotRestoreApp.urlInput'
  | 'snapshotRestoreApp.urlRepositoryType'
  | 'sourceOnlyToggle'
  | 'sourceRepositoryType'
  | 'stepTwo'
  | 'stepTwo.backButton'
  | 'stepTwo.basePathInput'
  | 'stepTwo.bucketInput'
  | 'stepTwo.bufferSizeInput'
  | 'stepTwo.cannedAclSelect'
  | 'stepTwo.chunkSizeInput'
  | 'stepTwo.clientInput'
  | 'stepTwo.codeEditorContainer'
  | 'stepTwo.codeEditorContainer.codeEditorHint'
  | 'stepTwo.codeEditorHint'
  | 'stepTwo.compressToggle'
  | 'stepTwo.containerInput'
  | 'stepTwo.loadDefaultToggle'
  | 'stepTwo.locationInput'
  | 'stepTwo.locationModeSelect'
  | 'stepTwo.maxRestoreBytesInput'
  | 'stepTwo.maxSnapshotBytesInput'
  | 'stepTwo.maxSnashotBytesInput'
  | 'stepTwo.pathInput'
  | 'stepTwo.readOnlyToggle'
  | 'stepTwo.schemeSelect'
  | 'stepTwo.securityPrincipalInput'
  | 'stepTwo.serverSideEncryptionToggle'
  | 'stepTwo.storageClassSelect'
  | 'stepTwo.submitButton'
  | 'stepTwo.title'
  | 'stepTwo.uriInput'
  | 'stepTwo.urlInput'
  | 'storageClassSelect'
  | 'submitButton'
  | 'title'
  | 'uriInput'
  | 'urlInput'
  | 'urlRepositoryType';
