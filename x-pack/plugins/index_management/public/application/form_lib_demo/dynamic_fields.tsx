/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonIcon,
  EuiIcon,
  EuiFormRow,
  EuiDragDropContext,
  EuiDraggable,
  EuiDroppable,
  DropResult,
} from '@elastic/eui';

import {
  useForm,
  Form,
  UseField,
  UseArray,
  TextField,
  fieldValidators,
} from '../../shared_imports';

export const DynamicFields = () => {
  const fetchedData = {
    name: 'My resource',
    relationships: [
      {
        parent: 'Parent 1',
        child: 'Child 1',
      },
      {
        parent: 'Parent 2',
        child: 'Child 2',
      },
    ],
  };
  const { form } = useForm({ defaultValue: fetchedData });

  const submitForm = () => {
    console.log(form.getFormData());
  };

  return (
    <Form form={form}>
      <UseField path="name" config={{ label: 'Name' }} component={TextField} />
      <EuiSpacer />
      <UseArray path="relationships">
        {({ items, addItem, removeItem }) => {
          return (
            <>
              {items.map((item) => (
                <EuiFlexGroup key={item.id}>
                  <EuiFlexItem>
                    <UseField
                      path={`${item.path}.parent`}
                      config={{ label: 'Parent' }}
                      component={TextField}
                      // Make sure to add this prop otherwise when you delete
                      // a row and add a new one, the stale values will appear
                      readDefaultValueOnForm={!item.isNew}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem>
                    <UseField
                      path={`${item.path}.child`}
                      config={{ label: 'Child' }}
                      component={TextField}
                      readDefaultValueOnForm={!item.isNew}
                    />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButtonIcon
                      color="danger"
                      onClick={() => removeItem(item.id)}
                      iconType="minusInCircle"
                      aria-label="Remove item"
                      style={{ marginTop: '28px' }}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              ))}
              <EuiButtonEmpty iconType="plusInCircle" onClick={addItem}>
                Add relationship
              </EuiButtonEmpty>
              <EuiSpacer />
            </>
          );
        }}
      </UseArray>

      <EuiSpacer />
      <EuiButton onClick={submitForm} fill>
        Submit
      </EuiButton>
    </Form>
  );
};

// --------------------------------------------------

const { emptyField } = fieldValidators;

const relationShipsValidations = [
  {
    validator: ({ value }: { value: any[] }) => {
      if (value.length === 0) {
        return {
          message: 'You need to add at least one relationship',
        };
      }
    },
  },
];

const textFieldValidations = [{ validator: emptyField("The field can't be empty.") }];

export const DynamicFieldsValidation = () => {
  const { form } = useForm();

  const submitForm = async () => {
    const { isValid, data } = await form.submit();

    if (isValid) {
      console.log(data);
    }
  };

  return (
    <Form form={form}>
      <UseField path="name" config={{ label: 'Name' }} component={TextField} />
      <EuiSpacer />
      <UseArray path="relationships" validations={relationShipsValidations}>
        {({ items, addItem, removeItem, error, form: { isSubmitted } }) => {
          const isInvalid = error !== null && isSubmitted;
          return (
            <>
              <EuiFormRow label="Relationships" error={error} isInvalid={isInvalid} fullWidth>
                <>
                  {items.map((item) => (
                    <EuiFlexGroup key={item.id}>
                      <EuiFlexItem>
                        <UseField
                          path={`${item.path}.parent`}
                          config={{ label: 'Parent', validations: textFieldValidations }}
                          component={TextField}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <UseField
                          path={`${item.path}.child`}
                          config={{ label: 'Child', validations: textFieldValidations }}
                          component={TextField}
                        />
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>
                        <EuiButtonIcon
                          color="danger"
                          onClick={() => removeItem(item.id)}
                          iconType="minusInCircle"
                          aria-label="Remove item"
                          style={{ marginTop: '28px' }}
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  ))}
                </>
              </EuiFormRow>
              <EuiButtonEmpty iconType="plusInCircle" onClick={addItem}>
                Add relationship
              </EuiButtonEmpty>
              <EuiSpacer />
            </>
          );
        }}
      </UseArray>

      <EuiSpacer />
      <EuiButton onClick={submitForm} fill disabled={form.isSubmitted && form.isValid === false}>
        Submit
      </EuiButton>
    </Form>
  );
};

// --------------------------------------------------

export const DynamicFieldsReorder = () => {
  const { form } = useForm();

  const submitForm = async () => {
    const { data } = await form.submit();
    console.log(data);
  };

  return (
    <Form form={form}>
      <UseField path="name" config={{ label: 'Name' }} component={TextField} />
      <EuiSpacer />
      <UseArray path="relationships">
        {({ items, addItem, removeItem, moveItem }) => {
          const onDragEnd = ({ source, destination }: DropResult) => {
            if (source && destination) {
              moveItem(source.index, destination.index);
            }
          };

          return (
            <>
              <EuiFormRow label="Relationships" fullWidth>
                <EuiDragDropContext onDragEnd={onDragEnd}>
                  <EuiDroppable droppableId="1">
                    {items.map((item, idx) => {
                      return (
                        <EuiDraggable
                          spacing="none"
                          draggableId={String(item.id)}
                          index={idx}
                          key={item.id}
                        >
                          {(provided) => {
                            return (
                              <EuiFlexGroup key={item.id}>
                                <EuiFlexItem grow={false}>
                                  <div {...provided.dragHandleProps} style={{ marginTop: '30px' }}>
                                    <EuiIcon type="grab" />
                                  </div>
                                </EuiFlexItem>
                                <EuiFlexItem>
                                  <UseField
                                    path={`${item.path}.parent`}
                                    config={{ label: 'Parent' }}
                                    component={TextField}
                                  />
                                </EuiFlexItem>
                                <EuiFlexItem>
                                  <UseField
                                    path={`${item.path}.child`}
                                    config={{ label: 'Child' }}
                                    component={TextField}
                                  />
                                </EuiFlexItem>
                                <EuiFlexItem grow={false}>
                                  <EuiButtonIcon
                                    color="danger"
                                    onClick={() => removeItem(item.id)}
                                    iconType="minusInCircle"
                                    aria-label="Remove item"
                                    style={{ marginTop: '28px' }}
                                  />
                                </EuiFlexItem>
                              </EuiFlexGroup>
                            );
                          }}
                        </EuiDraggable>
                      );
                    })}
                  </EuiDroppable>
                </EuiDragDropContext>
              </EuiFormRow>
              <EuiButtonEmpty iconType="plusInCircle" onClick={addItem}>
                Add relationship
              </EuiButtonEmpty>
              <EuiSpacer />
            </>
          );
        }}
      </UseArray>

      <EuiSpacer />
      <EuiButton onClick={submitForm} fill disabled={form.isSubmitted && form.isValid === false}>
        Submit
      </EuiButton>
    </Form>
  );
};
