/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable max-classes-per-file */

import _, { each, reject } from 'lodash';
import { castEsToKbnFieldTypeName } from '@kbn/field-types';
import { FieldAttrs, FieldAttrSet, DataViewAttributes } from '../..';
import type {
  EnhancedRuntimeField,
  RuntimeField,
  RuntimeType,
  RuntimeComposite,
  RuntimeCompositeWithSubFields,
  ESRuntimeField,
} from '../types';
import { DuplicateField } from '../../../../kibana_utils/common';

import { ES_FIELD_TYPES, KBN_FIELD_TYPES, IIndexPattern, IFieldType } from '../../../common';
import { DataViewField, IIndexPatternFieldList, fieldList } from '../fields';
import { formatHitProvider } from './format_hit';
import { flattenHitWrapper } from './flatten_hit';
import { FieldFormatsStartCommon, FieldFormat } from '../../../../field_formats/common';
import { DataViewSpec, TypeMeta, SourceFilter, DataViewFieldMap } from '../types';
import { SerializedFieldFormat } from '../../../../expressions/common';
import { getRuntimeFieldsFromMap, getRuntimeCompositeFieldsFromMap } from './index_pattern_utils';

interface DataViewDeps {
  spec?: DataViewSpec;
  fieldFormats: FieldFormatsStartCommon;
  shortDotsEnable?: boolean;
  metaFields?: string[];
}

interface SavedObjectBody {
  fieldAttrs?: string;
  title?: string;
  timeFieldName?: string;
  intervalName?: string;
  fields?: string;
  sourceFilters?: string;
  fieldFormatMap?: string;
  typeMeta?: string;
  type?: string;
}

type FormatFieldFn = (hit: Record<string, any>, fieldName: string) => any;

export class DataView implements IIndexPattern {
  public id?: string;
  public title: string = '';
  public fieldFormatMap: Record<string, any>;
  /**
   * Only used by rollup indices, used by rollup specific endpoint to load field list
   */
  public typeMeta?: TypeMeta;
  public fields: IIndexPatternFieldList & { toSpec: () => DataViewFieldMap };
  public timeFieldName: string | undefined;
  /**
   * @deprecated Used by time range index patterns
   * @removeBy 8.1
   *
   */
  public intervalName: string | undefined;
  /**
   * Type is used to identify rollup index patterns
   */
  public type: string | undefined;
  public formatHit: {
    (hit: Record<string, any>, type?: string): any;
    formatField: FormatFieldFn;
  };
  public formatField: FormatFieldFn;
  public flattenHit: (hit: Record<string, any>, deep?: boolean) => Record<string, any>;
  public metaFields: string[];
  /**
   * SavedObject version
   */
  public version: string | undefined;
  public sourceFilters?: SourceFilter[];
  private originalSavedObjectBody: SavedObjectBody = {};
  private shortDotsEnable: boolean = false;
  private fieldFormats: FieldFormatsStartCommon;
  private fieldAttrs: FieldAttrs;
  private runtimeFieldMap: Record<string, RuntimeField>;
  private runtimeCompositeMap: Record<string, RuntimeComposite>;

  /**
   * prevents errors when index pattern exists before indices
   */
  public readonly allowNoIndex: boolean = false;

  constructor({ spec = {}, fieldFormats, shortDotsEnable = false, metaFields = [] }: DataViewDeps) {
    // set dependencies
    this.fieldFormats = fieldFormats;
    // set config
    this.shortDotsEnable = shortDotsEnable;
    this.metaFields = metaFields;
    // initialize functionality
    this.fields = fieldList([], this.shortDotsEnable);

    this.flattenHit = flattenHitWrapper(this, metaFields);
    this.formatHit = formatHitProvider(
      this,
      fieldFormats.getDefaultInstance(KBN_FIELD_TYPES.STRING)
    );
    this.formatField = this.formatHit.formatField;

    // set values
    this.id = spec.id;
    this.fieldFormatMap = spec.fieldFormats || {};

    this.version = spec.version;

    this.title = spec.title || '';
    this.timeFieldName = spec.timeFieldName;
    this.sourceFilters = spec.sourceFilters;
    this.fields.replaceAll(Object.values(spec.fields || {}));
    this.type = spec.type;
    this.typeMeta = spec.typeMeta;
    this.fieldAttrs = spec.fieldAttrs || {};
    this.intervalName = spec.intervalName;
    this.allowNoIndex = spec.allowNoIndex || false;
    this.runtimeFieldMap = spec.runtimeFieldMap || {};
    this.runtimeCompositeMap = spec.runtimeCompositeMap || {};
  }

  /**
   * Get last saved saved object fields
   */
  getOriginalSavedObjectBody = () => ({ ...this.originalSavedObjectBody });

  /**
   * Reset last saved saved object fields. used after saving
   */
  resetOriginalSavedObjectBody = () => {
    this.originalSavedObjectBody = this.getAsSavedObjectBody();
  };

  getFieldAttrs = () => {
    const newFieldAttrs = { ...this.fieldAttrs };

    this.fields.forEach((field) => {
      const attrs: FieldAttrSet = {};
      let hasAttr = false;
      if (field.customLabel) {
        attrs.customLabel = field.customLabel;
        hasAttr = true;
      }
      if (field.count) {
        attrs.count = field.count;
        hasAttr = true;
      }

      if (hasAttr) {
        newFieldAttrs[field.name] = attrs;
      } else {
        delete newFieldAttrs[field.name];
      }
    });

    return newFieldAttrs;
  };

  getComputedFields() {
    const scriptFields: any = {};
    if (!this.fields) {
      return {
        storedFields: ['*'],
        scriptFields,
        docvalueFields: [] as Array<{ field: string; format: string }>,
        runtimeFields: {},
      };
    }

    // Date value returned in "_source" could be in any number of formats
    // Use a docvalue for each date field to ensure standardized formats when working with date fields
    // indexPattern.flattenHit will override "_source" values when the same field is also defined in "fields"
    const docvalueFields = reject(this.fields.getByType('date'), 'scripted').map(
      (dateField: any) => {
        return {
          field: dateField.name,
          format:
            dateField.esTypes && dateField.esTypes.indexOf('date_nanos') !== -1
              ? 'strict_date_time'
              : 'date_time',
        };
      }
    );

    each(this.getScriptedFields(), function (field) {
      scriptFields[field.name] = {
        script: {
          source: field.script,
          lang: field.lang,
        },
      };
    });

    const runtimeFields = this.getRuntimeMappings();

    return {
      storedFields: ['*'],
      scriptFields,
      docvalueFields,
      runtimeFields,
    };
  }

  /**
   * Create static representation of index pattern
   */
  public toSpec(): DataViewSpec {
    return {
      id: this.id,
      version: this.version,

      title: this.title,
      timeFieldName: this.timeFieldName,
      sourceFilters: this.sourceFilters,
      fields: this.fields.toSpec({ getFormatterForField: this.getFormatterForField.bind(this) }),
      typeMeta: this.typeMeta,
      type: this.type,
      fieldFormats: this.fieldFormatMap,
      runtimeFieldMap: this.runtimeFieldMap,
      runtimeCompositeMap: this.runtimeCompositeMap,
      fieldAttrs: this.fieldAttrs,
      intervalName: this.intervalName,
      allowNoIndex: this.allowNoIndex,
    };
  }

  /**
   * Get the source filtering configuration for that index.
   */
  getSourceFiltering() {
    return {
      excludes: (this.sourceFilters && this.sourceFilters.map((filter: any) => filter.value)) || [],
    };
  }

  /**
   * Add scripted field to field list
   *
   * @param name field name
   * @param script script code
   * @param fieldType
   * @param lang
   * @deprecated use runtime field instead
   * @removeBy 8.1
   */
  async addScriptedField(name: string, script: string, fieldType: string = 'string') {
    const scriptedFields = this.getScriptedFields();
    const names = _.map(scriptedFields, 'name');

    if (_.includes(names, name)) {
      throw new DuplicateField(name);
    }

    this.fields.add({
      name,
      script,
      type: fieldType,
      scripted: true,
      lang: 'painless',
      aggregatable: true,
      searchable: true,
      count: 0,
      readFromDocValues: false,
    });
  }

  /**
   * Remove scripted field from field list
   * @param fieldName
   * @deprecated use runtime field instead
   * @removeBy 8.1
   */

  removeScriptedField(fieldName: string) {
    const field = this.fields.getByName(fieldName);
    if (field) {
      this.fields.remove(field);
    }
  }

  /**
   *
   * @deprecated use runtime field instead
   * @removeBy 8.1
   */
  getNonScriptedFields() {
    return [...this.fields.getAll().filter((field) => !field.scripted)];
  }

  /**
   *
   * @deprecated use runtime field instead
   * @removeBy 8.1
   */
  getScriptedFields() {
    return [...this.fields.getAll().filter((field) => field.scripted)];
  }

  isTimeBased(): boolean {
    return !!this.timeFieldName && (!this.fields || !!this.getTimeField());
  }

  isTimeNanosBased(): boolean {
    const timeField: any = this.getTimeField();
    return timeField && timeField.esTypes && timeField.esTypes.indexOf('date_nanos') !== -1;
  }

  getTimeField() {
    if (!this.timeFieldName || !this.fields || !this.fields.getByName) return undefined;
    return this.fields.getByName(this.timeFieldName);
  }

  getFieldByName(name: string): DataViewField | undefined {
    if (!this.fields || !this.fields.getByName) return undefined;
    return this.fields.getByName(name);
  }

  getAggregationRestrictions() {
    return this.typeMeta?.aggs;
  }

  /**
   * Returns index pattern as saved object body for saving
   */
  getAsSavedObjectBody(): DataViewAttributes {
    const fieldFormatMap = _.isEmpty(this.fieldFormatMap)
      ? undefined
      : JSON.stringify(this.fieldFormatMap);
    const fieldAttrs = this.getFieldAttrs();
    const runtimeFieldMap = this.runtimeFieldMap;
    const runtimeCompositeMap = this.runtimeCompositeMap;

    return {
      fieldAttrs: fieldAttrs ? JSON.stringify(fieldAttrs) : undefined,
      title: this.title,
      timeFieldName: this.timeFieldName,
      intervalName: this.intervalName,
      sourceFilters: this.sourceFilters ? JSON.stringify(this.sourceFilters) : undefined,
      fields: JSON.stringify(this.fields?.filter((field) => field.scripted) ?? []),
      fieldFormatMap,
      type: this.type!,
      typeMeta: JSON.stringify(this.typeMeta ?? {}),
      allowNoIndex: this.allowNoIndex ? this.allowNoIndex : undefined,
      runtimeFieldMap: runtimeFieldMap ? JSON.stringify(runtimeFieldMap) : undefined,
      runtimeCompositeMap: runtimeCompositeMap ? JSON.stringify(runtimeCompositeMap) : undefined,
    };
  }

  /**
   * Provide a field, get its formatter
   * @param field
   */
  getFormatterForField(field: DataViewField | DataViewField['spec'] | IFieldType): FieldFormat {
    const fieldFormat = this.getFormatterForFieldNoDefault(field.name);
    if (fieldFormat) {
      return fieldFormat;
    }

    return this.fieldFormats.getDefaultInstance(
      field.type as KBN_FIELD_TYPES,
      field.esTypes as ES_FIELD_TYPES[]
    );
  }

  /**
   * Add a runtime field - Appended to existing mapped field or a new field is
   * created as appropriate. We can pass along with the fields a "format" definition or "customLabel" to avoid calling
   * separately `setFieldCustomLabel()` and `setFieldFormat()`.
   * @param name Field name
   * @param enhancedRuntimeField Runtime field definition
   */
  addRuntimeField(name: string, enhancedRuntimeField: EnhancedRuntimeField): DataViewField {
    const existRuntimeCompositeWithSameName = this.getRuntimeComposite(name) !== null;

    if (existRuntimeCompositeWithSameName) {
      throw new Error(
        `Can't add runtime field ["${name}"] as there is already a runtime composite with the same name.`
      );
    }

    const { type, script, parentComposite, customLabel, format, popularity } = enhancedRuntimeField;

    const runtimeField: RuntimeField = { type, script, parentComposite };
    this.runtimeFieldMap[name] = runtimeField;

    // Create the field if it does not exist or update an existing one
    let createdField: DataViewField | undefined;
    const existingField = this.getFieldByName(name);
    if (existingField) {
      existingField.runtimeField = runtimeField;
    } else {
      createdField = this.fields.add({
        name,
        runtimeField,
        type: castEsToKbnFieldTypeName(type),
        aggregatable: true,
        searchable: true,
        count: popularity ?? 0,
        readFromDocValues: false,
      });
    }

    // Apply configuration to the field
    this.setFieldCustomLabel(name, customLabel);
    if (format) {
      this.setFieldFormat(name, format);
    } else {
      this.deleteFieldFormat(name);
    }

    return existingField ?? createdField!;
  }

  /**
   * Checks if runtime field exists
   * @param name
   */
  hasRuntimeField(name: string): boolean {
    return !!this.runtimeFieldMap[name];
  }

  /**
   * Returns runtime field if exists
   * @param name
   */
  getRuntimeField(name: string): RuntimeField | null {
    return this.runtimeFieldMap[name] ?? null;
  }

  /**
   * Replaces all existing runtime fields with new fields
   * @param newFields
   */
  replaceAllRuntimeFields(newFields: Record<string, EnhancedRuntimeField>) {
    const oldRuntimeFieldNames = Object.keys(this.runtimeFieldMap);
    oldRuntimeFieldNames.forEach((name) => {
      this.removeRuntimeField(name);
    });

    Object.entries(newFields).forEach(([name, field]) => {
      this.addRuntimeField(name, field);
    });
  }

  /**
   * Remove a runtime field - removed from mapped field or removed unmapped
   * field as appropriate. Doesn't clear associated field attributes.
   * @param name - Field name to remove
   */
  removeRuntimeField(name: string) {
    const existingField = this.getFieldByName(name);

    if (existingField) {
      const parentCompositeName = existingField.runtimeField?.parentComposite;
      const hasParentComposite =
        parentCompositeName !== undefined &&
        this.getRuntimeComposite(parentCompositeName!) !== null;
      if (hasParentComposite) {
        throw new Error(
          `Can't remove runtime field ["${name}"] as it belongs to the composite runtime ["${parentCompositeName}"]`
        );
      }

      if (existingField.isMapped) {
        // mapped field, remove runtimeField def
        existingField.runtimeField = undefined;
      } else {
        this.fields.remove(existingField);
      }
    }
    delete this.runtimeFieldMap[name];
  }

  /**
   * Create a runtime composite and add its subFields to the index pattern fields list
   * @param name - The runtime composite name
   * @param runtimeComposite - The runtime composite definition
   */
  addRuntimeComposite(
    name: string,
    runtimeComposite: RuntimeCompositeWithSubFields
  ): DataViewField[] {
    if (!runtimeComposite.subFields || Object.keys(runtimeComposite.subFields).length === 0) {
      throw new Error(`Can't save runtime composite [name = ${name}] without subfields.`);
    }

    // We first remove the runtime composite with the same name which will remove all of its subFields.
    // This guarantees that we don't leave behind orphan runtime fields (with a "compositeParent").
    this.removeRuntimeComposite(name);

    const { script, subFields } = runtimeComposite;

    const fieldsCreated: DataViewField[] = [];

    for (const [subFieldName, subField] of Object.entries(subFields)) {
      const field = this.addRuntimeField(`${name}.${subFieldName}`, {
        ...subField,
        parentComposite: name,
      });
      fieldsCreated.push(field);
    }

    this.runtimeCompositeMap[name] = {
      name,
      script,
      // We only need to keep a reference of the subFields names
      subFields: Object.keys(subFields),
    };

    return fieldsCreated;
  }

  /**
   * Returns runtime composite if exists
   * @param name
   */
  getRuntimeComposite(name: string): RuntimeComposite | null {
    return this.runtimeCompositeMap[name] ?? null;
  }

  /**
   * Returns runtime composite (if exists) with its subFields
   * @param name
   */
  getRuntimeCompositeWithSubFields(name: string): RuntimeCompositeWithSubFields | null {
    const runtimeComposite = this.getRuntimeComposite(name);

    if (!runtimeComposite) {
      return null;
    }

    const subFields = runtimeComposite.subFields.reduce((acc, subFieldName) => {
      const field = this.getFieldByName(subFieldName);

      if (!field) {
        // This condition should never happen
        return acc;
      }

      const runtimeField: EnhancedRuntimeField = {
        type: field.type as RuntimeType,
        customLabel: field.customLabel,
        popularity: field.count,
        parentComposite: name,
        format: this.getFormatterForFieldNoDefault(field.name)?.toJSON(),
      };

      return {
        ...acc,
        [subFieldName]: runtimeField,
      };
    }, {} as Record<string, EnhancedRuntimeField>);

    return {
      ...runtimeComposite,
      subFields,
    };
  }

  /**
   * Return all the runtime composite fields
   */
  getAllRuntimeComposites(): Record<string, RuntimeComposite> {
    return _.cloneDeep(this.runtimeCompositeMap);
  }

  /**
   * Remove a runtime composite with its associated subFields
   * @param name - Runtime composite name to remove
   */
  removeRuntimeComposite(name: string) {
    const existingRuntimeComposite = this.getRuntimeComposite(name);

    if (!!existingRuntimeComposite) {
      delete this.runtimeCompositeMap[name];

      // Remove all subFields
      for (const subFieldName of existingRuntimeComposite.subFields) {
        this.removeRuntimeField(`${name}.${subFieldName}`);
      }
    }
  }

  /**
   * Return the "runtime_mappings" section of the ES search query
   */
  getRuntimeMappings(): Record<string, ESRuntimeField> {
    return {
      ...getRuntimeFieldsFromMap(this.runtimeFieldMap),
      ...getRuntimeCompositeFieldsFromMap(
        this.runtimeCompositeMap,
        this.getRuntimeField.bind(this)
      ),
    };
  }

  /**
   * Get formatter for a given field name. Return undefined if none exists
   * @param field
   */
  getFormatterForFieldNoDefault(fieldname: string) {
    const formatSpec = this.fieldFormatMap[fieldname];
    if (formatSpec?.id) {
      return this.fieldFormats.getInstance(formatSpec.id, formatSpec.params);
    }
  }

  protected setFieldAttrs<K extends keyof FieldAttrSet>(
    fieldName: string,
    attrName: K,
    value: FieldAttrSet[K]
  ) {
    if (!this.fieldAttrs[fieldName]) {
      this.fieldAttrs[fieldName] = {} as FieldAttrSet;
    }
    this.fieldAttrs[fieldName][attrName] = value;
  }

  public setFieldCustomLabel(fieldName: string, customLabel: string | undefined | null) {
    const fieldObject = this.fields.getByName(fieldName);
    const newCustomLabel: string | undefined = customLabel === null ? undefined : customLabel;

    if (fieldObject) {
      fieldObject.customLabel = newCustomLabel;
    }

    this.setFieldAttrs(fieldName, 'customLabel', newCustomLabel);
  }

  public setFieldCount(fieldName: string, count: number | undefined | null) {
    const fieldObject = this.fields.getByName(fieldName);
    const newCount: number | undefined = count === null ? undefined : count;

    if (fieldObject) {
      if (!newCount) fieldObject.deleteCount();
      else fieldObject.count = newCount;
      return;
    }

    this.setFieldAttrs(fieldName, 'count', newCount);
  }

  public readonly setFieldFormat = (fieldName: string, format: SerializedFieldFormat) => {
    this.fieldFormatMap[fieldName] = format;
  };

  public readonly deleteFieldFormat = (fieldName: string) => {
    delete this.fieldFormatMap[fieldName];
  };
}

/**
 * @deprecated Use DataView instead. All index pattern interfaces were renamed.
 */
export class IndexPattern extends DataView {}
