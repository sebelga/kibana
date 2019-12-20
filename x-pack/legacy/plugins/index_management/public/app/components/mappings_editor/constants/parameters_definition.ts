/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { i18n } from '@kbn/i18n';
import Joi from 'joi';

import { FieldConfig } from 'src/plugins/es_ui_shared/static/forms/hook_form_lib';
import {
  FIELD_TYPES,
  fieldValidators,
  ValidationFunc,
  ValidationFuncArg,
  fieldFormatters,
} from '../shared_imports';
import { INDEX_DEFAULT, TYPE_DEFINITION } from '../constants';
import { AliasOption, DataType, ComboBoxOption } from '../types';

const { toInt } = fieldFormatters;
const { emptyField, containsCharsField } = fieldValidators;

const commonErrorMessages = {
  smallerThanZero: i18n.translate(
    'xpack.idxMgmt.mappingsEditor.parameters.validations.smallerZeroErrorMessage',
    {
      defaultMessage: 'The value must be greater or equal to 0.',
    }
  ),
  spacesNotAllowed: i18n.translate(
    'xpack.idxMgmt.mappingsEditor.parameters.validations.spacesNotAllowedErrorMessage',
    {
      defaultMessage: 'Spaces are not allowed.',
    }
  ),
  analyzerIsRequired: i18n.translate(
    'xpack.idxMgmt.mappingsEditor.parameters.validations.analyzerIsRequiredErrorMessage',
    {
      defaultMessage: 'Give a name to the analyzer.',
    }
  ),
};

const nullValueLabel = i18n.translate('xpack.idxMgmt.mappingsEditor.nullValueFieldLabel', {
  defaultMessage: 'Null value',
});

const nullValueValidateEmptyField = emptyField(
  i18n.translate(
    'xpack.idxMgmt.mappingsEditor.parameters.validations.nullValueIsRequiredErrorMessage',
    {
      defaultMessage: 'Specify a null value.',
    }
  )
);

const mapIndexToValue = ['true', true, 'false', false];

const indexOptionsConfig = {
  label: i18n.translate('xpack.idxMgmt.mappingsEditor.indexOptionsLabel', {
    defaultMessage: 'Index options',
  }),
  type: FIELD_TYPES.SUPER_SELECT,
  helpText: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.indexOptionsHelpText', {
    defaultMessage: 'Information that should be stored in the index.',
  }),
};

/**
 * Single source of truth for the parameters a user can change on _any_ field type.
 * It is also the single source of truth for the parameters default values.
 *
 * As a consequence, if a parameter is *not* declared here, we won't be able to declare it in the Json editor.
 */
export const PARAMETERS_DEFINITION = {
  name: {
    fieldConfig: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.nameFieldLabel', {
        defaultMessage: 'Field name',
      }),
      defaultValue: '',
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.nameIsRequiredErrorMessage',
              {
                defaultMessage: 'Give a name to the field.',
              }
            )
          ),
        },
        {
          validator: containsCharsField({
            chars: ' ',
            message: commonErrorMessages.spacesNotAllowed,
          }),
        },
        {
          validator: fieldValidators.containsCharsField({
            chars: '.',
            message: i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.nameWithDotErrorMessage',
              {
                defaultMessage: 'Cannot contain a dot (.).',
              }
            ),
          }),
        },
      ],
    },
  },
  type: {
    fieldConfig: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.typeFieldLabel', {
        defaultMessage: 'Field type',
      }),
      defaultValue: 'text',
      deserializer: (fieldType: DataType | undefined) => {
        if (typeof fieldType === 'string' && Boolean(fieldType)) {
          return [
            {
              label: TYPE_DEFINITION[fieldType] ? TYPE_DEFINITION[fieldType].label : fieldType,
              value: fieldType,
            },
          ];
        }
        return [];
      },
      serializer: (fieldType: ComboBoxOption[] | undefined) =>
        fieldType && fieldType.length ? fieldType[0].value : fieldType,
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.typeIsRequiredErrorMessage',
              {
                defaultMessage: 'Specify a field type.',
              }
            )
          ),
        },
      ],
    },
    schema: Joi.string(),
  },
  store: {
    fieldConfig: {
      type: FIELD_TYPES.CHECKBOX,
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  index: {
    fieldConfig: {
      type: FIELD_TYPES.CHECKBOX,
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  doc_values: {
    fieldConfig: {
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  doc_values_binary: {
    fieldConfig: {
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  fielddata: {
    fieldConfig: {
      type: FIELD_TYPES.CHECKBOX,
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  fielddata_frequency_filter: {
    fieldConfig: { defaultValue: {} }, // Needed for FieldParams typing
    props: {
      min: {
        fieldConfig: {
          defaultValue: 0.01,
          serializer: value => (value === '' ? '' : toInt(value) / 100),
          deserializer: value => Math.round(value * 100),
        } as FieldConfig,
      },
      max: {
        fieldConfig: {
          defaultValue: 1,
          serializer: value => (value === '' ? '' : toInt(value) / 100),
          deserializer: value => Math.round(value * 100),
        } as FieldConfig,
      },
      min_segment_size: {
        fieldConfig: {
          type: FIELD_TYPES.NUMBER,
          label: i18n.translate('xpack.idxMgmt.mappingsEditor.minSegmentSizeFieldLabel', {
            defaultMessage: 'Minimum segment size',
          }),
          defaultValue: 50,
          formatters: [toInt],
        },
      },
    },
    schema: Joi.object().keys({
      min: Joi.number(),
      max: Joi.number(),
      min_segment_size: Joi.number(),
    }),
  },
  coerce: {
    fieldConfig: {
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  coerce_geo_shape: {
    fieldConfig: {
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  coerce_shape: {
    fieldConfig: {
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  ignore_malformed: {
    fieldConfig: {
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  null_value: {
    fieldConfig: {
      defaultValue: '',
      type: FIELD_TYPES.TEXT,
      label: nullValueLabel,
    },
    schema: Joi.string(),
  },
  null_value_numeric: {
    fieldConfig: {
      defaultValue: '', // Needed for FieldParams typing
      label: nullValueLabel,
      formatters: [toInt],
      validations: [
        {
          validator: nullValueValidateEmptyField,
        },
      ],
    },
    schema: Joi.number(),
  },
  null_value_boolean: {
    fieldConfig: {
      defaultValue: false,
      label: nullValueLabel,
      deserializer: (value: string | boolean) => mapIndexToValue.indexOf(value),
      serializer: (value: number) => mapIndexToValue[value],
    },
    schema: Joi.any().allow([true, false, 'true', 'false']),
  },
  null_value_geo_point: {
    fieldConfig: {
      defaultValue: '', // Needed for FieldParams typing
      label: nullValueLabel,
      validations: [
        {
          validator: nullValueValidateEmptyField,
        },
      ],
      deserializer: (value: any) => {
        if (value === '') {
          return value;
        }
        return JSON.stringify(value);
      },
      serializer: (value: string) => {
        try {
          return JSON.parse(value);
        } catch (error) {
          // swallow error and return non-parsed value;
          return value;
        }
      },
    },
    schema: Joi.any(),
  },
  copy_to: {
    fieldConfig: {
      defaultValue: '',
      type: FIELD_TYPES.TEXT,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.copyToLabel', {
        defaultMessage: 'Destination field name',
      }),
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.copyToIsRequiredErrorMessage',
              {
                defaultMessage: 'Specify a copy value.',
              }
            )
          ),
        },
      ],
    },
    schema: Joi.string(),
  },
  max_input_length: {
    fieldConfig: {
      defaultValue: 50,
      type: FIELD_TYPES.NUMBER,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.maxInputLengthLabel', {
        defaultMessage: 'Max input length',
      }),
      formatters: [toInt],
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.maxInputLengthFieldRequiredErrorMessage',
              {
                defaultMessage: 'Specify a max input length.',
              }
            )
          ),
        },
      ],
    },
    schema: Joi.number(),
  },
  locale: {
    fieldConfig: {
      defaultValue: 'ROOT',
      type: FIELD_TYPES.TEXT,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.localeLabel', {
        defaultMessage: 'Locale',
      }),
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.localeFieldRequiredErrorMessage',
              {
                defaultMessage: 'Specify a locale.',
              }
            )
          ),
        },
      ],
    },
    schema: Joi.string(),
  },
  orientation: {
    fieldConfig: {
      defaultValue: 'ccw',
      type: FIELD_TYPES.SUPER_SELECT,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.orientationLabel', {
        defaultMessage: 'Orientation',
      }),
    },
    schema: Joi.string(),
  },
  boost: {
    fieldConfig: {
      defaultValue: 1.0,
      type: FIELD_TYPES.NUMBER,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.boostLabel', {
        defaultMessage: 'Boost level',
      }),
      formatters: [toInt],
      validations: [
        {
          validator: ({ value }: ValidationFuncArg<any, number>) => {
            if (value < 0) {
              return { message: commonErrorMessages.smallerThanZero };
            }
          },
        },
      ],
    } as FieldConfig,
    schema: Joi.number(),
  },
  scaling_factor: {
    title: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.scalingFactorFieldTitle', {
      defaultMessage: 'Scaling factor',
    }),
    description: i18n.translate(
      'xpack.idxMgmt.mappingsEditor.parameters.scalingFactorFieldDescription',
      {
        defaultMessage:
          'Values will be multiplied by this factor at index time and rounded to the closest long value. High factor values improve accuracy, but also increase space requirements.',
      }
    ),
    fieldConfig: {
      defaultValue: '',
      type: FIELD_TYPES.NUMBER,
      formatters: [toInt],
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.scalingFactorLabel', {
        defaultMessage: 'Scaling factor',
      }),
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.scalingFactorIsRequiredErrorMessage',
              {
                defaultMessage: 'A scaling factor is required.',
              }
            )
          ),
        },
        {
          validator: ({ value }: ValidationFuncArg<any, number>) => {
            if (value <= 0) {
              return {
                message: i18n.translate(
                  'xpack.idxMgmt.mappingsEditor.parameters.validations.greaterThanZeroErrorMessage',
                  {
                    defaultMessage: 'The scaling factor must be greater than 0.',
                  }
                ),
              };
            }
          },
        },
      ],
      helpText: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.scalingFactorHelpText', {
        defaultMessage: 'Value must be greater than 0.',
      }),
    } as FieldConfig,
    schema: Joi.string(),
  },
  dynamic: {
    fieldConfig: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.dynamicFieldLabel', {
        defaultMessage: 'Dynamic',
      }),
      type: FIELD_TYPES.CHECKBOX,
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  enabled: {
    fieldConfig: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.enabledFieldLabel', {
        defaultMessage: 'Enabled',
      }),
      type: FIELD_TYPES.CHECKBOX,
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  format: {
    fieldConfig: {
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.formatFieldLabel', {
        defaultMessage: 'Format',
      }),
      defaultValue: 'strict_date_optional_time||epoch_millis',
      serializer: (format: ComboBoxOption[]): string | undefined =>
        format.length ? format.map(({ label }) => label).join('||') : undefined,
      deserializer: (formats: string): ComboBoxOption[] | undefined =>
        formats.split('||').map(format => ({ label: format })),
    },
    schema: Joi.string(),
  },
  analyzer: {
    fieldConfig: {
      label: 'Analyzer',
      defaultValue: INDEX_DEFAULT,
      validations: [
        {
          validator: emptyField(commonErrorMessages.analyzerIsRequired),
        },
        {
          validator: containsCharsField({
            chars: ' ',
            message: commonErrorMessages.spacesNotAllowed,
          }),
        },
      ],
    },
    schema: Joi.string(),
  },
  search_analyzer: {
    fieldConfig: {
      label: 'Search analyzer',
      defaultValue: INDEX_DEFAULT,
      validations: [
        {
          validator: emptyField(commonErrorMessages.analyzerIsRequired),
        },
        {
          validator: containsCharsField({
            chars: ' ',
            message: commonErrorMessages.spacesNotAllowed,
          }),
        },
      ],
    },
    schema: Joi.string(),
  },
  search_quote_analyzer: {
    fieldConfig: {
      label: 'Search quote analyzer',
      defaultValue: INDEX_DEFAULT,
      validations: [
        {
          validator: emptyField(commonErrorMessages.analyzerIsRequired),
        },
        {
          validator: containsCharsField({
            chars: ' ',
            message: commonErrorMessages.spacesNotAllowed,
          }),
        },
      ],
    },
    schema: Joi.string(),
  },
  normalizer: {
    fieldConfig: {
      label: 'Normalizer',
      defaultValue: '',
      type: FIELD_TYPES.TEXT,
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.normalizerIsRequiredErrorMessage',
              {
                defaultMessage: 'Give a name to the normalizer.',
              }
            )
          ),
        },
        {
          validator: containsCharsField({
            chars: ' ',
            message: commonErrorMessages.spacesNotAllowed,
          }),
        },
      ],
    },
    schema: Joi.string(),
  },
  index_options: {
    fieldConfig: {
      ...indexOptionsConfig,
      defaultValue: 'positions',
    },
    schema: Joi.string(),
  },
  index_options_keyword: {
    fieldConfig: {
      ...indexOptionsConfig,
      defaultValue: 'docs',
    },
    schema: Joi.string(),
  },
  index_options_flattened: {
    fieldConfig: {
      ...indexOptionsConfig,
      defaultValue: 'docs',
    },
    schema: Joi.string(),
  },
  eager_global_ordinals: {
    fieldConfig: {
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  index_phrases: {
    fieldConfig: {
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  preserve_separators: {
    fieldConfig: {
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  preserve_position_increments: {
    fieldConfig: {
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  ignore_z_value: {
    fieldConfig: {
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  points_only: {
    fieldConfig: {
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  norms: {
    fieldConfig: {
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  norms_keyword: {
    fieldConfig: {
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  term_vector: {
    fieldConfig: {
      type: FIELD_TYPES.SUPER_SELECT,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.termVectorLabel', {
        defaultMessage: 'Set term vector',
      }),
      defaultValue: 'no',
    },
    schema: Joi.string(),
  },
  path: {
    fieldConfig: {
      type: FIELD_TYPES.COMBO_BOX,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.pathLabel', {
        defaultMessage: 'Field path',
      }),
      helpText: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.pathHelpText', {
        defaultMessage: 'The absolute path from the root to the target field.',
      }),
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.pathIsRequiredErrorMessage',
              {
                defaultMessage: 'Select a field to point the alias to.',
              }
            )
          ),
        },
      ],
      serializer: (value: AliasOption[]) => (value.length === 0 ? '' : value[0].id),
    } as FieldConfig<any, string>,
    targetTypesNotAllowed: ['object', 'nested', 'alias'] as DataType[],
    schema: Joi.string(),
  },
  position_increment_gap: {
    fieldConfig: {
      type: FIELD_TYPES.NUMBER,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.positionIncrementGapLabel', {
        defaultMessage: 'Position increment gap',
      }),
      defaultValue: 100,
      formatters: [toInt],
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.positionIncrementGapIsRequiredErrorMessage',
              {
                defaultMessage: 'Set a position increment gap value',
              }
            )
          ),
        },
        {
          validator: (({ value }: ValidationFuncArg<any, number>) => {
            if (value < 0) {
              return { message: commonErrorMessages.smallerThanZero };
            }
          }) as ValidationFunc,
        },
      ],
    },
    schema: Joi.number(),
  },
  index_prefixes: {
    fieldConfig: { defaultValue: {} }, // Needed for FieldParams typing
    props: {
      min_chars: {
        fieldConfig: {
          type: FIELD_TYPES.NUMBER,
          defaultValue: 2,
          serializer: value => (value === '' ? '' : toInt(value)),
        } as FieldConfig,
      },
      max_chars: {
        fieldConfig: {
          type: FIELD_TYPES.NUMBER,
          defaultValue: 5,
          serializer: value => (value === '' ? '' : toInt(value)),
        } as FieldConfig,
      },
    },
    schema: Joi.object().keys({
      min_chars: Joi.number(),
      max_chars: Joi.number(),
    }),
  },
  similarity: {
    fieldConfig: {
      defaultValue: 'BM25',
      type: FIELD_TYPES.SUPER_SELECT,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.similarityLabel', {
        defaultMessage: 'Similarity algorithm',
      }),
      helpText: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.similarityHelpText', {
        defaultMessage: 'Defaults to BM25.',
      }),
    },
    schema: Joi.string(),
  },
  split_queries_on_whitespace: {
    fieldConfig: {
      defaultValue: false,
    },
    schema: Joi.boolean(),
  },
  ignore_above: {
    fieldConfig: {
      // Protects against Lucene’s term byte-length limit of 32766. UTF-8 characters may occupy at
      // most 4 bytes, so 32766 / 4 = 8191 characters.
      defaultValue: 8191,
      type: FIELD_TYPES.NUMBER,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.ignoreAboveFieldLabel', {
        defaultMessage: 'Character length limit',
      }),
      formatters: [toInt],
      validations: [
        {
          validator: (({ value }: ValidationFuncArg<any, number>) => {
            if ((value as number) < 0) {
              return { message: commonErrorMessages.smallerThanZero };
            }
          }) as ValidationFunc,
        },
      ],
    },
    schema: Joi.number(),
  },
  enable_position_increments: {
    fieldConfig: {
      defaultValue: true,
    },
    schema: Joi.boolean(),
  },
  depth_limit: {
    fieldConfig: {
      defaultValue: 20,
      type: FIELD_TYPES.NUMBER,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.depthLimitFieldLabel', {
        defaultMessage: 'Nested object depth limit',
      }),
      formatters: [toInt],
      validations: [
        {
          validator: (({ value }: ValidationFuncArg<any, number>) => {
            if ((value as number) < 0) {
              return { message: commonErrorMessages.smallerThanZero };
            }
          }) as ValidationFunc,
        },
      ],
    },
    schema: Joi.number(),
  },
  dims: {
    fieldConfig: {
      defaultValue: '',
      type: FIELD_TYPES.NUMBER,
      label: i18n.translate('xpack.idxMgmt.mappingsEditor.dimsFieldLabel', {
        defaultMessage: 'Dimensions',
      }),
      helpText: i18n.translate('xpack.idxMgmt.mappingsEditor.parameters.dimsHelpTextDescription', {
        defaultMessage: 'The number of dimensions in the vector.',
      }),
      formatters: [toInt],
      validations: [
        {
          validator: emptyField(
            i18n.translate(
              'xpack.idxMgmt.mappingsEditor.parameters.validations.dimsIsRequiredErrorMessage',
              {
                defaultMessage: 'Specify a dimension.',
              }
            )
          ),
        },
      ],
    },
    schema: Joi.string(),
  },
};
