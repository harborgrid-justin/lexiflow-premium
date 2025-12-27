# Drafting Templates Seeding Guide

## Overview
This guide explains how to seed production-ready legal document templates into the LexiFlow Drafting & Assembly platform using TypeScript scripts and environment variables.

## Files Created

### 1. Seed Data File
**Location**: `backend/src/database/seeds/drafting-templates.seed.ts`

Contains 7 production-ready legal templates:
- **Motion to Dismiss** (Federal, Civil Litigation)
- **Motion for Summary Judgment** (Federal, Civil Litigation)
- **Civil Complaint - Breach of Contract** (Federal, Contract Law)
- **First Set of Interrogatories** (Federal, Discovery)
- **Request for Production of Documents** (Federal, Discovery)
- **Answer to Complaint** (Federal, Civil Litigation)
- **Notice of Deposition** (Federal, Discovery)

Each template includes:
- Complete legal formatting with proper caption structure
- Variable placeholders (e.g., `{{case.plaintiff}}`, `{{attorney_name}}`)
- Clause integration points
- Comprehensive metadata (category, jurisdiction, practice area, court type)
- Validation rules for required/optional variables

### 2. Standalone Seed Script
**Location**: `backend/src/database/scripts/seed-drafting.ts`

Executable TypeScript script that:
- Loads environment variables from `.env`
- Establishes database connection using TypeORM
- Runs the seed function
- Provides detailed console output with emojis for progress tracking
- Gracefully handles errors and cleanup

### 3. NPM Script
**Added to**: `backend/package.json`

```json
"seed:drafting": "ts-node src/database/scripts/seed-drafting.ts"
```

## Environment Variables Used

From your `.env` file:
- `DB_HOST`: PostgreSQL host (Neon cloud)
- `DB_PORT`: Database port (5432)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name (`neondb`)
- `NODE_ENV`: Environment (development/production)
- `DB_LOGGING`: Enable TypeORM query logging
- `DEFAULT_ADMIN_USER_ID`: User ID for template creator (optional, defaults to UUID zero)

## How to Run

### Option 1: Using NPM Script (Recommended)
```bash
cd backend
npm run seed:drafting
```

### Option 2: Direct Execution
```bash
cd backend
npx ts-node src/database/scripts/seed-drafting.ts
```

### Option 3: From Root Directory
```bash
cd backend && npm run seed:drafting
```

## Expected Output

```
🚀 Starting drafting templates seed script...

📁 Environment: development
🗄️  Database Host: ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech
📊 Database Name: neondb

🔌 Connecting to database...
✅ Database connection established

🌱 Seeding drafting templates...
  ✓ Created template: Motion to Dismiss for Lack of Jurisdiction
  ✓ Created template: Motion for Summary Judgment
  ✓ Created template: Civil Complaint - Breach of Contract
  ✓ Created template: First Set of Interrogatories
  ✓ Created template: Request for Production of Documents
  ✓ Created template: Answer to Complaint
  ✓ Created template: Notice of Deposition
✅ Drafting templates seeding complete!

🎉 Seed script completed successfully!
🔌 Database connection closed
```

## Template Features

### Variable System
Each template includes typed variables:
- **text**: Free-form text input
- **date**: Date picker
- **select**: Dropdown options
- **number**: Numeric input
- **boolean**: Yes/No toggle

Example:
```typescript
{ 
  name: 'district', 
  label: 'District', 
  type: 'text', 
  required: true 
}
```

### Case Data Integration
Templates automatically pull case data:
- `{{case.plaintiff}}`: Case plaintiff name
- `{{case.defendant}}`: Case defendant name
- `{{case.caseNumber}}`: Case docket number

### Clause Integration
Templates support dynamic clause insertion:
```typescript
clauseReferences: [
  { 
    clauseId: '', 
    position: 0, 
    isOptional: true, 
    condition: 'Include additional counts if applicable' 
  },
]
```

## Idempotency

The seed script is **idempotent** - it checks for existing templates by name before inserting:
- ✓ Creates new templates if they don't exist
- ⊘ Skips templates that already exist
- Safe to run multiple times without duplication

## Troubleshooting

### Database Connection Fails
1. Verify `.env` file exists in `backend/` directory
2. Check database credentials are correct
3. Ensure PostgreSQL is accessible (Neon cloud should be online)
4. Test connection: `npm run db:test`

### TypeORM Entity Not Found
1. Ensure migration has been run: `npm run migration:run`
2. Verify entities are in correct location: `src/drafting/entities/*.entity.ts`
3. Check TypeORM configuration in seed script

### Missing Dependencies
```bash
npm install dotenv typeorm pg
```

## Integration with Frontend

After seeding, templates are immediately available in the frontend:
1. Navigate to **Drafting & Assembly** dashboard
2. Click **Browse Template Library**
3. Templates appear in gallery with category badges
4. Select template → Document Generator wizard opens
5. Fill in variables → Generate document

## Adding Custom Templates

To add your own templates, edit `drafting-templates.seed.ts`:

```typescript
{
  name: 'My Custom Template',
  description: 'Description here',
  category: TemplateCategory.MOTION,
  status: TemplateStatus.ACTIVE,
  jurisdiction: 'Federal',
  practiceArea: 'My Practice Area',
  courtType: 'District Court',
  isPublic: true,
  content: `Your template content with {{variables}}`,
  variables: [
    { name: 'variable_name', label: 'Display Label', type: 'text', required: true },
  ],
  tags: ['tag1', 'tag2'],
  usageCount: 0,
  createdBy: DEFAULT_USER_ID,
}
```

Then re-run: `npm run seed:drafting`

## Database Schema

Templates are stored in `drafting_templates` table:
- **id**: UUID primary key
- **name**: Template name (unique)
- **description**: Template description
- **category**: Enum (Motion, Complaint, Discovery, etc.)
- **status**: Enum (Draft, Active, Archived)
- **content**: Full document text with placeholders
- **variables**: JSONB array of variable definitions
- **clauseReferences**: JSONB array of clause integration points
- **metadata**: JSONB for extensibility
- **isPublic**: Boolean for sharing
- **usageCount**: Integer tracking usage
- **createdBy**: FK to users table
- **timestamps**: Created/updated dates

## Next Steps

After seeding:
1. ✅ Run migration: `npm run migration:run` (if not already done)
2. ✅ Seed templates: `npm run seed:drafting`
3. ✅ Start backend: `npm run start:dev`
4. ✅ Start frontend: `cd ../frontend && npm run dev`
5. ✅ Navigate to Drafting dashboard
6. ✅ Test document generation workflow

## Production Deployment

For production environments:
1. Set `NODE_ENV=production` in `.env`
2. Ensure database backups are configured
3. Run seed script during deployment pipeline
4. Monitor seed script output in CI/CD logs
5. Verify templates appear in production database

---

**Created**: December 26, 2025  
**Platform**: LexiFlow Enterprise Legal OS  
**Module**: Drafting & Assembly
