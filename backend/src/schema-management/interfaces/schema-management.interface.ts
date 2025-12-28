import { Request } from 'express';

/**
 * Column information from database query
 */
export interface ColumnQueryResult {
  name: string;
  type: string;
  is_nullable: string;
  defaultValue: string | null;
  character_maximum_length: number | null;
}

/**
 * Primary key information from database query
 */
export interface PrimaryKeyInfo {
  column_name: string;
}

/**
 * Table information from database query
 */
export interface TableQueryResult {
  table_name: string;
  column_count: string;
}

/**
 * Formatted table column with all metadata
 */
export interface TableColumn {
  name: string;
  type: string;
  is_nullable: string;
  defaultValue: string | null;
  character_maximum_length: number | null;
  pk: boolean;
  notNull: boolean;
}

/**
 * Table information with columns
 */
export interface TableInfo {
  name: string;
  columnCount: number;
  columns: TableColumn[];
}

/**
 * Schema column definition for table creation
 */
export interface SchemaColumnDefinition {
  name: string;
  type: string;
  pk?: boolean;
  notNull?: boolean;
  unique?: boolean;
  fk?: string;
  defaultValue?: string;
}

/**
 * Add column operation
 */
export interface AddColumnOperation {
  name: string;
  type: string;
  nullable?: boolean;
  default?: string;
}

/**
 * Alter column operation
 */
export interface AlterColumnOperation {
  name: string;
  type?: string;
  nullable?: boolean;
}

/**
 * Rename column operation
 */
export interface RenameColumnOperation {
  oldName: string;
  newName: string;
}

/**
 * Table alteration operations
 */
export interface AlterTableOperations {
  addColumns?: AddColumnOperation[];
  dropColumns?: string[];
  alterColumns?: AlterColumnOperation[];
  renameColumns?: RenameColumnOperation[];
}

/**
 * Schema snapshot data
 */
export interface SchemaSnapshotData {
  tables: TableInfo[];
  timestamp: string;
}

/**
 * Request with authenticated user
 */
export interface RequestWithUser extends Request {
  user?: {
    id: string;
    email?: string;
    [key: string]: unknown;
  };
}
