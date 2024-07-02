/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';

import { EXCEPTION_LIST_URL, EXCEPTION_LIST_ITEM_URL } from '@kbn/securitysolution-list-constants';
import { getExceptionListItemResponseMockWithoutAutoGeneratedValues } from '@kbn/lists-plugin/common/schemas/response/exception_list_item_schema.mock';
import {
  getCreateExceptionListItemMinimalSchemaMock,
  getCreateExceptionListItemMinimalSchemaMockWithoutId,
} from '@kbn/lists-plugin/common/schemas/request/create_exception_list_item_schema.mock';
import {
  getCreateExceptionListMinimalSchemaMock,
  getCreateExceptionListDetectionSchemaMock,
} from '@kbn/lists-plugin/common/schemas/request/create_exception_list_schema.mock';

import {
  deleteAllExceptions,
  removeExceptionListItemServerGeneratedProperties,
} from '../../../utils';

import { FtrProviderContext } from '../../../../../ftr_provider_context';

export default ({ getService }: FtrProviderContext): void => {
  const supertest = getService('supertest');
  const log = getService('log');
  const utils = getService('securitySolutionUtils');

  describe('@ess @serverless find_exception_list_items', () => {
    describe('find exception list items', () => {
      afterEach(async () => {
        await deleteAllExceptions(supertest, log);
      });

      it('should return an empty find body correctly if no exception list items are loaded', async () => {
        await supertest
          .post(EXCEPTION_LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateExceptionListMinimalSchemaMock())
          .expect(200);

        const { body } = await supertest
          .get(
            `${EXCEPTION_LIST_ITEM_URL}/_find?list_id=${
              getCreateExceptionListMinimalSchemaMock().list_id
            }`
          )
          .set('kbn-xsrf', 'true')
          .send()
          .expect(200);

        expect(body).to.eql({
          data: [],
          page: 1,
          per_page: 20,
          total: 0,
        });
      });

      it('should return matching items when search is passed in', async () => {
        // create exception list
        await supertest
          .post(EXCEPTION_LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateExceptionListDetectionSchemaMock())
          .expect(200);

        // create exception list items
        await supertest
          .post(EXCEPTION_LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send({
            ...getCreateExceptionListItemMinimalSchemaMockWithoutId(),
            list_id: getCreateExceptionListDetectionSchemaMock().list_id,
            item_id: '1',
            entries: [
              { field: 'host.name', value: 'some host', operator: 'included', type: 'match' },
            ],
          })
          .expect(200);
        await supertest
          .post(EXCEPTION_LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send({
            ...getCreateExceptionListItemMinimalSchemaMockWithoutId(),
            item_id: '2',
            list_id: getCreateExceptionListDetectionSchemaMock().list_id,
            entries: [{ field: 'foo', operator: 'included', type: 'exists' }],
          })
          .expect(200);

        const { body } = await supertest
          .get(
            `${EXCEPTION_LIST_ITEM_URL}/_find?list_id=${
              getCreateExceptionListMinimalSchemaMock().list_id
            }&namespace_type=single&page=1&per_page=25&search=host&sort_field=exception-list.created_at&sort_order=desc`
          )
          .set('kbn-xsrf', 'true')
          .send()
          .expect(200);

        body.data = [removeExceptionListItemServerGeneratedProperties(body.data[0])];
        const username = await utils.getUsername();
        expect(body).to.eql({
          data: [
            {
              comments: [],
              created_by: username,
              description: 'some description',
              entries: [
                {
                  field: 'host.name',
                  operator: 'included',
                  type: 'match',
                  value: 'some host',
                },
              ],
              item_id: '1',
              list_id: 'some-list-id',
              name: 'some name',
              namespace_type: 'single',
              os_types: ['windows'],
              tags: [],
              type: 'simple',
              updated_by: username,
            },
          ],
          page: 1,
          per_page: 25,
          total: 1,
        });
      });

      it('should return 404 if given a list_id that does not exist', async () => {
        const { body } = await supertest
          .get(`${EXCEPTION_LIST_ITEM_URL}/_find?list_id=non_exist`)
          .set('kbn-xsrf', 'true')
          .send()
          .expect(404);

        expect(body).to.eql({
          message: 'exception list id: "non_exist" does not exist',
          status_code: 404,
        });
      });

      it('should return a single exception list item when a single exception list item is loaded from a find with defaults added', async () => {
        // add the exception list
        await supertest
          .post(EXCEPTION_LIST_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateExceptionListMinimalSchemaMock())
          .expect(200);

        // add a single exception list item
        await supertest
          .post(EXCEPTION_LIST_ITEM_URL)
          .set('kbn-xsrf', 'true')
          .send(getCreateExceptionListItemMinimalSchemaMock())
          .expect(200);

        // query the single exception list from _find
        const { body } = await supertest
          .get(
            `${EXCEPTION_LIST_ITEM_URL}/_find?list_id=${
              getCreateExceptionListMinimalSchemaMock().list_id
            }`
          )
          .set('kbn-xsrf', 'true')
          .send()
          .expect(200);

        body.data = [removeExceptionListItemServerGeneratedProperties(body.data[0])];
        expect(body).to.eql({
          data: [
            getExceptionListItemResponseMockWithoutAutoGeneratedValues(await utils.getUsername()),
          ],
          page: 1,
          per_page: 20,
          total: 1,
        });
      });
    });
  });
};
