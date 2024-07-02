/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { type FC, useState, useEffect } from 'react';
import { EuiCheckbox, useEuiTheme } from '@elastic/eui';
import type { AirdropContent } from '../types';

interface Props {
  contents: AirdropContent[];
  onSelectionChange: (selected: AirdropContent[]) => void;
}

export const GroupContentSelector: FC<Props> = ({ contents, onSelectionChange }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const { euiTheme } = useEuiTheme();

  useEffect(() => {
    onSelectionChange(contents.filter(({ id }) => selected.includes(id)));
  }, [contents, selected, onSelectionChange]);

  useEffect(() => {
    setSelected(contents.map(({ id }) => id));
  }, [contents]);

  return (
    <ul
      style={{
        backgroundColor: euiTheme.colors.lightestShade,
        padding: euiTheme.size.m,
        borderRadius: euiTheme.border.radius.small,
      }}
    >
      {contents.map(({ id, label }, i) => (
        <li
          key={id}
          style={{ paddingBottom: i === contents.length - 1 ? undefined : euiTheme.size.s }}
        >
          <EuiCheckbox
            id={id}
            label={label ?? id}
            checked={selected.includes(id)}
            onChange={() =>
              setSelected(
                selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
              )
            }
          />
        </li>
      ))}
    </ul>
  );
};
