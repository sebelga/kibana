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

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Context {
  addContent: (content: Content) => void;
  removeContent: (id: string) => void;
  closeFlyout: () => void;
}

interface Content {
  id: string;
  Component: React.FunctionComponent<any>;
  props?: { [key: string]: any };
}

const FlyoutMultiContentContext = createContext<Context | undefined>(undefined);

export const FlyoutMultiContentProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [showFlyout, setShowFlyout] = useState(false);
  const [activeContent, setActiveContent] = useState<Content | undefined>(undefined);

  const addContent: Context['addContent'] = useCallback((content) => {
    setActiveContent(content);
    setShowFlyout(true);
  }, []);

  const removeContent: Context['removeContent'] = useCallback(() => {
    setActiveContent(undefined);
    setShowFlyout(false);
  }, []);

  const closeFlyout: Context['closeFlyout'] = useCallback(() => {
    setShowFlyout(false);
  }, []);

  const context: Context = {
    addContent,
    removeContent,
    closeFlyout,
  };

  const CurrentComponent =
    showFlyout && activeContent !== undefined ? activeContent.Component : null;

  return (
    <FlyoutMultiContentContext.Provider value={context}>
      <>
        {children}
        {CurrentComponent && <CurrentComponent {...activeContent!.props} />}
      </>
    </FlyoutMultiContentContext.Provider>
  );
};

export const useFlyoutMultiContent = () => {
  const ctx = useContext(FlyoutMultiContentContext);

  if (ctx === undefined) {
    throw new Error('useFlyoutMultiContent must be used within a <MultiContentProvider />');
  }

  return ctx;
};
