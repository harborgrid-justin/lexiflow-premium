# LexiFlow Backend Scripts

This directory contains utility scripts for managing the LexiFlow backend infrastructure.

## Available Scripts

### Database Management

#### `init-db.sh`
Initializes the database with migrations and optionally seed data.

```bash
# Initialize database without seed data
./scripts/init-db.sh

# Initialize database with seed data
./scripts/init-db.sh --with-seed
```

#### `migrate.sh`
Manages database migrations.

```bash
# Run pending migrations
./scripts/migrate.sh run

# Revert last migration
./scripts/migrate.sh revert

# Generate new migration from entity changes
./scripts/migrate.sh generate AddUserTable

# Create empty migration file
./scripts/migrate.sh create AddCustomIndex

# Show migration status
./scripts/migrate.sh show
```

#### `seed-db.sh`
Seeds the database with test or initial data.

```bash
./scripts/seed-db.sh
```

#### `backup-db.sh`
Creates a compressed backup of the PostgreSQL database.

```bash
# Create backup (stored in ./backups directory)
./scripts/backup-db.sh
```

Features:
- Automatic compression (gzip)
- Timestamped backup files
- Automatic cleanup of old backups (based on retention days)
- Backup verification

#### `restore-db.sh`
Restores the database from a backup file.

```bash
# Restore from specific backup
./scripts/restore-db.sh ./backups/lexiflow_backup_20231212_120000.sql.gz

# List available backups if no file specified
./scripts/restore-db.sh
```

**WARNING:** This will delete all existing data!

#### `reset-db.sh`
Completely resets the database by dropping all tables and re-running migrations.

```bash
# Reset database (will prompt for confirmation)
./scripts/reset-db.sh

# Force reset without confirmation
./scripts/reset-db.sh --force

# Reset with seed data
./scripts/reset-db.sh --with-seed
```

### Docker Management

#### `docker-helper.sh`
Convenient wrapper for common Docker operations.

```bash
# Start services
./scripts/docker-helper.sh up dev
./scripts/docker-helper.sh up prod

# Stop services
./scripts/docker-helper.sh down

# View logs
./scripts/docker-helper.sh logs
./scripts/docker-helper.sh logs postgres  # Specific service

# Restart services
./scripts/docker-helper.sh restart

# Clean up everything
./scripts/docker-helper.sh clean

# Rebuild all services
./scripts/docker-helper.sh rebuild

# Database shell access
./scripts/docker-helper.sh shell-db

# Redis CLI access
./scripts/docker-helper.sh shell-redis

# Application shell access
./scripts/docker-helper.sh shell-app

# Service health status
./scripts/docker-helper.sh status

# Quick backup
./scripts/docker-helper.sh backup

# Quick restore
./scripts/docker-helper.sh restore backups/backup.sql.gz

# Run migrations
./scripts/docker-helper.sh migrate

# Seed database
./scripts/docker-helper.sh seed
```

## SQL Files

### `init-postgres.sql`
PostgreSQL initialization script that runs when the container is first created.

Includes:
- PostgreSQL extensions (uuid-ossp, pg_trgm, pgcrypto, etc.)
- Custom database types (enums for roles, statuses, etc.)
- Database schemas (public, audit, temp, archive)
- Performance tuning settings
- Full-text search configuration
- Utility functions

### `pgadmin-servers.json`
Pre-configured server connection for pgAdmin.

## Environment Files

### `.env.example`
Template for environment variables. Copy to `.env` and customize:

```bash
cp .env.example .env
```

## Script Permissions

All scripts should be executable. If not, run:

```bash
chmod +x scripts/*.sh
```

## Quick Start Guide

### Development Setup

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start Docker services
./scripts/docker-helper.sh up dev

# 3. Initialize database
./scripts/init-db.sh --with-seed

# 4. Check service status
./scripts/docker-helper.sh status
```

### Production Setup

```bash
# 1. Configure production environment
cp .env.example .env
# Edit .env with production settings

# 2. Start production services
./scripts/docker-helper.sh up prod

# 3. Run migrations
./scripts/migrate.sh run

# 4. Verify services
./scripts/docker-helper.sh status
```

### Daily Backup

Set up a cron job for automatic backups:

```bash
# Add to crontab (runs daily at 2 AM)
0 2 * * * cd /path/to/lexiflow-premium/backend && ./scripts/backup-db.sh
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View PostgreSQL logs
./scripts/docker-helper.sh logs postgres

# Try connecting manually
./scripts/docker-helper.sh shell-db
```

### Migration Issues

```bash
# Check migration status
./scripts/migrate.sh show

# Revert last migration if needed
./scripts/migrate.sh revert

# Reset database completely
./scripts/reset-db.sh --force
```

### Clean Start

```bash
# Stop everything and clean up
./scripts/docker-helper.sh clean

# Start fresh
./scripts/docker-helper.sh up dev
./scripts/init-db.sh --with-seed
```

## Service URLs

When running locally:

- **Application API**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **WebSocket**: ws://localhost:3001
- **pgAdmin**: http://localhost:5050
  - Email: admin@lexiflow.com
  - Password: admin
- **Redis Commander**: http://localhost:8081
  - Username: admin
  - Password: admin
- **Mailhog** (dev only): http://localhost:8025

## Best Practices

1. **Always backup before major changes**
   ```bash
   ./scripts/backup-db.sh
   ```

2. **Use migrations instead of synchronize**
   - Set `DB_SYNCHRONIZE=false` in production
   - Generate migrations for schema changes

3. **Review migrations before running**
   ```bash
   # Check what will be run
   ./scripts/migrate.sh show
   ```

4. **Test migrations in development first**
   ```bash
   # Dev environment
   ./scripts/migrate.sh run
   ```

5. **Monitor logs regularly**
   ```bash
   ./scripts/docker-helper.sh logs
   ```

6. **Keep backups for at least 30 days**
   - Configure `BACKUP_RETENTION_DAYS` in `.env`

## Support

For issues or questions, please refer to:
- Main project documentation
- Docker documentation: https://docs.docker.com/
- PostgreSQL documentation: https://www.postgresql.org/docs/
- TypeORM documentation: https://typeorm.io/
