import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RotateCw, Download } from 'lucide-react';

export interface PivotConfig {
  rows: string[];
  columns: string[];
  values: string[];
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface PivotTableProps<T> {
  data: T[];
  config: PivotConfig;
  title?: string;
  onConfigChange?: (config: PivotConfig) => void;
  className?: string;
}

export function PivotTable<T extends Record<string, any>>({
  data,
  config,
  title,
  onConfigChange,
  className = '',
}: PivotTableProps<T>) {
  const [pivotConfig, setPivotConfig] = useState(config);

  const pivotData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const { rows, columns, values, aggregation = 'sum' } = pivotConfig;

    // Get unique values for row and column dimensions
    const rowKeys = new Set<string>();
    const columnKeys = new Set<string>();

    data.forEach((row) => {
      const rowKey = rows.map((r) => row[r]).join('|');
      const colKey = columns.map((c) => row[c]).join('|');
      rowKeys.add(rowKey);
      columnKeys.add(colKey);
    });

    // Build pivot structure
    const pivot: Record<string, Record<string, number>> = {};

    Array.from(rowKeys).forEach((rowKey) => {
      pivot[rowKey] = {};
      Array.from(columnKeys).forEach((colKey) => {
        pivot[rowKey][colKey] = 0;
      });
    });

    // Aggregate data
    const counts: Record<string, Record<string, number>> = {};

    data.forEach((row) => {
      const rowKey = rows.map((r) => row[r]).join('|');
      const colKey = columns.map((c) => row[c]).join('|');

      if (!counts[rowKey]) {
        counts[rowKey] = {};
      }
      if (!counts[rowKey][colKey]) {
        counts[rowKey][colKey] = 0;
      }

      const valueSum = values.reduce((sum, v) => sum + (Number(row[v]) || 0), 0);

      switch (aggregation) {
        case 'sum':
          pivot[rowKey][colKey] += valueSum;
          counts[rowKey][colKey]++;
          break;
        case 'avg':
          pivot[rowKey][colKey] += valueSum;
          counts[rowKey][colKey]++;
          break;
        case 'count':
          pivot[rowKey][colKey]++;
          break;
        case 'min':
          pivot[rowKey][colKey] =
            pivot[rowKey][colKey] === 0
              ? valueSum
              : Math.min(pivot[rowKey][colKey], valueSum);
          break;
        case 'max':
          pivot[rowKey][colKey] = Math.max(pivot[rowKey][colKey], valueSum);
          break;
      }
    });

    // Calculate averages if needed
    if (aggregation === 'avg') {
      Object.keys(pivot).forEach((rowKey) => {
        Object.keys(pivot[rowKey]).forEach((colKey) => {
          if (counts[rowKey][colKey] > 0) {
            pivot[rowKey][colKey] /= counts[rowKey][colKey];
          }
        });
      });
    }

    return {
      pivot,
      rowKeys: Array.from(rowKeys),
      columnKeys: Array.from(columnKeys),
    };
  }, [data, pivotConfig]);

  const calculateRowTotal = (rowKey: string) => {
    if (!pivotData) return 0;
    return pivotData.columnKeys.reduce(
      (sum, colKey) => sum + (pivotData.pivot[rowKey][colKey] || 0),
      0
    );
  };

  const calculateColumnTotal = (colKey: string) => {
    if (!pivotData) return 0;
    return pivotData.rowKeys.reduce(
      (sum, rowKey) => sum + (pivotData.pivot[rowKey][colKey] || 0),
      0
    );
  };

  const calculateGrandTotal = () => {
    if (!pivotData) return 0;
    return pivotData.rowKeys.reduce((sum, rowKey) => sum + calculateRowTotal(rowKey), 0);
  };

  const formatValue = (value: number) => {
    if (pivotConfig.aggregation === 'avg') {
      return value.toFixed(2);
    }
    return value.toLocaleString();
  };

  const rotatePivot = () => {
    const newConfig = {
      ...pivotConfig,
      rows: pivotConfig.columns,
      columns: pivotConfig.rows,
    };
    setPivotConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  if (!pivotData) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No data to pivot</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role="region"
      aria-label={title || 'Pivot Table'}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={rotatePivot}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
              Rotate
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Rows: {pivotConfig.rows.join(', ')} | Columns: {pivotConfig.columns.join(', ')} |
          Values: {pivotConfig.values.join(', ')} ({pivotConfig.aggregation || 'sum'})
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600"
              >
                {pivotConfig.rows.join(' / ')}
              </th>
              {pivotData.columnKeys.map((colKey, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                >
                  {colKey}
                </th>
              ))}
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-l border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pivotData.rowKeys.map((rowKey, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap border-r border-gray-300 dark:border-gray-600">
                  {rowKey}
                </td>
                {pivotData.columnKeys.map((colKey, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    {formatValue(pivotData.pivot[rowKey][colKey] || 0)}
                  </td>
                ))}
                <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap border-l border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                  {formatValue(calculateRowTotal(rowKey))}
                </td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-gray-100 dark:bg-gray-800 font-semibold">
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600">
                Total
              </td>
              {pivotData.columnKeys.map((colKey, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white"
                >
                  {formatValue(calculateColumnTotal(colKey))}
                </td>
              ))}
              <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white border-l border-gray-300 dark:border-gray-600">
                {formatValue(calculateGrandTotal())}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {pivotData.rowKeys.length} rows × {pivotData.columnKeys.length} columns
        </p>
      </div>
    </motion.div>
  );
}

export default PivotTable;
