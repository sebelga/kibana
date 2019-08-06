/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { useReducer, useContext } from 'react';

interface State {
  properties: Record<string, any>;
  selectedPath: string | null;
}

type Action =
  | { type: 'selectPath'; value: string | null }
  | { type: 'saveProperty'; name: string; value: Record<string, any> };

type Dispatch = (action: Action) => void;

const PropertiesStateContext = React.createContext<State | undefined>(undefined);
const PropertiesDispatchContext = React.createContext<Dispatch | undefined>(undefined);

function propertiesReducer(state: State, action: Action) {
  switch (action.type) {
    case 'selectPath':
      return { ...state, selectedPath: action.value };
    case 'saveProperty':
      return { ...state, properties: { ...state.properties, [action.name]: action.value } };
    default:
      throw new Error(`Unhandled action type: ${action!.type}`);
  }
}

interface Props {
  children: React.ReactNode;
  defaultProperties?: Record<string, any>;
}

export const PropertiesProvider = ({ children, defaultProperties = {} }: Props) => {
  const [state, dispatch] = useReducer(propertiesReducer, {
    properties: defaultProperties,
    selectedPath: null,
  });

  return (
    <PropertiesStateContext.Provider value={state}>
      <PropertiesDispatchContext.Provider value={dispatch}>
        {children}
      </PropertiesDispatchContext.Provider>
    </PropertiesStateContext.Provider>
  );
};

export const PropertiesConsumer = PropertiesStateContext.Consumer;

export const usePropertiesState = () => {
  const context = useContext(PropertiesStateContext);
  if (context === undefined) {
    throw new Error('usePropertiesState must be used within a <PropertiesProvider />');
  }
  return context;
};

export const usePropertiesDispatch = () => {
  const context = useContext(PropertiesDispatchContext);
  if (context === undefined) {
    throw new Error('usePropertiesState must be used within a <PropertiesProvider />');
  }
  return context;
};
