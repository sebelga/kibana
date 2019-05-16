/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { act } from 'react-dom/test-utils';

import { INVALID_NAME_CHARS } from '../../public/app/services/validation/validate_repository';
import { getRepository } from '../../test/fixtures';
import { setupEnvironment, pageHelpers, nextTick } from './helpers';
import { RepositoryAddTestBed } from './helpers/repository_add.helpers';

const { setup } = pageHelpers.repositoryAdd;

describe('<RepositoryAdd />', () => {
  let testBed: RepositoryAddTestBed;

  const { server, httpRequestsMockHelpers } = setupEnvironment();

  afterAll(() => {
    server.restore();
  });

  describe('on component mount', () => {
    beforeEach(async () => {
      httpRequestsMockHelpers.setLoadRepositoryTypesResponse(['fs', 'url']);

      testBed = await setup();
    });

    test('should set the correct page title', () => {
      const { exists, find } = testBed;
      expect(exists('pageTitle')).toBe(true);
      expect(find('pageTitle').text()).toEqual('Register repository');
    });

    test('should not let the user go to the next step if some fields are missing', () => {
      const { form, actions } = testBed;

      // click next button

      // check errors are ['Repository name is required.', 'Type is required.',]
    });
  });

  describe('form validation (step 1)', () => {
    describe('name', () => {
      it('should not allow invalid characters', () => {
        const { form, actions } = testBed;

        const expectErrorForChar = (char: string) => {
          // Set input value with char

          actions.clickNextButton();

          try {
            expect(form.getErrorsMessages()).toContain(
              `Character "${char}" is not allowed in the name.`
            );
          } catch {
            throw new Error(`Invalid character ${char} did not display an error.`);
          }
        };

        INVALID_NAME_CHARS.forEach(expectErrorForChar);
      });
    });
  });

  describe('step 2 form', () => {
    const repository = getRepository();

    beforeEach(async () => {
      httpRequestsMockHelpers.setLoadRepositoryTypesResponse(['fs', 'url']);

      testBed = await setup();

      // Fill step 1 required fields and go to step 2
      testBed.form.setInputValue('nameInput', repository.name);
      testBed.actions.selectRepositoryType(repository.type);
      testBed.actions.clickNextButton();
    });

    test('should send the correct payload', async () => {
      const { form, actions } = testBed;

      // set "locationInput" to repository.settings.location
      // select checkbox "compressToggle"

      await act(async () => {
        // click submit button
        await nextTick();
      });

      // get latest server request

      // check requestBody has correct (stringify) name, type, settings
    });

    test('should display API errors if any while saving', async () => {
      const { component, form, actions, find, exists } = testBed;

      form.setInputValue('locationInput', repository.settings.location);

      const error = {
        statusCode: 400,
        error: 'Bad request',
        message: 'Repository payload is invalid',
      };

      // mock save repository request (with error.body)

      await act(async () => {
        // click submit button
        await nextTick();
        component.update();
      });

      // check "saveRepositoryApiError" and its content
    });
  });
});
