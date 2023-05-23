/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { FC, useCallback, useState } from 'react';
import { of } from 'rxjs';
import { ComponentMeta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import type { ChromeNavLink, ChromeProjectNavigationNode } from '@kbn/core-chrome-browser';

import { EuiButtonIcon, EuiCollapsibleNav, EuiThemeProvider } from '@elastic/eui';
import { css } from '@emotion/react';
import { NavigationStorybookMock } from '../../../mocks';
import mdx from '../../../README.mdx';
import { NavigationProvider } from '../../services';
import { DefaultNavigation } from './default_navigation';
import type { ChromeNavigationViewModel, NavigationServices } from '../../../types';
import { Navigation } from './components';

const storybookMock = new NavigationStorybookMock();

const SIZE_OPEN = 248;
const SIZE_CLOSED = 40;

const NavigationWrapper: FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const collabsibleNavCSS = css`
    border-inline-end-width: 1,
    display: flex,
    flex-direction: row,
  `;

  const CollapseButton = () => {
    const buttonCSS = css`
      margin-left: -32px;
      position: fixed;
      z-index: 1000;
    `;
    return (
      <span css={buttonCSS}>
        <EuiButtonIcon
          iconType={isOpen ? 'menuLeft' : 'menuRight'}
          color={isOpen ? 'ghost' : 'text'}
          onClick={toggleOpen}
        />
      </span>
    );
  };

  const toggleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  return (
    <EuiThemeProvider>
      <EuiCollapsibleNav
        css={collabsibleNavCSS}
        isOpen={true}
        showButtonIfDocked={true}
        onClose={toggleOpen}
        isDocked={true}
        size={isOpen ? SIZE_OPEN : SIZE_CLOSED}
        hideCloseButton={false}
        button={<CollapseButton />}
      >
        {isOpen && children}
      </EuiCollapsibleNav>
    </EuiThemeProvider>
  );
};

const navTree: ChromeProjectNavigationNode[] = [
  {
    id: 'group1',
    title: 'Group 1',
    children: [
      {
        id: 'item1',
        title: 'Group 1: Item 1',
        link: 'group1:item1',
      },
      {
        id: 'groupA',
        link: 'group1:groupA',
        children: [
          {
            id: 'item1',
            title: 'Group 1 > Group A > Item 1',
          },
          {
            id: 'groupI',
            title: 'Group 1 : Group A : Group I',
            children: [
              {
                id: 'item1',
                title: 'Group 1 > Group A > Group 1 > Item 1',
                link: 'group1:groupA:groupI:item1',
              },
              {
                id: 'item2',
                title: 'Group 1 > Group A > Group 1 > Item 2',
              },
            ],
          },
          {
            id: 'item2',
            title: 'Group 1 > Group A > Item 2',
          },
        ],
      },
      {
        id: 'item3',
        title: 'Group 1: Item 3',
      },
    ],
  },
  {
    id: 'group2',
    link: 'group2',
    title: 'Group 2',
    children: [
      {
        id: 'item1',
        title: 'Group 2: Item 1',
        link: 'group2:item1',
      },
      {
        id: 'item2',
        title: 'Group 2: Item 2',
        link: 'group2:item2',
      },
      {
        id: 'item3',
        title: 'Group 2: Item 3',
        link: 'group2:item3',
      },
    ],
  },
  {
    id: 'item1',
    link: 'item1',
  },
  {
    id: 'item2',
    title: 'Item 2',
    link: 'bad',
  },
  {
    id: 'item3',
    title: "I don't have a 'link' prop",
  },
  {
    id: 'item4',
    title: 'Item 4',
  },
];

const baseDeeplink: ChromeNavLink = {
  id: 'foo',
  title: 'Title from deep link',
  href: 'https://elastic.co',
  url: '',
  baseUrl: '',
};

const createDeepLink = (id: string, title: string = baseDeeplink.title) => {
  return {
    ...baseDeeplink,
    id,
    title,
  };
};

const deepLinks: ChromeNavLink[] = [
  createDeepLink('item1'),
  createDeepLink('item2', 'Foo'),
  createDeepLink('group1:item1'),
  createDeepLink('group1:groupA:groupI:item1'),
  createDeepLink('group1:groupA', 'Group title from deep link'),
  createDeepLink('group2', 'Group title from deep link'),
  createDeepLink('group2:item1'),
  createDeepLink('group2:item3'),
];

export const FromObjectConfig = (args: ChromeNavigationViewModel & NavigationServices) => {
  const services = storybookMock.getServices({
    ...args,
    navLinks$: of(deepLinks),
    onProjectNavigationChange: (updated) => {
      action('Update chrome navigation')(JSON.stringify(updated, null, 2));
    },
  });

  return (
    <NavigationProvider {...services}>
      <DefaultNavigation homeRef="/" navTree={navTree} />
    </NavigationProvider>
  );
};

export const FromReactNodes = (args: ChromeNavigationViewModel & NavigationServices) => {
  const services = storybookMock.getServices({
    ...args,
    navLinks$: of(deepLinks),
    onProjectNavigationChange: (updated) => {
      action('Update chrome navigation')(JSON.stringify(updated, null, 2));
    },
  });

  return (
    <NavigationProvider {...services}>
      <Navigation homeRef="/">
        <Navigation.Item link="item1" />
        <Navigation.Item link="unknown" title="This should not appear" />
        <Navigation.Group id="group1" title="My group">
          <Navigation.Item id="item1" title="Item 1" />
          <Navigation.Item link="item2" title="Item 2 - override deeplink title" />
          <Navigation.Item id="item3" title="Item 3" />
        </Navigation.Group>
        <Navigation.Item id="itemLast">Title from react node</Navigation.Item>
      </Navigation>
    </NavigationProvider>
  );
};

export const DefaultUI = (args: ChromeNavigationViewModel & NavigationServices) => {
  const services = storybookMock.getServices({
    ...args,
    navLinks$: of(deepLinks),
    onProjectNavigationChange: (updated) => {
      action('Update chrome navigation')(JSON.stringify(updated, null, 2));
    },
    recentlyAccessed$: of([
      { label: 'This is an example', link: '/app/example/39859', id: '39850' },
      { label: 'Another example', link: '/app/example/5235', id: '5235' },
    ]),
  });

  return (
    <NavigationWrapper>
      <NavigationProvider {...services}>
        <Navigation homeRef="/">
          <Navigation.CloudLink preset="deployments" />
          <Navigation.RecentlyAccessed />

          <Navigation.Group
            id="example_projet"
            title="Example project"
            icon="logoObservability"
            defaultIsCollapsed={false}
          >
            <Navigation.Group id="root">
              <Navigation.Item id="item1" title="Get started" />
              <Navigation.Item id="item2" title="Alerts" />
              <Navigation.Item id="item3" title="Cases" />
            </Navigation.Group>

            <Navigation.Group id="settigns" title="Settings">
              <Navigation.Item id="item1" title="Logs" />
              <Navigation.Item id="item2" title="Signals" />
              <Navigation.Item id="item3" title="Tracing" />
            </Navigation.Group>
          </Navigation.Group>

          <Navigation.Bucket preset="analytics" />

          <Navigation.Footer>
            <Navigation.Bucket preset="devtools" />
          </Navigation.Footer>
        </Navigation>
      </NavigationProvider>
    </NavigationWrapper>
  );
};

export default {
  title: 'Chrome/Navigation/v2',
  description: 'Navigation container to render items for cross-app linking',
  parameters: {
    docs: {
      page: mdx,
    },
  },
  component: FromObjectConfig,
} as ComponentMeta<typeof FromObjectConfig>;
