/**
 * @module services/validation/discoverySchemas
 * @description Runtime validation for discovery center operations
 * Provides XSS prevention, input sanitization, and type-safe validation
 * Uses native TypeScript validation (no external dependencies)
 * Ensures FRCP compliance for discovery requests, privilege logs, and legal holds
 */

import {
  DiscoveryRequestStatusEnum,
  ESICollectionStatusEnum,
  LegalHoldStatusEnum,
  PrivilegeBasisEnum,
} from "@/types/enums";

import type { DiscoveryRequest, LegalHold, PrivilegeLogEntry } from "@/types";

// XSS Prevention: Sanitize HTML/script tags
const sanitizeString = (str: string): string => {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
};

// Validation result type
type ValidationResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: { errors: Array<{ path: string; message: string }> };
    };

// Discovery filter types
export interface ProductionConfig {
  batesPrefix?: string;
  startNumber?: number;
  confidentialityDesignation?: string;
  format?: string;
}

export interface ESISource {
  name?: string;
  type?: string;
  custodian?: string;
  dateRange?: { from: string; to: string };
}

export interface DiscoveryFilters {
  search?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Helper validators
const isValidDate = (date: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(date);
const isValidBatesPrefix = (prefix: string): boolean =>
  /^[A-Z0-9_-]{1,10}$/.test(prefix);

const discoveryRequestStatuses = Object.values(DiscoveryRequestStatusEnum);
const esiCollectionStatuses = Object.values(ESICollectionStatusEnum);
const legalHoldStatuses = Object.values(LegalHoldStatusEnum);
const privilegeBasisTypes = Object.values(PrivilegeBasisEnum);

const discoveryTypes = [
  "Production",
  "Interrogatory",
  "Admission",
  "Deposition",
] as const;

/**
 * Discovery Request Validator
 * Validates discovery request data with FRCP compliance checks
 */
const validateDiscoveryRequest = (
  data: unknown,
): ValidationResult<Partial<DiscoveryRequest>> => {
  const errors: Array<{ path: string; message: string }> = [];

  // Type guard
  if (typeof data !== "object" || data === null) {
    return {
      success: false,
      error: { errors: [{ path: "root", message: "Data must be an object" }] },
    };
  }

  const dataId = "id" in data ? data.id : undefined;
  if (!dataId || typeof dataId !== "string") {
    errors.push({ path: "id", message: "Request ID is required" });
  }

  const dataTitle =
    "title" in data && typeof data.title === "string" ? data.title : "";
  const title = dataTitle ? sanitizeString(dataTitle) : "";
  if (!title) {
    errors.push({ path: "title", message: "Title is required" });
  } else if (title.length > 500) {
    errors.push({
      path: "title",
      message: "Title too long (max 500 characters)",
    });
  }

  const dataType = "type" in data ? data.type : undefined;
  if (!discoveryTypes.includes(dataType as (typeof discoveryTypes)[number])) {
    errors.push({ path: "type", message: "Invalid discovery type" });
  }

  const dataServiceDate = "serviceDate" in data ? data.serviceDate : undefined;
  if (
    dataServiceDate &&
    typeof dataServiceDate === "string" &&
    !isValidDate(dataServiceDate)
  ) {
    errors.push({
      path: "serviceDate",
      message: "Invalid service date format (YYYY-MM-DD)",
    });
  }

  const dataDueDate = "dueDate" in data ? data.dueDate : undefined;
  if (
    !dataDueDate ||
    typeof dataDueDate !== "string" ||
    !isValidDate(dataDueDate)
  ) {
    errors.push({
      path: "dueDate",
      message: "Invalid due date format (YYYY-MM-DD)",
    });
  }

  const dataStatus = "status" in data ? data.status : undefined;
  if (
    !discoveryRequestStatuses.includes(
      dataStatus as (typeof discoveryRequestStatuses)[number],
    )
  ) {
    errors.push({ path: "status", message: "Invalid status" });
  }

  const dataDescription =
    "description" in data && typeof data.description === "string"
      ? data.description
      : "";
  const description = dataDescription ? sanitizeString(dataDescription) : "";
  if (description.length > 5000) {
    errors.push({
      path: "description",
      message: "Description too long (max 5000 characters)",
    });
  }

  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }

  return {
    success: true,
    data: {
      ...data,
      title,
      description,
    },
  };
};

/**
 * Privilege Log Entry Validator
 * Validates FRCP 26(b)(5) privilege log entries
 */
const validatePrivilegeLogEntry = (
  data: unknown,
): ValidationResult<Partial<PrivilegeLogEntry>> => {
  const errors: Array<{ path: string; message: string }> = [];

  // Type guard
  if (typeof data !== "object" || data === null) {
    return {
      success: false,
      error: { errors: [{ path: "root", message: "Data must be an object" }] },
    };
  }

  const dataId = "id" in data ? data.id : undefined;
  if (!dataId || typeof dataId !== "string") {
    errors.push({ path: "id", message: "Entry ID is required" });
  }

  const dataDate = "date" in data ? data.date : undefined;
  if (!dataDate || typeof dataDate !== "string" || !isValidDate(dataDate)) {
    errors.push({ path: "date", message: "Invalid date format (YYYY-MM-DD)" });
  }

  const dataBasis = "basis" in data ? data.basis : undefined;
  if (
    !privilegeBasisTypes.includes(
      dataBasis as (typeof privilegeBasisTypes)[number],
    )
  ) {
    errors.push({ path: "basis", message: "Invalid privilege basis" });
  }

  const dataAuthor =
    "author" in data && typeof data.author === "string" ? data.author : "";
  const author = dataAuthor ? sanitizeString(dataAuthor) : "";
  if (!author) {
    errors.push({ path: "author", message: "Author is required" });
  } else if (author.length > 200) {
    errors.push({ path: "author", message: "Author name too long" });
  }

  const dataRecipient =
    "recipient" in data && typeof data.recipient === "string"
      ? data.recipient
      : "";
  const recipient = dataRecipient ? sanitizeString(dataRecipient) : "";
  if (!recipient) {
    errors.push({ path: "recipient", message: "Recipient is required" });
  } else if (recipient.length > 200) {
    errors.push({ path: "recipient", message: "Recipient name too long" });
  }

  const dataDesc =
    "desc" in data && typeof data.desc === "string" ? data.desc : "";
  const desc = dataDesc ? sanitizeString(dataDesc) : "";
  if (!desc) {
    errors.push({
      path: "desc",
      message: "Description is required per FRCP 26(b)(5)",
    });
  } else if (desc.length < 20) {
    errors.push({
      path: "desc",
      message:
        "Description must be sufficient to enable assessment of privilege claim (min 20 characters)",
    });
  } else if (desc.length > 1000) {
    errors.push({
      path: "desc",
      message: "Description too long (max 1000 characters)",
    });
  }

  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }

  return {
    success: true,
    data: {
      ...data,
      author,
      recipient,
      desc,
    },
  };
};

/**
 * Legal Hold Validator
 * Validates legal hold data with preservation requirements
 */
const validateLegalHold = (
  data: unknown,
): ValidationResult<Partial<LegalHold>> => {
  const errors: Array<{ path: string; message: string }> = [];

  // Type guard - ensure data is an object
  if (!data || typeof data !== "object") {
    return {
      success: false,
      error: { errors: [{ path: "root", message: "Data must be an object" }] },
    };
  }

  const record = data as Record<string, unknown>;

  if (!record["id"] || typeof record["id"] !== "string") {
    errors.push({ path: "id", message: "Hold ID is required" });
  }

  const custodian =
    record["custodian"] && typeof record["custodian"] === "string"
      ? sanitizeString(record["custodian"])
      : "";
  if (!custodian) {
    errors.push({ path: "custodian", message: "Custodian is required" });
  } else if (custodian.length > 200) {
    errors.push({ path: "custodian", message: "Custodian name too long" });
  }

  const dept =
    record["dept"] && typeof record["dept"] === "string"
      ? sanitizeString(record["dept"])
      : "";
  if (dept.length > 200) {
    errors.push({ path: "dept", message: "Department name too long" });
  }

  if (
    !record["issued"] ||
    typeof record["issued"] !== "string" ||
    !isValidDate(record["issued"])
  ) {
    errors.push({
      path: "issued",
      message: "Invalid issue date format (YYYY-MM-DD)",
    });
  }

  if (
    !legalHoldStatuses.includes(
      record["status"] as (typeof legalHoldStatuses)[number],
    )
  ) {
    errors.push({ path: "status", message: "Invalid status" });
  }

  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }

  return {
    success: true,
    data: {
      ...data,
      custodian,
      dept,
    },
  };
};

/**
 * Production Config Validator
 * Validates production settings including Bates numbering
 */
const validateProductionConfig = (
  data: unknown,
): ValidationResult<ProductionConfig> => {
  const errors: Array<{ path: string; message: string }> = [];
  const config: ProductionConfig = {};

  if (!data || typeof data !== "object") {
    errors.push({ path: "data", message: "Invalid production config data" });
    return { success: false, error: { errors } };
  }

  const input = data as Record<string, unknown>;

  const batesPrefix =
    input["batesPrefix"] && typeof input["batesPrefix"] === "string"
      ? input["batesPrefix"].trim()
      : "";
  if (!batesPrefix) {
    errors.push({ path: "batesPrefix", message: "Bates prefix is required" });
  } else if (!isValidBatesPrefix(batesPrefix)) {
    errors.push({
      path: "batesPrefix",
      message:
        "Invalid Bates prefix format (A-Z, 0-9, _, - only, max 10 chars)",
    });
  } else {
    config.batesPrefix = batesPrefix;
  }

  const startNumber =
    typeof input["startNumber"] === "number"
      ? input["startNumber"]
      : parseInt(String(input["startNumber"] || ""));
  if (isNaN(startNumber) || startNumber < 1) {
    errors.push({
      path: "startNumber",
      message: "Start number must be a positive integer",
    });
  } else if (startNumber > 999999999) {
    errors.push({
      path: "startNumber",
      message: "Start number too large (max 999999999)",
    });
  } else {
    config.startNumber = startNumber;
  }

  const validFormats = ["PDF", "Native", "TIFF"];
  if (
    input["format"] &&
    typeof input["format"] === "string" &&
    validFormats.includes(input["format"])
  ) {
    config.format = input["format"];
  } else {
    errors.push({
      path: "format",
      message: "Invalid format (must be PDF, Native, or TIFF)",
    });
  }

  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }

  return { success: true, data: config };
};

/**
 * ESI Source Validator
 * Validates ESI source configuration
 */
const validateESISource = (data: unknown): ValidationResult<ESISource> => {
  const errors: Array<{ path: string; message: string }> = [];

  if (!data || typeof data !== "object") {
    errors.push({ path: "data", message: "Invalid ESI source data" });
    return { success: false, error: { errors } };
  }

  const input = data as Record<string, unknown>;

  const name =
    input["name"] && typeof input["name"] === "string"
      ? sanitizeString(input["name"])
      : "";
  if (!name) {
    errors.push({ path: "name", message: "Source name is required" });
  } else if (name.length > 200) {
    errors.push({ path: "name", message: "Source name too long" });
  }

  const validTypes = [
    "Email",
    "Slack",
    "Device",
    "SharePoint",
    "OneDrive",
    "Database",
  ];
  if (!validTypes.includes(input["type"] as string)) {
    errors.push({ path: "type", message: "Invalid source type" });
  }

  if (
    !esiCollectionStatuses.includes(
      input["status"] as (typeof esiCollectionStatuses)[number],
    )
  ) {
    errors.push({ path: "status", message: "Invalid status" });
  }

  const custodian =
    input["custodian"] && typeof input["custodian"] === "string"
      ? sanitizeString(input["custodian"])
      : "";
  if (custodian.length > 200) {
    errors.push({ path: "custodian", message: "Custodian name too long" });
  }

  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }

  return {
    success: true,
    data: {
      ...data,
      name,
      custodian,
    },
  };
};

/**
 * Discovery Filter Validator
 * Validates filter parameters to prevent injection attacks
 */
const validateDiscoveryFilters = (
  data: unknown,
): ValidationResult<DiscoveryFilters> => {
  const errors: Array<{ path: string; message: string }> = [];
  const filters: DiscoveryFilters = {};

  if (!data || typeof data !== "object") {
    return { success: true, data: filters }; // Return empty filters if invalid data
  }

  const input = data as Record<string, unknown>;

  if (input["search"] && typeof input["search"] === "string") {
    const search = sanitizeString(input["search"]);
    if (search.length > 200) {
      errors.push({ path: "search", message: "Search query too long" });
    } else {
      filters.search = search;
    }
  }

  if (input["dateFrom"] && typeof input["dateFrom"] === "string") {
    if (!isValidDate(input["dateFrom"]) && input["dateFrom"] !== "") {
      errors.push({ path: "dateFrom", message: "Invalid date format" });
    } else {
      filters.dateFrom = input["dateFrom"];
    }
  }

  if (input["dateTo"] && typeof input["dateTo"] === "string") {
    if (!isValidDate(input["dateTo"]) && input["dateTo"] !== "") {
      errors.push({ path: "dateTo", message: "Invalid date format" });
    } else {
      filters.dateTo = input["dateTo"];
    }
  }

  // Copy other filter properties
  if (input["status"] && typeof input["status"] === "string") {
    filters.status = input["status"];
  }
  if (input["type"] && typeof input["type"] === "string") {
    filters.type = input["type"];
  }

  if (errors.length > 0) {
    return { success: false, error: { errors } };
  }

  return { success: true, data: filters };
};

/**
 * Safe validation helpers - returns { success: true, data } or { success: false, error }
 */
export const validateDiscoveryRequestSafe = (
  data: unknown,
): ValidationResult<Partial<DiscoveryRequest>> => {
  return validateDiscoveryRequest(data);
};

export const validatePrivilegeLogEntrySafe = (
  data: unknown,
): ValidationResult<Partial<PrivilegeLogEntry>> => {
  return validatePrivilegeLogEntry(data);
};

export const validateLegalHoldSafe = (
  data: unknown,
): ValidationResult<Partial<LegalHold>> => {
  return validateLegalHold(data);
};

export const validateProductionConfigSafe = (
  data: unknown,
): ValidationResult<ProductionConfig> => {
  return validateProductionConfig(data);
};

export const validateESISourceSafe = (
  data: unknown,
): ValidationResult<ESISource> => {
  return validateESISource(data);
};

export const validateDiscoveryFiltersSafe = (
  data: unknown,
): ValidationResult<DiscoveryFilters> => {
  return validateDiscoveryFilters(data);
};

// Re-export enums for convenience
export {
  DiscoveryRequestStatusEnum,
  ESICollectionStatusEnum,
  LegalHoldStatusEnum,
  PrivilegeBasisEnum,
};
