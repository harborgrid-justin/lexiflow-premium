import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Save, X, Plus, Trash2, Check } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  editable?: boolean;
  type?: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  options?: Array<{ label: string; value: any }>;
  validate?: (value: any) => string | null;
  render?: (value: any, row: T, isEditing: boolean) => React.ReactNode;
  width?: string;
}

export interface EditableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  onSave?: (row: T, index: number) => Promise<void> | void;
  onDelete?: (row: T, index: number) => Promise<void> | void;
  onAdd?: (row: Partial<T>) => Promise<void> | void;
  rowKey?: keyof T;
  allowAdd?: boolean;
  allowDelete?: boolean;
  className?: string;
}

export function EditableTable<T extends Record<string, any>>({
  data: initialData,
  columns,
  title,
  onSave,
  onDelete,
  onAdd,
  rowKey,
  allowAdd = true,
  allowDelete = true,
  className = '',
}: EditableTableProps<T>) {
  const [data, setData] = useState(initialData);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<T>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState<Partial<T>>({});

  const startEdit = (index: number) => {
    setEditingRow(index);
    setEditedValues({ ...data[index] });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setEditedValues({});
    setErrors({});
  };

  const validateRow = (values: Partial<T>): boolean => {
    const newErrors: Record<string, string> = {};

    columns.forEach((column) => {
      if (column.validate && column.editable !== false) {
        const error = column.validate(values[column.key as keyof T]);
        if (error) {
          newErrors[column.key as string] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveEdit = async () => {
    if (editingRow === null) return;

    if (!validateRow(editedValues)) return;

    const updatedData = [...data];
    updatedData[editingRow] = { ...updatedData[editingRow], ...editedValues };

    try {
      await onSave?.(updatedData[editingRow], editingRow);
      setData(updatedData);
      setEditingRow(null);
      setEditedValues({});
      setErrors({});
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const deleteRow = async (index: number) => {
    if (!confirm('Are you sure you want to delete this row?')) return;

    try {
      await onDelete?.(data[index], index);
      const updatedData = data.filter((_, i) => i !== index);
      setData(updatedData);
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setNewRow({});
    setErrors({});
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewRow({});
    setErrors({});
  };

  const saveAdd = async () => {
    if (!validateRow(newRow)) return;

    try {
      await onAdd?.(newRow);
      setData([...data, newRow as T]);
      setIsAdding(false);
      setNewRow({});
      setErrors({});
    } catch (error) {
      console.error('Failed to add:', error);
    }
  };

  const updateEditValue = (key: string, value: any) => {
    setEditedValues({ ...editedValues, [key]: value });
  };

  const updateNewValue = (key: string, value: any) => {
    setNewRow({ ...newRow, [key]: value });
  };

  const renderCell = (
    column: Column<T>,
    value: any,
    isEditing: boolean,
    onValueChange: (value: any) => void
  ) => {
    if (!isEditing || column.editable === false) {
      if (column.render) {
        return column.render(value, {} as T, isEditing);
      }

      if (column.type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            disabled
            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
          />
        );
      }

      return <span>{String(value || '')}</span>;
    }

    const error = errors[column.key as string];

    switch (column.type) {
      case 'number':
        return (
          <div>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => onValueChange(e.target.value ? Number(e.target.value) : null)}
              className={`w-full px-2 py-1 text-sm border rounded ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
            />
            {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onValueChange(e.target.value)}
            className={`w-full px-2 py-1 text-sm border rounded ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
          >
            <option value="">Select...</option>
            {column.options?.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => onValueChange(e.target.value ? new Date(e.target.value) : null)}
            className={`w-full px-2 py-1 text-sm border rounded ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
          />
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onValueChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );

      default:
        return (
          <div>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onValueChange(e.target.value)}
              className={`w-full px-2 py-1 text-sm border rounded ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2`}
            />
            {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role="region"
      aria-label={title || 'Editable Table'}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {allowAdd && onAdd && (
            <button
              onClick={startAdd}
              disabled={isAdding || editingRow !== null}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right w-32">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Add Row */}
            <AnimatePresence>
              {isAdding && (
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-blue-50 dark:bg-blue-900/20"
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm">
                      {renderCell(
                        column,
                        newRow[column.key as keyof T],
                        true,
                        (value) => updateNewValue(column.key as string, value)
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={saveAdd}
                        className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                        aria-label="Save new row"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={cancelAdd}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        aria-label="Cancel"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>

            {/* Data Rows */}
            {data.map((row, rowIndex) => {
              const isEditing = editingRow === rowIndex;

              return (
                <motion.tr
                  key={rowKey ? String(row[rowKey]) : rowIndex}
                  layout
                  className={`transition-colors ${
                    isEditing
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {renderCell(
                        column,
                        isEditing
                          ? editedValues[column.key as keyof T]
                          : row[column.key as keyof T],
                        isEditing,
                        (value) => updateEditValue(column.key as string, value)
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            aria-label="Save changes"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            aria-label="Cancel editing"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          {onSave && (
                            <button
                              onClick={() => startEdit(rowIndex)}
                              disabled={editingRow !== null || isAdding}
                              className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Edit row"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          )}
                          {allowDelete && onDelete && (
                            <button
                              onClick={() => deleteRow(rowIndex)}
                              disabled={editingRow !== null || isAdding}
                              className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Delete row"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {data.length === 0 && !isAdding && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.length} row{data.length !== 1 ? 's' : ''}
        </p>
      </div>
    </motion.div>
  );
}

export default EditableTable;
