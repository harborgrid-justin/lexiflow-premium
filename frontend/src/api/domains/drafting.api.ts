/**
 * Drafting API
 *
 * NOTE: This file has been refactored into modular components.
 * All exports are now re-exported from the drafting/ directory for backward compatibility.
 *
 * New imports should use:
 * import { draftingApi, DraftingApiService } from '@/lib/frontend-api';
 *
 * This file maintains backward compatibility for existing imports.
 */

export {
  DraftingApiService,
  draftingApi,
  TemplateCategory,
  TemplateStatus,
  GeneratedDocumentStatus,
  type DraftingStats,
  type DraftingTemplate,
  type GeneratedDocument,
  type TemplateVariable,
  type ClauseReference,
  type CreateTemplateDto,
  type UpdateTemplateDto,
  type GenerateDocumentDto,
  type UpdateGeneratedDocumentDto,
} from "./drafting";

// Validation exports
export { validateClauseCompatibility, validateVariableValues } from "./drafting";
