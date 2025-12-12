# LexiFlow Backend - Quick Reference Card

## Essential Commands

### Docker Services

```bash
# Start development environment
make dev                    # or: ./scripts/docker-helper.sh up dev

# Stop all services
make down                   # or: ./scripts/docker-helper.sh down

# View logs
make logs                   # or: ./scripts/docker-helper.sh logs

# Check status
make status                 # or: ./scripts/docker-helper.sh status

# Restart services
make restart                # or: ./scripts/docker-helper.sh restart
```

### Database Operations

```bash
# Initialize database
make db-init-seed          # With seed data

# Run migrations
make migrate               # or: ./scripts/migrate.sh run

# Seed database
make seed                  # or: ./scripts/seed-db.sh

# Reset database
make db-reset              # With confirmation

# Create backup
make backup                # or: ./scripts/backup-db.sh

# Restore backup
make restore FILE=backup.sql.gz
```

### Development

```bash
# First time setup
make quick-start           # Install + Docker + Database + Seed

# Install dependencies
make install               # or: npm install

# Start app locally
make start                 # or: npm run start:dev

# Run tests
make test                  # or: npm run test

# Lint code
make lint                  # or: npm run lint
```

### Shell Access

```bash
# PostgreSQL shell
make shell-db              # or: ./scripts/docker-helper.sh shell-db

# Redis CLI
make shell-redis           # or: ./scripts/docker-helper.sh shell-redis

# Application shell
make shell-app             # or: ./scripts/docker-helper.sh shell-app
```

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| API | http://localhost:3000 | - |
| GraphQL | http://localhost:3000/graphql | - |
| WebSocket | ws://localhost:3001 | - |
| pgAdmin | http://localhost:5050 | admin@lexiflow.com / admin |
| Redis Commander | http://localhost:8081 | admin / admin |
| Mailhog (dev) | http://localhost:8025 | - |

## Environment Variables

```bash
# Copy example
cp .env.example .env

# Essential variables
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=lexiflow_db
DB_USERNAME=lexiflow_user
DB_PASSWORD=your_password_here
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret_here
```

## Common Tasks

### First Time Setup
```bash
make quick-start
# This runs: setup + dev + db-init-seed
```

### Daily Development
```bash
make dev                   # Start Docker services
make logs                  # Watch logs
make shell-db              # Access database when needed
```

### Database Changes
```bash
# After modifying entities
make migrate-generate NAME=YourChangeName
make migrate

# To reset everything
make db-reset-force
```

### Production Deployment
```bash
make deploy-prod
# Or manually:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Troubleshooting
```bash
# Clean restart
make down
make clean
make dev

# Check what's running
make ps

# View specific logs
make logs-app
make logs-db
make logs-redis

# Complete reset
make quick-reset
```

## File Structure

```
backend/
├── docker-compose.yml           # Base Docker config
├── docker-compose.dev.yml       # Development overrides
├── docker-compose.prod.yml      # Production overrides
├── docker-compose.test.yml      # Test configuration
├── Dockerfile                   # Multi-stage build
├── .dockerignore               # Docker ignore rules
├── .env.example                # Environment template
├── Makefile                    # Make commands
├── DOCKER_SETUP.md             # Full documentation
├── QUICK_REFERENCE.md          # This file
├── scripts/
│   ├── README.md               # Scripts documentation
│   ├── docker-helper.sh        # Docker wrapper
│   ├── init-db.sh              # Initialize database
│   ├── migrate.sh              # Migration manager
│   ├── seed-db.sh              # Database seeder
│   ├── backup-db.sh            # Backup creator
│   ├── restore-db.sh           # Backup restorer
│   ├── reset-db.sh             # Database reset
│   ├── init-postgres.sql       # PostgreSQL init
│   └── pgadmin-servers.json    # pgAdmin config
├── backups/                    # Database backups
└── logs/                       # Application logs
```

## Docker Containers

| Container | Purpose | Port(s) |
|-----------|---------|---------|
| lexiflow-postgres | PostgreSQL 15 | 5432 |
| lexiflow-redis | Redis 7 | 6379 |
| lexiflow-pgadmin | Database UI | 5050 |
| lexiflow-redis-commander | Redis UI | 8081 |
| lexiflow-app-dev | NestJS App | 3000, 3001, 9229 |
| lexiflow-mailhog | Email Test (dev) | 1025, 8025 |

## Makefile Commands Reference

```bash
make help                  # Show all commands
make setup                 # Initial setup
make quick-start          # Complete first-time setup
make quick-reset          # Clean reset

# Docker
make dev                  # Start development
make prod                 # Start production
make down                 # Stop services
make restart              # Restart services
make rebuild              # Rebuild containers

# Database
make db-init              # Initialize DB
make db-init-seed         # Initialize with seed
make migrate              # Run migrations
make migrate-revert       # Revert migration
make migrate-generate     # Generate migration
make migrate-create       # Create empty migration
make migrate-status       # Show status
make seed                 # Seed database
make db-reset             # Reset database
make db-reset-force       # Force reset

# Backup & Restore
make backup               # Create backup
make restore              # Restore backup

# Shell Access
make shell-db             # PostgreSQL shell
make shell-redis          # Redis CLI
make shell-app            # App shell

# Monitoring
make logs                 # All logs
make logs-app             # App logs
make logs-db              # DB logs
make logs-redis           # Redis logs
make status               # Service status
make ps                   # Container list

# Development
make start                # Start app locally
make start-debug          # Debug mode
make build                # Build app

# Testing
make test                 # Run tests
make test-watch           # Watch mode
make test-cov             # With coverage
make test-e2e             # E2E tests

# Code Quality
make lint                 # Run linter
make lint-fix             # Fix issues
make format               # Format code

# Cleanup
make clean                # Clean Docker
make clean-all            # Clean everything
make clean-logs           # Remove logs
make clean-backups        # Remove old backups

# Utility
make check                # Check requirements
make info                 # Show service info
make version              # Show versions
```

## Health Checks

```bash
# Check PostgreSQL
docker exec lexiflow-postgres pg_isready -U lexiflow_user

# Check Redis
docker exec lexiflow-redis redis-cli PING

# Check all services
make status
```

## Performance Tips

1. **Increase Docker Resources**: Docker Desktop > Settings > Resources
2. **Use Volumes for node_modules**: Already configured
3. **Enable BuildKit**: `export DOCKER_BUILDKIT=1`
4. **Clean Regularly**: `make clean` weekly
5. **Monitor Resources**: `docker stats`

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong JWT_SECRET
- [ ] Enable Redis password in production
- [ ] Restrict port binding (127.0.0.1:port)
- [ ] Keep Docker images updated
- [ ] Regular security audits: `npm audit`
- [ ] Enable SSL in production
- [ ] Use Docker secrets for sensitive data

## Backup Strategy

```bash
# Manual backup
make backup

# Automated (add to crontab)
0 2 * * * cd /path/to/backend && make backup

# Restore
make restore FILE=backups/lexiflow_backup_YYYYMMDD_HHMMSS.sql.gz
```

## Emergency Procedures

### Complete System Failure
```bash
make down
make clean
make quick-start
```

### Data Corruption
```bash
# Restore from last backup
make restore FILE=backups/latest_backup.sql.gz
```

### Container Won't Start
```bash
# Check logs
make logs

# Rebuild specific service
docker-compose up -d --force-recreate postgres
```

### Out of Disk Space
```bash
make clean
docker system prune -a --volumes
make clean-backups
```

---

**For detailed documentation, see: [DOCKER_SETUP.md](./DOCKER_SETUP.md)**
