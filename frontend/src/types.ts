export * from "./types/ai";
export * from "./types/analytics";
export * from "./types/api-responses";
export * from "./types/auth";
export * from "./types/bluebook";
export * from "./types/canvas-constants";
export * from "./types/compliance-risk";
export * from "./types/dashboard";
export * from "./types/dto-types";
export * from "./types/enums";
export * from "./types/errors";
export * from "./types/filters";
export * from "./types/financial";
export * from "./types/integration-types";
export * from "./types/legal-research";
export * from "./types/models";
export * from "./types/notifications";
export * from "./types/pacer";
export * from "./types/parser";
export * from "./types/pleading-types";
export * from "./types/pleadings";
export * from "./types/query-keys";
export * from "./types/result";
export * from "./types/search";
export * from "./types/type-mappings";
export * from "./types/workflow-types";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
