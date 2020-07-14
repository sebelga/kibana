/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useEffect, useCallback } from 'react';

import { useForm, FlyoutMultiContent } from '../../../../shared_imports';
import { useDispatch, useMappingsState } from '../../../../mappings_state';
import { Field } from '../../../../types';
import { fieldSerializer, fieldDeserializer } from '../../../../lib';
import { ModalConfirmationDeleteFields } from '../modal_confirmation_delete_fields';
import { EditField } from './edit_field';
import { useUpdateField } from './use_update_field';

const { useFlyoutMultiContent } = FlyoutMultiContent;

export const EditFieldContainer = React.memo(() => {
  const { fields, documentFields } = useMappingsState();
  const dispatch = useDispatch();
  const { addContent, closeFlyout } = useFlyoutMultiContent();
  const { isModalOpen, updateField, modalProps } = useUpdateField();

  const { status, fieldToEdit } = documentFields;
  const isEditing = status === 'editingField';

  const field = isEditing ? fields.byId[fieldToEdit!] : undefined;

  const { form } = useForm<Field>({
    defaultValue: { ...field?.source },
    serializer: fieldSerializer,
    deserializer: fieldDeserializer,
    options: { stripEmptyFields: false },
  });

  const { subscribe } = form;

  useEffect(() => {
    const subscription = subscribe((updatedFieldForm) => {
      dispatch({ type: 'fieldForm.update', value: updatedFieldForm });
    });

    return subscription.unsubscribe;
  }, [subscribe, dispatch]);

  const exitEdit = useCallback(() => {
    dispatch({ type: 'documentField.changeStatus', value: 'idle' });
  }, [dispatch]);

  useEffect(() => {
    if (!isEditing) {
      closeFlyout();
    }
  }, [isEditing, closeFlyout]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    addContent({
      id: 'mappingsEditField',
      Component: EditField,
      props: {
        form,
        field,
        exitEdit,
        allFields: fields.byId,
        updateField,
      },
    });
  }, [isEditing, field, form, addContent, fields.byId, fieldToEdit, exitEdit, updateField]);

  return isModalOpen ? <ModalConfirmationDeleteFields {...modalProps} /> : null;
});
