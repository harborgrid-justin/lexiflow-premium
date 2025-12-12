# LexiFlow Backend - Docker Infrastructure Setup Guide

Complete guide for setting up and managing the LexiFlow AI Legal Suite backend infrastructure with Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Environment Configuration](#environment-configuration)
- [Docker Compose Profiles](#docker-compose-profiles)
- [Service Details](#service-details)
- [Database Management](#database-management)
- [Backup & Restore](#backup--restore)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Node.js**: Version 20 or higher (for local development)
- **Git**: For version control

### System Requirements

#### Development
- CPU: 2+ cores
- RAM: 4GB minimum, 8GB recommended
- Disk: 10GB free space

#### Production
- CPU: 4+ cores
- RAM: 8GB minimum, 16GB recommended
- Disk: 50GB+ free space

### Installation

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to backend directory
cd /home/user/lexiflow-premium/backend

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Start Development Environment

```bash
# Using docker-helper script (recommended)
./scripts/docker-helper.sh up dev

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 3. Initialize Database

```bash
# Run migrations and seed data
./scripts/init-db.sh --with-seed

# Or manually
./scripts/migrate.sh run
./scripts/seed-db.sh
```

### 4. Verify Services

```bash
# Check service status
./scripts/docker-helper.sh status

# View logs
./scripts/docker-helper.sh logs
```

### 5. Access Services

- **API**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **pgAdmin**: http://localhost:5050
- **Redis Commander**: http://localhost:8081
- **Mailhog** (dev): http://localhost:8025

## Architecture Overview

### Services Stack

```
┌─────────────────────────────────────────────────┐
│                  Application Layer               │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   NestJS App │  │   WebSocket  │            │
│  │   Port 3000  │  │   Port 3001  │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────────┐
│                   Data Layer                     │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  PostgreSQL  │  │    Redis     │            │
│  │   Port 5432  │  │   Port 6379  │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────────────┐
│                Management Tools                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   pgAdmin    │  │Redis Commander│           │
│  │   Port 5050  │  │   Port 8081  │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

### Container Details

| Container | Image | Purpose | Ports |
|-----------|-------|---------|-------|
| lexiflow-postgres | postgres:15-alpine | Primary database | 5432 |
| lexiflow-redis | redis:7-alpine | Cache & sessions | 6379 |
| lexiflow-pgadmin | dpage/pgadmin4 | DB management UI | 5050 |
| lexiflow-redis-commander | rediscommander/redis-commander | Redis management UI | 8081 |
| lexiflow-app-dev | Custom (NestJS) | Application server | 3000, 3001, 9229 |
| lexiflow-mailhog | mailhog/mailhog | Email testing (dev) | 1025, 8025 |

### Network Architecture

All services communicate through the `lexiflow-network` bridge network, enabling:
- Service discovery by container name
- Isolated network namespace
- Inter-container communication
- Port exposure to host

### Volume Persistence

| Volume | Purpose | Size (Typical) |
|--------|---------|----------------|
| lexiflow-postgres-data | Database data | 5-50GB |
| lexiflow-redis-data | Redis persistence | 100MB-1GB |
| lexiflow-pgadmin-data | pgAdmin settings | 10MB |
| ./uploads | File uploads | Variable |
| ./logs | Application logs | 100MB-1GB |
| ./backups | Database backups | 1-10GB |

## Environment Configuration

### Essential Variables

```bash
# Application
NODE_ENV=development
PORT=3000
WS_PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=lexiflow_db
DB_USERNAME=lexiflow_user
DB_PASSWORD=your_secure_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Admin Tools
PGADMIN_EMAIL=admin@lexiflow.com
PGADMIN_PASSWORD=admin
REDIS_COMMANDER_USER=admin
REDIS_COMMANDER_PASSWORD=admin
```

### Security Best Practices

1. **Change Default Passwords**
   ```bash
   # Generate secure passwords
   openssl rand -base64 32  # For DB_PASSWORD
   openssl rand -base64 64  # For JWT_SECRET
   ```

2. **Use Environment-Specific Files**
   ```bash
   .env.development
   .env.production
   .env.test
   ```

3. **Never Commit Secrets**
   - Add `.env` to `.gitignore`
   - Use secret management tools in production

## Docker Compose Profiles

### Base Configuration (`docker-compose.yml`)

Contains core services:
- PostgreSQL with health checks
- Redis with persistence
- pgAdmin (development)
- Redis Commander (development)
- Network and volume definitions

```bash
# Start base services only
docker-compose up -d
```

### Development (`docker-compose.dev.yml`)

Additional features:
- Hot reload for code changes
- Debug port (9229) exposed
- Verbose logging
- Mailhog for email testing
- Development-optimized settings

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Or use helper script
./scripts/docker-helper.sh up dev
```

### Production (`docker-compose.prod.yml`)

Production optimizations:
- Resource limits (CPU/Memory)
- Security hardening
- Optimized PostgreSQL settings
- No admin tools exposed
- Localhost-only binding
- Performance tuning

```bash
# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Or use helper script
./scripts/docker-helper.sh up prod
```

### Test (`docker-compose.test.yml`)

Test-specific setup:
- Isolated test database
- Clean state for each run
- Optimized for CI/CD

```bash
# Start test environment
docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d
```

## Service Details

### PostgreSQL Database

#### Features
- **Version**: PostgreSQL 15 Alpine
- **Extensions**: uuid-ossp, pg_trgm, pgcrypto, citext, fuzzystrmatch, unaccent
- **Custom Types**: User roles, case status, document types
- **Schemas**: public, audit, temp, archive
- **Full-text Search**: Legal-optimized configuration

#### Configuration
Development settings (256MB shared_buffers):
```sql
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 16MB
max_connections = 100
```

Production settings (512MB shared_buffers):
```sql
shared_buffers = 512MB
effective_cache_size = 2GB
work_mem = 32MB
max_connections = 200
```

#### Access

```bash
# Via docker-helper
./scripts/docker-helper.sh shell-db

# Direct access
docker exec -it lexiflow-postgres psql -U lexiflow_user -d lexiflow_db

# From host (if PostgreSQL client installed)
psql -h localhost -p 5432 -U lexiflow_user -d lexiflow_db
```

### Redis Cache

#### Features
- **Version**: Redis 7 Alpine
- **Persistence**: AOF (Append-Only File)
- **Password Protected**: Optional (configure via REDIS_PASSWORD)
- **Max Memory**: 512MB (dev), 1GB (prod)
- **Eviction Policy**: allkeys-lru

#### Configuration

```bash
# Access Redis CLI
./scripts/docker-helper.sh shell-redis

# Check Redis info
redis-cli INFO

# Monitor commands in real-time
redis-cli MONITOR
```

#### Common Operations

```bash
# Check connection
redis-cli PING

# View all keys
redis-cli KEYS *

# Get specific key
redis-cli GET session:abc123

# Flush all data (CAUTION!)
redis-cli FLUSHALL
```

### pgAdmin

#### Features
- Web-based PostgreSQL management
- Query tool
- Visual schema designer
- Import/Export tools

#### Access
- **URL**: http://localhost:5050
- **Email**: admin@lexiflow.com (default)
- **Password**: admin (default)

#### Pre-configured Server
The `scripts/pgadmin-servers.json` file automatically configures the LexiFlow database connection.

### Redis Commander

#### Features
- Web-based Redis management
- Key browser
- Value editor
- Real-time monitoring

#### Access
- **URL**: http://localhost:8081
- **Username**: admin (default)
- **Password**: admin (default)

## Database Management

### Migrations

```bash
# Run pending migrations
./scripts/migrate.sh run

# Revert last migration
./scripts/migrate.sh revert

# Generate migration from entity changes
./scripts/migrate.sh generate AddUserEmailIndex

# Create empty migration
./scripts/migrate.sh create CustomMigration

# Show migration status
./scripts/migrate.sh show
```

### Seeding

```bash
# Seed database with test data
./scripts/seed-db.sh

# Or during initialization
./scripts/init-db.sh --with-seed
```

Seed data includes:
- Organizations
- Users (all roles)
- Sample cases
- Sample clients
- Sample documents
- Billing entries

### Reset Database

```bash
# Reset with confirmation prompt
./scripts/reset-db.sh

# Force reset without prompt
./scripts/reset-db.sh --force

# Reset and seed
./scripts/reset-db.sh --force --with-seed
```

## Backup & Restore

### Automated Backups

```bash
# Create backup manually
./scripts/backup-db.sh

# Via docker-helper
./scripts/docker-helper.sh backup
```

Backups are:
- Compressed with gzip
- Timestamped (YYYYMMDD_HHMMSS)
- Stored in `./backups/` directory
- Auto-cleaned based on retention policy (30 days default)

### Scheduled Backups

Set up cron job for automatic backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/lexiflow-premium/backend && ./scripts/backup-db.sh

# Add hourly backups (for critical systems)
0 * * * * cd /path/to/lexiflow-premium/backend && ./scripts/backup-db.sh
```

### Restore Database

```bash
# List available backups
./scripts/restore-db.sh

# Restore specific backup
./scripts/restore-db.sh ./backups/lexiflow_backup_20231212_120000.sql.gz

# Via docker-helper
./scripts/docker-helper.sh restore ./backups/lexiflow_backup_20231212_120000.sql.gz
```

**WARNING**: Restore will delete all existing data!

### Backup Best Practices

1. **Regular Schedule**: Daily minimum, hourly for production
2. **Off-site Storage**: Copy backups to separate server/cloud
3. **Test Restores**: Regularly verify backup integrity
4. **Monitor Size**: Watch backup growth trends
5. **Retention Policy**: Keep 30 days minimum

## Monitoring & Maintenance

### Health Checks

```bash
# Check service status
./scripts/docker-helper.sh status

# View container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# Check specific service
docker inspect lexiflow-postgres | grep -A 5 Health
```

### Logs

```bash
# View all logs
./scripts/docker-helper.sh logs

# Follow logs in real-time
docker-compose logs -f

# Specific service logs
docker-compose logs -f postgres
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 postgres
```

### Performance Monitoring

```bash
# Container resource usage
docker stats

# PostgreSQL performance
docker exec -it lexiflow-postgres psql -U lexiflow_user -d lexiflow_db -c "
SELECT * FROM pg_stat_activity WHERE state = 'active';
"

# Redis memory usage
docker exec -it lexiflow-redis redis-cli INFO memory
```

### Maintenance Tasks

```bash
# Update Docker images
docker-compose pull

# Rebuild containers
./scripts/docker-helper.sh rebuild

# Clean unused resources
docker system prune -a --volumes

# Vacuum PostgreSQL
docker exec -it lexiflow-postgres psql -U lexiflow_user -d lexiflow_db -c "VACUUM ANALYZE;"
```

## Troubleshooting

### Common Issues

#### 1. Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Check port conflicts
sudo lsof -i :5432
sudo lsof -i :6379

# Remove and recreate
docker-compose down
docker-compose up -d
```

#### 2. Database Connection Refused

```bash
# Check if PostgreSQL is ready
docker exec lexiflow-postgres pg_isready -U lexiflow_user

# Check network
docker network ls
docker network inspect lexiflow-network

# Restart PostgreSQL
docker-compose restart postgres
```

#### 3. Migration Failures

```bash
# Check migration status
./scripts/migrate.sh show

# View migration errors
docker-compose logs app

# Revert and retry
./scripts/migrate.sh revert
./scripts/migrate.sh run
```

#### 4. Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system df
docker system prune -a --volumes

# Remove old backups
find ./backups -name "*.sql.gz" -mtime +30 -delete
```

#### 5. Slow Performance

```bash
# Check resource usage
docker stats

# Increase resources in docker-compose.prod.yml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 4G

# Optimize PostgreSQL
docker exec -it lexiflow-postgres psql -U lexiflow_user -d lexiflow_db -c "
REINDEX DATABASE lexiflow_db;
VACUUM FULL ANALYZE;
"
```

### Debug Mode

```bash
# Enable debug logging
# In .env file:
LOG_LEVEL=debug
DB_LOGGING=true

# Restart services
docker-compose restart

# Watch logs
docker-compose logs -f
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Update all passwords and secrets
- [ ] Configure SSL certificates
- [ ] Set up reverse proxy (nginx/traefik)
- [ ] Configure firewall rules
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Configure backup automation
- [ ] Test restore procedures
- [ ] Set resource limits
- [ ] Configure log rotation
- [ ] Enable security features

### Production Environment

```bash
# 1. Configure production environment
cp .env.example .env.production
nano .env.production

# 2. Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# 3. Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Run migrations
./scripts/migrate.sh run

# 5. Verify deployment
./scripts/docker-helper.sh status prod
```

### Security Hardening

1. **Network Isolation**
   ```yaml
   # Bind to localhost only
   ports:
     - "127.0.0.1:5432:5432"
   ```

2. **Use Secrets**
   ```bash
   # Docker secrets for sensitive data
   docker secret create db_password ./db_password.txt
   ```

3. **Regular Updates**
   ```bash
   # Update base images
   docker-compose pull
   docker-compose up -d
   ```

4. **Resource Limits**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 2G
   ```

### Monitoring Setup

```bash
# Add Prometheus metrics
# In docker-compose.prod.yml:

prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
```

## Support & Resources

### Documentation
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)

### Scripts Reference
See [scripts/README.md](./scripts/README.md) for detailed script documentation.

### Getting Help

1. Check logs: `./scripts/docker-helper.sh logs`
2. Check service status: `./scripts/docker-helper.sh status`
3. Review environment variables in `.env`
4. Consult documentation
5. Open an issue on GitHub

---

**LexiFlow AI Legal Suite** - Enterprise Document Management System
