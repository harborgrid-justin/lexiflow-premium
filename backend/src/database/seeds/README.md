# Database Seeds

This directory contains seed data for the LexiFlow Enterprise Backend database.

## Purpose

Seed files populate the database with initial data for:
- Development and testing
- Demo environments
- Initial production setup (with appropriate data)

## Running Seeds

### Run all seeds

```bash
npm run seed
```

### Run specific seed

```bash
ts-node src/database/seeds/user.seed.ts
```

## Seed Files

- **user.seed.ts** - Creates initial users with different roles (admin, partner, associate, paralegal)
- **client.seed.ts** - Creates sample clients (corporations, individuals, nonprofits)
- **index.ts** - Main seeder that runs all seed files in order

## Seed Data Included

### Users
- Super Admin (admin@lexiflow.com)
- Partner (john.partner@lexiflow.com)
- Senior Associate (sarah.smith@lexiflow.com)
- Associate (michael.jones@lexiflow.com)
- Paralegal (emily.davis@lexiflow.com)

**Default Password for all users:** `Password123!`

### Clients
- Acme Corporation (CLT-001) - Technology company
- Global Manufacturing Inc. (CLT-002) - Manufacturing company
- John Smith (CLT-003) - Individual client
- Tech Startup LLC (CLT-004) - Startup company
- Community Foundation (CLT-005) - Nonprofit organization

## Adding New Seeds

1. Create a new seed file (e.g., `case.seed.ts`)
2. Export an async function that accepts DataSource
3. Add the seed function to `index.ts` in the appropriate order
4. Document the seed data in this README

## Example Seed Structure

```typescript
import { DataSource } from 'typeorm';
import { EntityName } from '../../entities/entity-name.entity';

export async function seedEntityName(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(EntityName);

  // Check if data already exists
  const count = await repository.count();
  if (count > 0) {
    console.log('EntityName already seeded, skipping...');
    return;
  }

  // Create and save seed data
  const data = repository.create({
    // ... entity data
  });
  await repository.save(data);

  console.log('✅ EntityName seeded successfully');
}
```

## Important Notes

1. Seeds are idempotent - they check if data exists before inserting
2. Seeds run in order as defined in `index.ts`
3. Do not use seeds for production migrations - use migrations instead
4. Seeds should be safe to run multiple times
5. Use environment variables to control which seeds run in production

## Package.json Script

Add this to your package.json:

```json
{
  "scripts": {
    "seed": "ts-node src/database/seeds/index.ts"
  }
}
```
