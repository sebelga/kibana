/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import _ from 'lodash';

export const ES_GEO_FIELD_TYPE = {
  GEO_POINT: 'geo_point',
  GEO_SHAPE: 'geo_shape',
};

export function getGeoIndexTypesForFeatures(featureTypes) {
  const hasNoFeatureType = !featureTypes || !featureTypes.length;
  if (hasNoFeatureType) {
    return [];
  }

  const isPoint = featureTypes.includes('Point') || featureTypes.includes('MultiPoint');
  if (!isPoint) {
    return [ES_GEO_FIELD_TYPE.GEO_SHAPE];
  } else if (isPoint && featureTypes.length === 1) {
    return [ES_GEO_FIELD_TYPE.GEO_POINT, ES_GEO_FIELD_TYPE.GEO_SHAPE];
  }
  return [ES_GEO_FIELD_TYPE.GEO_SHAPE];
}

// Reduces & flattens geojson to coordinates and properties (if any)
export function geoJsonToEs(parsedGeojson, datatype) {
  if (!parsedGeojson) {
    return [];
  }
  const features = parsedGeojson.type === 'Feature' ? [parsedGeojson] : parsedGeojson.features;

  if (datatype === ES_GEO_FIELD_TYPE.GEO_SHAPE) {
    return features.reduce((accu, { geometry, properties }) => {
      const { coordinates } = geometry;
      accu.push({
        coordinates: {
          type: geometry.type.toLowerCase(),
          coordinates: coordinates,
        },
        ...(!_.isEmpty(properties) ? { ...properties } : {}),
      });
      return accu;
    }, []);
  } else if (datatype === ES_GEO_FIELD_TYPE.GEO_POINT) {
    return features.reduce((accu, { geometry, properties }) => {
      const { coordinates } = geometry;
      accu.push({
        coordinates,
        ...(!_.isEmpty(properties) ? { ...properties } : {}),
      });
      return accu;
    }, []);
  } else {
    return [];
  }
}

export function getGeoJsonIndexingDetails(parsedGeojson, dataType) {
  return {
    data: geoJsonToEs(parsedGeojson, dataType),
    ingestPipeline: {},
    mappings: {
      properties: {
        coordinates: {
          type: dataType,
        },
      },
    },
    settings: {
      number_of_shards: 1,
    },
  };
}
