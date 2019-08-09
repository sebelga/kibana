/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { ValidationFunc } from '../../hook_form_lib';
import { hasMinLengthString } from '../../../validators/string';
import { hasMinLengthArray } from '../../../validators/array';
import { minLengthError } from '../../errors';

export const minLengthField = (length = 0) => (
  ...args: Parameters<ValidationFunc>
): ReturnType<ValidationFunc> => {
  const [{ value }] = args;

  if (Array.isArray(value)) {
    return hasMinLengthArray(length)(value) ? undefined : minLengthError(length);
  }
  return hasMinLengthString(length)((value as string).trim()) ? undefined : minLengthError(length);
};
