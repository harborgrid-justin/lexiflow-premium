/**
 * Type-safe JSON value types
 * Used for metadata, custom fields, and other dynamic data structures
 */

/**
 * JSON primitive types
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON array type
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 * JSON object type
 */
export interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * Union of all valid JSON value types
 * Use this instead of 'any' for dynamic JSON data
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Type-safe user preferences object
 */
export interface UserPreferences extends JsonObject {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    desktop?: boolean;
  };
  dashboard?: {
    layout?: string;
    widgets?: string[];
    defaultView?: string;
  };
  editor?: {
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
    tabSize?: number;
    autoSave?: boolean;
  };
  accessibility?: {
    highContrast?: boolean;
    reducedMotion?: boolean;
    screenReader?: boolean;
  };
}

/**
 * Type-safe entity metadata
 */
export interface EntityMetadata extends JsonObject {
  source?: string;
  importedFrom?: string;
  importedAt?: string;
  tags?: string[];
  customFields?: Record<string, JsonValue>;
  externalIds?: Record<string, string>;
  integrations?: Record<string, JsonValue>;
  audit?: {
    createdBy?: string;
    updatedBy?: string;
    version?: number;
    changeLog?: Array<{
      timestamp: string;
      user: string;
      action: string;
      changes: Record<string, JsonValue>;
    }>;
  };
}

/**
 * Type-safe custom fields
 */
export interface CustomFields extends JsonObject {
  [fieldName: string]: JsonValue;
}

/**
 * Error details for API responses
 */
export interface ErrorDetails extends JsonObject {
  field?: string;
  constraint?: string;
  rejectedValue?: JsonValue;
  validationErrors?: Array<{
    field: string;
    message: string;
    code?: string;
  }>;
  stackTrace?: string[];
  context?: Record<string, JsonValue>;
}

/**
 * Batch operation item (generic type-safe version)
 */
export interface BatchOperationItem<T = JsonValue> {
  id: string;
  data: T;
  metadata?: JsonObject;
}
