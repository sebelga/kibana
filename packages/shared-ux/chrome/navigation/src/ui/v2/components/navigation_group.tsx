/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createContext, useCallback, useMemo, useContext, FC } from 'react';

import {
  EuiCollapsibleNavGroup,
  EuiIcon,
  EuiSideNav,
  EuiSideNavItemType,
  EuiText,
} from '@elastic/eui';
import type { BasePathService, NavigateToUrlFn } from '../../../../types/internal';
import { useInitNavnode } from '../use_init_navnode';
import { navigationStyles as styles } from '../../../styles';
import { useNavigation as useServices } from '../../../services';
import { InternalNavigationNode, NodeProps, RegisterFunction } from '../types';

export const NavigationGroupContext = createContext<Context | undefined>(undefined);

interface Context {
  register: RegisterFunction;
}

export function useNavigationGroup<T extends boolean = true>(
  throwIfNotFound: T = true as T
): T extends true ? Context : Context | undefined {
  const context = useContext(NavigationGroupContext);
  if (!context && throwIfNotFound) {
    throw new Error('useNavigationGroup must be used within a NavigationGroup provider');
  }
  return context as T extends true ? Context : Context | undefined;
}

const navigationNodeToEuiItem = (
  item: InternalNavigationNode,
  { navigateToUrl, basePath }: { navigateToUrl: NavigateToUrlFn; basePath: BasePathService }
): EuiSideNavItemType<unknown> => {
  const href = item.deepLink?.href;
  const id = item.path ? item.path.join('.') : item.id;

  return {
    id,
    name: item.title,
    onClick:
      href !== undefined
        ? (event: React.MouseEvent) => {
            event.preventDefault();
            navigateToUrl(basePath.prepend(href!));
          }
        : undefined,
    href,
    items: item.children?.map((_item) =>
      navigationNodeToEuiItem(_item, { navigateToUrl, basePath })
    ),
    ['data-test-subj']: `nav-item-${id}`,
    ...(item.icon && {
      icon: <EuiIcon type={item.icon} size="s" />,
    }),
  };
};

interface TopLevelProps {
  navNode: InternalNavigationNode;
  items?: InternalNavigationNode[];
  defaultIsCollapsed?: boolean;
}

const TopLevel: FC<TopLevelProps> = ({ navNode, items = [], defaultIsCollapsed = true }) => {
  const { id, title, icon } = navNode;
  const { navigateToUrl, basePath } = useServices();

  return (
    <EuiCollapsibleNavGroup
      id={id}
      title={title}
      iconType={icon}
      isCollapsible={true}
      initialIsOpen={!defaultIsCollapsed}
      data-test-subj={`nav-bucket-${id}`}
    >
      <EuiText color="default">
        <EuiSideNav
          items={items?.map((item) => navigationNodeToEuiItem(item, { navigateToUrl, basePath }))}
          css={styles.euiSideNavItems}
        />
      </EuiText>
    </EuiCollapsibleNavGroup>
  );
};

interface Props extends NodeProps {
  defaultIsCollapsed?: boolean;
}

function NavigationGroupComp(props: Props) {
  const { children, defaultIsCollapsed, ...node } = props;
  const { navNode, registerChildNode, path, childrenNodes } = useInitNavnode(node);

  const renderContent = useCallback(() => {
    if (!path || !navNode) {
      return null;
    }
    const isTopLevel = path && path.length === 1;

    return (
      <>
        {isTopLevel && (
          <TopLevel
            navNode={navNode}
            items={Object.values(childrenNodes)}
            defaultIsCollapsed={defaultIsCollapsed}
          />
        )}
        {children}
      </>
    );
  }, [navNode, path, childrenNodes, children, defaultIsCollapsed]);

  const contextValue = useMemo(() => {
    return {
      register: registerChildNode,
    };
  }, [registerChildNode]);

  if (!navNode) {
    return null;
  }

  return (
    <NavigationGroupContext.Provider value={contextValue}>
      {renderContent()}
    </NavigationGroupContext.Provider>
  );
}

export const NavigationGroup = React.memo(NavigationGroupComp);
