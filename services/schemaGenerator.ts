
import { ENTERPRISE_SCHEMA_DDL } from '../assets/data/schemaDDL';

export const SchemaGenerator = {
  generateDDL: (): string => {
    return ENTERPRISE_SCHEMA_DDL;
  }
};
