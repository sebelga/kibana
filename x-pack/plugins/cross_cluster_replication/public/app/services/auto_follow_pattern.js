/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { format, addDays } from 'date-fns';

export const getFollowPattern = (prefix = '', suffix = '', template = '{{leader_index}}') => (
  <Fragment>
    <span style={{ fontWeight: 'bold' }}>{prefix}</span>
    {template}
    <span style={{ fontWeight: 'bold' }}>{suffix}</span>
  </Fragment>
);

/**
 * Generate an array of indices preview that would be generated for an auto-follow pattern.
 * It concatenates the prefix + the leader index pattern populated with values + the suffix
 *
 * Example of the array returned:
 * ["prefix_leader-index-0_suffix", "prefix_leader-index-1_suffix", "prefix_leader-index-2_suffix"]
 */
export const getPreviewIndicesFromAutoFollowPattern = ({
  prefix,
  suffix,
  leaderIndexPatterns,
  limit = 5,
  wildcardPlaceHolders = [
    format(new Date(), 'YYYY-MM-DD'),
    format(addDays(new Date(), 1), 'YYYY-MM-DD'),
    format(addDays(new Date(), 2), 'YYYY-MM-DD'),
  ]
}) => {
  const indicesPreview = [];
  let indexPreview;
  let leaderIndexTemplate;

  leaderIndexPatterns.forEach((leaderIndexPattern) => {
    wildcardPlaceHolders.forEach((placeHolder) => {
      leaderIndexTemplate = leaderIndexPattern.replace(/\*/g, placeHolder);
      indexPreview = getFollowPattern(prefix, suffix, leaderIndexTemplate);

      if (!indicesPreview.includes(indexPreview)) {
        indicesPreview.push(indexPreview);
      }
    });
  });

  return {
    indicesPreview: indicesPreview.slice(0, limit),
    hasMore: indicesPreview.length > limit,
  };
};

export const getPrefixSuffixFromFollowPattern = (followPattern) => {
  let followIndexPatternPrefix;
  let followIndexPatternSuffix;

  const template = '{{leader_index}}';
  const index = followPattern.indexOf(template);

  if (index >= 0) {
    followIndexPatternPrefix = followPattern.slice(0, index);
    followIndexPatternSuffix = followPattern.slice(index + template.length);
  }

  return { followIndexPatternPrefix, followIndexPatternSuffix };
};
