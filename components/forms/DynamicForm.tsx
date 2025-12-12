import React from 'react';
import { FormBuilder, FormField } from './FormBuilder';

export interface DynamicFormProps {
  schema: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onChange?: (values: Record<string, any>) => void;
  title?: string;
  className?: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  schema,
  initialValues,
  onSubmit,
  onChange,
  title,
  className = '',
}) => {
  const fieldsWithDefaults = schema.map((field) => ({
    ...field,
    defaultValue: initialValues?.[field.name] || field.defaultValue,
  }));

  return (
    <FormBuilder
      fields={fieldsWithDefaults}
      onSubmit={onSubmit}
      title={title}
      className={className}
    />
  );
};

export default DynamicForm;
