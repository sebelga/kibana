/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useCallback, useState } from 'react';
import { i18n } from '@kbn/i18n';
import {
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiTitle,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonEmpty,
  EuiButton,
} from '@elastic/eui';
import { DocLinksStart } from 'src/core/public';

import { RuntimeField } from '../../types';
import { FormState } from '../runtime_field_form';
import { RuntimeFieldEditor } from '../runtime_field_editor';

const geti18nTexts = (field?: RuntimeField) => {
  return {
    flyoutTitle: field
      ? i18n.translate('xpack.runtimeFields.editor.flyoutEditFieldTitle', {
          defaultMessage: 'Edit {fieldName} field',
          values: {
            fieldName: field.name,
          },
        })
      : i18n.translate('xpack.runtimeFields.editor.flyoutDefaultTitle', {
          defaultMessage: 'Create new field',
        }),
    closeButtonLabel: i18n.translate('xpack.runtimeFields.editor.flyoutCloseButtonLabel', {
      defaultMessage: 'Close',
    }),
    saveButtonLabel: i18n.translate('xpack.runtimeFields.editor.flyoutSaveButtonLabel', {
      defaultMessage: 'Save',
    }),
  };
};

export interface Props {
  /**
   * Handler for the "save" footer button
   */
  onSave: (field: RuntimeField) => void;
  /**
   * Handler for the "cancel" footer button
   */
  onCancel: () => void;
  /**
   * The docLinks start service from core
   */
  docLinks: DocLinksStart;
  /**
   * An optional runtime field to edit
   */
  field?: RuntimeField;
}

export const RuntimeFieldEditorFlyout = ({ onSave, onCancel, docLinks, field }: Props) => {
  const i18nTexts = geti18nTexts(field);

  const [formState, setFormState] = useState<FormState>({
    isSubmitted: false,
    isValid: field ? true : undefined,
    submit: field
      ? async () => ({ isValid: true, data: field })
      : async () => ({ isValid: false, data: {} as RuntimeField }),
  });
  const { submit, isValid: isFormValid } = formState;

  const onSaveField = useCallback(async () => {
    const { isValid, data } = await submit();

    if (isValid) {
      onSave(data);
    }
  }, [submit, onSave]);

  return (
    <>
      <EuiFlyoutHeader>
        <EuiTitle size="m" data-test-subj="flyoutTitle">
          <h2>{i18nTexts.flyoutTitle}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>

      <EuiFlyoutBody>
        <RuntimeFieldEditor docLinks={docLinks} defaultValue={field} onChange={setFormState} />
      </EuiFlyoutBody>

      <EuiFlyoutFooter>
        <EuiFlexGroup justifyContent="spaceBetween" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              iconType="cross"
              flush="left"
              onClick={() => onCancel()}
              data-test-subj="closeFlyoutButton"
            >
              {i18nTexts.closeButtonLabel}
            </EuiButtonEmpty>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton
              color="primary"
              onClick={() => onSaveField()}
              data-test-subj="saveFieldButton"
              disabled={isFormValid === false}
              fill
            >
              {i18nTexts.saveButtonLabel}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlyoutFooter>
    </>
  );
};
