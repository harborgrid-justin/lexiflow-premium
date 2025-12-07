import React from 'react';

export interface TableColumn {
  name: string;
  type: string;
  pk?: boolean;
  notNull?: boolean;
  unique?: boolean;
  fk?: string;
  index?: boolean;
}

export interface TableData {
  name: string;
  x: number;
  y: number;
  columns: TableColumn[];
}

export interface ContextMenuItem {
    label: string;
    icon?: React.ElementType;
    action: () => void;
    danger?: boolean;
}

export type ContextMenuType = 'table' | 'column' | 'canvas';
export type ContextData = { name: string } | { tableName: string, column: TableColumn } | null;
