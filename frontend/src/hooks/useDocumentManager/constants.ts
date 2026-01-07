/**
 * Constants for useDocumentManager hook
 * @module hooks/useDocumentManager/constants
 */

/**
 * Query keys for document manager operations
 */
export const DOCUMENT_MANAGER_QUERY_KEYS = {
  all: () => ["documents", "manager"] as const,
  byFolder: (folderId: string) =>
    ["documents", "manager", "folder", folderId] as const,
  byModule: (module: string) =>
    ["documents", "manager", "module", module] as const,
  search: (query: string) => ["documents", "manager", "search", query] as const,
} as const;

/**
 * File upload configuration
 */
export const FILE_UPLOAD_CONFIG = {
  /** Maximum file size in bytes (50MB) */
  MAX_SIZE: 50 * 1024 * 1024,
  /** Maximum file size label */
  MAX_SIZE_LABEL: "50MB",
} as const;

/**
 * Search fields for worker search
 */
export const SEARCH_FIELDS = ["title", "content", "tags", "type"] as const;

/**
 * Default filter values
 */
export const DEFAULT_FILTERS = {
  MODULE: "All",
  FOLDER: "root",
} as const;

/**
 * Tag validation rules
 */
export const TAG_VALIDATION = {
  /** Maximum tag length */
  MAX_LENGTH: 50,
  /** Tag sanitization regex */
  SANITIZE_REGEX: /<[^>]*>/g,
} as const;
