/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { i18n } from '@kbn/i18n';
import { pick } from 'lodash';
import { EuiSpacer, EuiTabs, EuiTab } from '@elastic/eui';

import {
  ConfigurationForm,
  CONFIGURATION_FIELDS,
  DocumentFieldsHeader,
  DocumentFields,
  DocumentFieldsJsonEditor,
} from './components';
import { IndexSettings } from './types';
import { MappingsState, Props as MappingsStateProps, Types } from './mappings_state';
import { IndexSettingsProvider } from './index_settings_context';

interface Props {
  onUpdate: MappingsStateProps['onUpdate'];
  defaultValue?: { [key: string]: any };
  indexSettings?: IndexSettings;
}

export const MappingsEditor = React.memo(
  ({ onUpdate, defaultValue = {}, indexSettings }: Props) => {
    const [selectedTab, selectTab] = useState<'fields' | 'advanced'>('fields');

    const { configurationDefaultValue, fieldsDefaultValue } = useMemo(
      () => ({
        configurationDefaultValue: pick(
          defaultValue,
          CONFIGURATION_FIELDS
        ) as Types['MappingsConfiguration'],
        fieldsDefaultValue: defaultValue.properties || {},
      }),
      [defaultValue]
    );

    /**
     * We keep a reference of the configuration form data that we will update
     * each time we switch tab, from form --> fields.
     */
    const configurationFormData = useRef(configurationDefaultValue);

    useEffect(() => {
      configurationFormData.current = configurationDefaultValue;
    }, [configurationDefaultValue]);

    return (
      <IndexSettingsProvider indexSettings={indexSettings}>
        <MappingsState
          onUpdate={onUpdate}
          defaultValue={{ ...configurationDefaultValue, fields: fieldsDefaultValue }}
        >
          {({ editor: editorType, getProperties, getConfigurationFormData }) => {
            const editor =
              editorType === 'json' ? (
                <DocumentFieldsJsonEditor defaultValue={getProperties()} />
              ) : (
                <DocumentFields />
              );

            const content =
              selectedTab === 'fields' ? (
                <>
                  <DocumentFieldsHeader />
                  <EuiSpacer size="m" />
                  {editor}
                </>
              ) : (
                <ConfigurationForm defaultValue={configurationFormData.current} />
              );

            return (
              <div className="mappingsEditor">
                <EuiTabs>
                  <EuiTab
                    onClick={() => {
                      /**
                       * Make sure to update our reference to the configuration form data
                       * so we can provided it to the form when navigating to its tab.

                       * Note: for now this is enough as the form can never be invalid. In the future,
                       * if we add some fields that require validationg, we would need to validate the form
                       * at this step and maybe show a CallOut to the user in case the form is invalid.
                       */
                      configurationFormData.current = getConfigurationFormData();
                      selectTab('fields');
                    }}
                    isSelected={selectedTab === 'fields'}
                  >
                    {i18n.translate('xpack.idxMgmt.mappingsEditor.fieldsTabLabel', {
                      defaultMessage: 'Mapped fields',
                    })}
                  </EuiTab>
                  <EuiTab
                    onClick={() => selectTab('advanced')}
                    isSelected={selectedTab === 'advanced'}
                  >
                    {i18n.translate('xpack.idxMgmt.mappingsEditor.advancedTabLabel', {
                      defaultMessage: 'Advanced options',
                    })}
                  </EuiTab>
                </EuiTabs>

                <EuiSpacer size="l" />

                {content}
              </div>
            );
          }}
        </MappingsState>
      </IndexSettingsProvider>
    );
  }
);
