import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';

export interface TreeNode<T = any> {
  id: string | number;
  data: T;
  children?: TreeNode<T>[];
  expanded?: boolean;
}

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, node: TreeNode<T>, level: number) => React.ReactNode;
  width?: string;
}

export interface TreeTableProps<T> {
  data: TreeNode<T>[];
  columns: Column<T>[];
  title?: string;
  defaultExpanded?: boolean;
  onNodeClick?: (node: TreeNode<T>) => void;
  onNodeExpand?: (node: TreeNode<T>, expanded: boolean) => void;
  className?: string;
}

export function TreeTable<T extends Record<string, any>>({
  data: initialData,
  columns,
  title,
  defaultExpanded = false,
  onNodeClick,
  onNodeExpand,
  className = '',
}: TreeTableProps<T>) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(() => {
    if (!defaultExpanded) return new Set();

    const allIds = new Set<string | number>();
    const collectIds = (nodes: TreeNode<T>[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(initialData);
    return allIds;
  });

  const toggleNode = (nodeId: string | number, node: TreeNode<T>) => {
    const newExpanded = new Set(expandedNodes);
    const isExpanded = newExpanded.has(nodeId);

    if (isExpanded) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }

    setExpandedNodes(newExpanded);
    onNodeExpand?.(node, !isExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<string | number>();
    const collectIds = (nodes: TreeNode<T>[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(initialData);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderTreeNode = (node: TreeNode<T>, level: number = 0): React.ReactNode[] => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    const rows: React.ReactNode[] = [
      <motion.tr
        key={node.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
        onClick={() => onNodeClick?.(node)}
      >
        {columns.map((column, colIndex) => {
          const value = node.data[column.key as keyof T];
          const isFirstColumn = colIndex === 0;

          return (
            <td
              key={colIndex}
              className={`px-6 py-4 text-sm text-gray-900 dark:text-white ${
                column.width || ''
              }`}
            >
              <div
                className="flex items-center gap-2"
                style={{ paddingLeft: isFirstColumn ? `${level * 24}px` : '0' }}
              >
                {isFirstColumn && (
                  <>
                    {hasChildren ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNode(node.id, node);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    ) : (
                      <span className="w-6" />
                    )}
                    {hasChildren ? (
                      <Folder className={`w-4 h-4 ${
                        isExpanded
                          ? 'text-yellow-500 dark:text-yellow-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    ) : (
                      <File className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    )}
                  </>
                )}
                {column.render ? (
                  column.render(value, node, level)
                ) : (
                  <span>{String(value || '')}</span>
                )}
              </div>
            </td>
          );
        })}
      </motion.tr>,
    ];

    if (hasChildren && isExpanded) {
      node.children!.forEach((child) => {
        rows.push(...renderTreeNode(child, level + 1));
      });
    }

    return rows;
  };

  const countNodes = (nodes: TreeNode<T>[]): number => {
    return nodes.reduce((count, node) => {
      return count + 1 + (node.children ? countNodes(node.children) : 0);
    }, 0);
  };

  const totalNodes = countNodes(initialData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role="region"
      aria-label={title || 'Tree Table'}
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
              onClick={expandAll}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence mode="popLayout">
              {initialData.flatMap((node) => renderTreeNode(node))}
            </AnimatePresence>
          </tbody>
        </table>

        {initialData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {totalNodes} total node{totalNodes !== 1 ? 's' : ''} ({expandedNodes.size} expanded)
        </p>
      </div>
    </motion.div>
  );
}

export default TreeTable;
