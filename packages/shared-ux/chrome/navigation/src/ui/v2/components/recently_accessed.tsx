/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { EuiCollapsibleNavGroup, EuiSideNav, EuiSideNavItemType } from '@elastic/eui';
import React, { FC } from 'react';
import useObservable from 'react-use/lib/useObservable';
import type { Observable } from 'rxjs';

import { RecentItem } from '../../../../types/internal';
import { useNavigation as useServices } from '../../../services';
import { navigationStyles as styles } from '../../../styles';

import { getI18nStrings } from '../../i18n_strings';

interface Props {
  recentlyAccessed$?: Observable<RecentItem[]>;
  /**
   * If true, the recently accessed list will be collapsed by default.
   * @default false
   */
  defaultIsCollapsed?: boolean;
}

export const RecentlyAccessed: FC<Props> = ({
  recentlyAccessed$: recentlyAccessedProp$,
  defaultIsCollapsed = false,
}) => {
  const strings = getI18nStrings();
  const { recentlyAccessed$ } = useServices();
  const recentlyAccessed = useObservable(recentlyAccessedProp$ ?? recentlyAccessed$, []);

  if (recentlyAccessed.length === 0) {
    return null;
  }

  const navItems: Array<EuiSideNavItemType<unknown>> = [
    {
      name: '', // no list header title
      id: 'recents_root',
      items: recentlyAccessed.map(({ id, label, link }) => ({
        id,
        name: label,
        href: link,
      })),
    },
  ];

  return (
    <EuiCollapsibleNavGroup
      title={strings.recentlyAccessed}
      iconType="clock"
      isCollapsible={true}
      initialIsOpen={!defaultIsCollapsed}
      data-test-subj={`nav-bucket-recentlyAccessed`}
    >
      <EuiSideNav items={navItems} css={styles.euiSideNavItems} />
    </EuiCollapsibleNavGroup>
  );
};
