# LexiFlow Enterprise Backend - Database Setup Guide

## Overview

This document provides comprehensive instructions for setting up and managing the PostgreSQL database infrastructure for the LexiFlow Enterprise Backend.

## Database Architecture

### Technology Stack
- **Database**: PostgreSQL 15
- **ORM**: TypeORM 0.3.20
- **Migration Tool**: TypeORM CLI
- **Container Management**: Docker Compose
- **Additional Services**: Redis (caching), pgAdmin (database management)

### Entity Categories (37 Entities)

1. **Core Case Management** (7 entities)
   - Case, Party, CaseTeamMember, CasePhase, Motion, DocketEntry, Project

2. **Financial Management** (5 entities)
   - TimeEntry, Invoice, RateTable, TrustTransaction, FirmExpense

3. **Document Management** (4 entities)
   - LegalDocument, DocumentVersion, Clause, PleadingDocument

4. **Discovery Management** (5 entities)
   - DiscoveryRequest, Deposition, ESISource, LegalHold, PrivilegeLogEntry

5. **Evidence Management** (4 entities)
   - EvidenceItem, ChainOfCustodyEvent, TrialExhibit, Witness

6. **Users & Authentication** (3 entities)
   - User, UserProfile, Session

7. **Compliance & Audit** (3 entities)
   - AuditLog, ConflictCheck, EthicalWall

8. **Communications** (3 entities)
   - Conversation, Message, Notification

9. **Organization Management** (3 entities)
   - Client, Organization, LegalEntity

## Quick Start

### 1. Start Database Services

```bash
# Start PostgreSQL, Redis, and pgAdmin
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Migrations

```bash
# Generate initial migration from entities
npm run migration:generate -- -n InitialSchema

# Run migrations
npm run migration:run
```

### 5. Seed Database (Development Only)

```bash
npm run seed
```

## Database Services

### PostgreSQL
- **Port**: 5432
- **Database**: lexiflow_db
- **Username**: lexiflow_user
- **Password**: lexiflow_password (change in production!)
- **Connection String**: `postgresql://lexiflow_user:lexiflow_password@localhost:5432/lexiflow_db`

### pgAdmin
- **URL**: http://localhost:5050
- **Email**: admin@lexiflow.com
- **Password**: admin (change in production!)

### Redis
- **Port**: 6379
- **Purpose**: Session storage, caching, job queues

## Available NPM Scripts

### Database Migration Scripts
```bash
# Generate a new migration from entity changes
npm run migration:generate -- -n MigrationName

# Create an empty migration file
npm run migration:create -- -n MigrationName

# Run pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Seed Scripts
```bash
# Run all seeds
npm run seed

# Reset database (revert, migrate, seed)
npm run db:reset
```

## Environment Variables

### Required Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=lexiflow_user
DB_PASSWORD=lexiflow_password
DB_DATABASE=lexiflow_db
DB_SYNCHRONIZE=false          # NEVER true in production
DB_LOGGING=true               # Set to false in production
DB_MIGRATIONS_RUN=false       # Auto-run migrations on start

# Connection Pool Settings
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

## Entity Relationships

### Key Relationships
- **Case** is the central entity with relationships to:
  - Parties, Team Members, Phases, Motions, Docket Entries
  - Projects, Time Entries, Invoices, Documents
  - Discovery Requests, Depositions, Evidence Items
  - Conflict Checks

- **User** relationships:
  - UserProfile (1:1)
  - Sessions (1:Many)
  - CaseTeamMembers (1:Many)
  - TimeEntries (1:Many)
  - AuditLogs (1:Many)

- **Client** relationships:
  - Cases (1:Many)
  - Invoices (1:Many)

## Best Practices

### Migration Guidelines
1. Never modify migrations that have been run in production
2. Always review auto-generated migrations before running
3. Test migrations in development before production
4. Include both `up` and `down` methods for reversibility
5. Keep migrations atomic and focused

### Database Security
1. Use strong passwords in production
2. Enable SSL/TLS for database connections
3. Implement row-level security where appropriate
4. Regular security audits and updates
5. Restrict database access by IP whitelist

### Performance Optimization
1. Add indexes on frequently queried columns
2. Use connection pooling
3. Implement caching strategies with Redis
4. Regular VACUUM and ANALYZE operations
5. Monitor slow queries and optimize

### Backup Strategy
1. Automated daily backups
2. Weekly full backups
3. Transaction log backups every 15 minutes
4. Test restore procedures regularly
5. Off-site backup storage

## Common Tasks

### Connect to Database
```bash
# Using psql
psql -h localhost -U lexiflow_user -d lexiflow_db

# Using Docker
docker exec -it lexiflow_postgres psql -U lexiflow_user -d lexiflow_db
```

### Backup Database
```bash
# Create backup
docker exec lexiflow_postgres pg_dump -U lexiflow_user lexiflow_db > backup.sql

# Restore backup
docker exec -i lexiflow_postgres psql -U lexiflow_user lexiflow_db < backup.sql
```

### Reset Development Database
```bash
# Complete reset
npm run db:reset

# Or manually
docker-compose down -v
docker-compose up -d
npm run migration:run
npm run seed
```

## Troubleshooting

### Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Migration Issues
```bash
# Check migration status
npm run migration:show

# Revert last migration
npm run migration:revert

# Clear migration table (development only!)
# Connect to database and run:
# TRUNCATE migrations;
```

### Performance Issues
```bash
# Check active connections
SELECT * FROM pg_stat_activity;

# Check slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Production Deployment

### Pre-deployment Checklist
- [ ] Update all environment variables
- [ ] Change default passwords
- [ ] Enable SSL/TLS
- [ ] Configure connection pooling
- [ ] Set up backup automation
- [ ] Configure monitoring and alerts
- [ ] Test migration scripts
- [ ] Document rollback procedures
- [ ] Verify security settings
- [ ] Configure firewall rules

### Deployment Steps
1. Backup production database
2. Run migrations in maintenance window
3. Verify data integrity
4. Run smoke tests
5. Monitor application logs
6. Keep rollback plan ready

## Support & Documentation

- TypeORM Documentation: https://typeorm.io
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- NestJS Documentation: https://docs.nestjs.com
- Docker Documentation: https://docs.docker.com

## License

Copyright (c) 2024 LexiFlow Enterprise. All rights reserved.
