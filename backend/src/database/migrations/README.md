# Database Migrations

This directory contains all database migrations for the LexiFlow Enterprise Backend.

## Running Migrations

### Generate a new migration

```bash
npm run migration:generate -- -n MigrationName
```

### Create an empty migration

```bash
npm run migration:create -- -n MigrationName
```

### Run pending migrations

```bash
npm run migration:run
```

### Revert last migration

```bash
npm run migration:revert
```

### Show migration status

```bash
npm run migration:show
```

## Migration Naming Convention

Migrations should be named descriptively using PascalCase:
- `CreateInitialSchema`
- `AddUserEmailIndex`
- `UpdateCaseStatusEnum`
- `AddClientRetainerFields`

## Important Notes

1. Always review generated migrations before running them
2. Test migrations in development before applying to production
3. Migrations run in alphabetical order by timestamp
4. Never modify a migration that has been run in production
5. Always create a new migration for schema changes
6. Keep migrations focused on a single logical change
7. Include both `up` and `down` methods for reversibility

## Migration Commands in package.json

Add these scripts to your package.json:

```json
{
  "scripts": {
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts",
    "migration:create": "typeorm-ts-node-commonjs migration:create",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts",
    "migration:show": "typeorm-ts-node-commonjs migration:show -d src/database/data-source.ts"
  }
}
```

## Migration File Structure

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1234567890123 implements MigrationInterface {
  name = 'MigrationName1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Forward migration
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback migration
  }
}
```
