/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useState } from 'react';
import { i18n } from '@kbn/i18n';
import { EuiConfirmModal, EuiOverlayMask } from '@elastic/eui';

import { NormalizedField } from '../../types';

type OpenJsonModalFunc = () => void;

interface Props {
  onJson(json: { [key: string]: any }): void;
  children: (deleteProperty: OpenJsonModalFunc) => React.ReactNode;
}

interface State {
  isModalOpen: boolean;
  field?: NormalizedField;
  aliases?: string[];
}

const i18nTexts = {
  modalTitle: i18n.translate('xpack.idxMgmt.mappingsEditor.loadMappingsModal.title', {
    defaultMessage: 'Load mappings from JSON object',
  }),
  buttons: {
    confirm: i18n.translate('xpack.idxMgmt.mappingsEditor.loadMappingsModal.loadButtonLabel', {
      defaultMessage: 'Load',
    }),
    cancel: i18n.translate('xpack.idxMgmt.mappingsEditor.loadMappingsModal.cancelButtonLabel', {
      defaultMessage: 'Cancel',
    }),
  },
};

export const LoadMappingsProvider = ({ onJson, children }: Props) => {
  const [state, setState] = useState<State>({ isModalOpen: false });

  const openModal: OpenJsonModalFunc = () => {
    setState({ isModalOpen: true });
  };

  const closeModal = () => {
    setState({ isModalOpen: false });
  };

  const loadJson = () => {
    // Temp dummy object
    const json: { [key: string]: any } = {
      _source: {
        enabled: true,
        includes: ['hello.*', 'world'],
        excludes: ['awesome.*'],
      },
      numeric_detection: true,
      date_detection: true,
      dynamic_date_formats: ['strict_date_optional_time'],
      dynamic: true,
      properties: {
        title: {
          type: 'text',
        },
        other: {
          type: 'text',
        },
        myObject: {
          type: 'object',
          properties: {
            prop1: {
              type: 'text',
            },
            prorp2: {
              type: 'text',
            },
            prop3: {
              type: 'text',
            },
          },
        },
      },
    };
    onJson(json);
    closeModal();
  };

  return (
    <>
      {children(openModal)}

      {state.isModalOpen && (
        <EuiOverlayMask>
          <EuiConfirmModal
            title={i18nTexts.modalTitle}
            onCancel={closeModal}
            onConfirm={loadJson}
            cancelButtonText={i18nTexts.buttons.cancel}
            buttonColor="danger"
            confirmButtonText={i18nTexts.buttons.confirm}
          >
            <>
              <p>JSON editor here....</p>
            </>
          </EuiConfirmModal>
        </EuiOverlayMask>
      )}
    </>
  );
};
