/**
 * @module services/schemaGenerator
 * @category Services - Data Platform
 * @description Schema DDL generator service providing enterprise database schema definitions.
 * Simple facade returning pre-defined DDL from assets for data platform visualization.
 */

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Utils & Constants
import { ENTERPRISE_SCHEMA_DDL } from '../assets/data/schemaDDL';

// ============================================================================
// SERVICE
// ============================================================================
export const SchemaGenerator = {
  generateDDL: (): string => {
    return ENTERPRISE_SCHEMA_DDL;
  }
};

