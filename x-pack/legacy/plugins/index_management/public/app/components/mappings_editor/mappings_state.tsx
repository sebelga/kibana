/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useReducer, useEffect, createContext, useContext, useMemo, useRef } from 'react';

import {
  reducer,
  addFieldToState,
  MappingsConfiguration,
  MappingsFields,
  State,
  Dispatch,
} from './reducer';
import { Field, FieldsEditor } from './types';
import { normalize, deNormalize, canUseMappingsEditor } from './lib';

type Mappings = MappingsConfiguration & {
  properties: MappingsFields;
};

export interface Types {
  Mappings: Mappings;
  MappingsConfiguration: MappingsConfiguration;
  MappingsFields: MappingsFields;
}

export interface OnUpdateHandlerArg {
  isValid?: boolean;
  getData: (isValid: boolean) => Mappings;
  validate: () => Promise<boolean>;
}

export type OnUpdateHandler = (arg: OnUpdateHandlerArg) => void;

const StateContext = createContext<State | undefined>(undefined);
const DispatchContext = createContext<Dispatch | undefined>(undefined);

export interface Props {
  children: (params: {
    editor: FieldsEditor;
    getProperties(): Mappings['properties'];
    getConfigurationFormData(): Types['MappingsConfiguration'];
  }) => React.ReactNode;
  defaultValue: { fields: { [key: string]: Field }; [key: string]: any };
  onUpdate: OnUpdateHandler;
}

export const MappingsState = React.memo(({ children, onUpdate, defaultValue }: Props) => {
  const didMountRef = useRef(false);

  const { byId, aliases, rootLevelFields, maxNestedDepth } = useMemo(
    () => normalize(defaultValue.fields),
    [defaultValue.fields]
  );

  const canUseDefaultEditor = canUseMappingsEditor(maxNestedDepth);
  const initialState: State = {
    isValid: undefined,
    configuration: {
      data: {
        raw: {},
        format: () => ({} as Mappings),
      },
      validate: () => Promise.resolve(true),
    },
    fields: {
      byId,
      rootLevelFields,
      aliases,
      maxNestedDepth,
    },
    documentFields: {
      status: 'idle',
      editor: canUseDefaultEditor ? 'default' : 'json',
    },
    fieldsJsonEditor: {
      format: () => ({}),
      isValid: true,
    },
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // If we are creating a new field, but haven't entered any name
    // it is valid and we can byPass its form validation (that requires a "name" to be defined)
    const isFieldFormVisible = state.fieldForm !== undefined;
    const emptyNameValue =
      isFieldFormVisible &&
      state.fieldForm!.data.raw.name !== undefined &&
      state.fieldForm!.data.raw.name.trim() === '';

    const bypassFieldFormValidation =
      state.documentFields.status === 'creatingField' && emptyNameValue;

    onUpdate({
      // Output a mappings object from the user's input.
      getData: (isValid: boolean) => {
        let nextState = state;

        if (
          state.documentFields.status === 'creatingField' &&
          isValid &&
          !bypassFieldFormValidation
        ) {
          // If the form field is valid and we are creating a new field that has some data
          // we automatically add the field to our state.
          const fieldFormData = state.fieldForm!.data.format() as Field;
          if (Object.keys(fieldFormData).length !== 0) {
            nextState = addFieldToState(fieldFormData, state);
            dispatch({ type: 'field.add', value: fieldFormData });
          }
        }

        // Pull the mappings properties from the current editor
        const fields =
          nextState.documentFields.editor === 'json'
            ? nextState.fieldsJsonEditor.format()
            : deNormalize(nextState.fields);

        return {
          ...nextState.configuration.data.format(),
          properties: fields,
        };
      },
      validate: async () => {
        /**
         * Note: for now we DON'T validate the configuration form here as it can never be invalid.
         * Otherwise we would have to initialize it: `const promisesToValidate = [state.configuration.validate()];`)
         *
         * This is to simplify the logic and avoid a bug if the form is not present on the screen (we navigated away from its tab)
         * and we click the "next" button. The `state.configuration.validate()` is still in our state, but there aren't any fields
         * so the validity return is "undefined", which blocks the navigation.
         */
        const promisesToValidate = [];

        if (state.fieldForm !== undefined && !bypassFieldFormValidation) {
          promisesToValidate.push(state.fieldForm.validate());
        }

        return Promise.all(promisesToValidate).then(
          validationArray => validationArray.every(Boolean) && state.fieldsJsonEditor.isValid
        );
      },
      isValid: state.isValid,
    });
  }, [state]);

  useEffect(() => {
    if (didMountRef.current) {
      dispatch({
        type: 'editor.replaceMappings',
        value: { ...defaultValue, fields: { byId, aliases, rootLevelFields, maxNestedDepth } },
      });
    } else {
      didMountRef.current = true;
    }
  }, [defaultValue.fields]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children({
          editor: state.documentFields.editor,
          getProperties: () => deNormalize(state.fields),
          getConfigurationFormData: state.configuration.data.format,
        })}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
});

export const useMappingsState = () => {
  const ctx = useContext(StateContext);
  if (ctx === undefined) {
    throw new Error('useMappingsState must be used within a <MappingsState>');
  }
  return ctx;
};

export const useDispatch = () => {
  const ctx = useContext(DispatchContext);
  if (ctx === undefined) {
    throw new Error('useDispatch must be used within a <MappingsState>');
  }
  return ctx;
};
