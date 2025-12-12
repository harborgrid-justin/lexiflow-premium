# LexiFlow Backend - Startup Instructions

## Quick Start (3 Minutes)

### Step 1: Configure Environment (30 seconds)
```bash
cd /home/user/lexiflow-premium/backend
cp .env.example .env
```

**Edit `.env` and update these critical variables:**
```bash
# Database password (IMPORTANT: Change this!)
DB_PASSWORD=your_secure_password_here

# JWT secrets (IMPORTANT: Change these!)
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Optional: Redis password for production
REDIS_PASSWORD=your_redis_password_here
```

### Step 2: Start Services (90 seconds)
```bash
# Using Make (recommended)
make quick-start

# Or manually:
make dev
make db-init-seed
```

This will:
- Install dependencies
- Start Docker containers
- Initialize PostgreSQL
- Run migrations
- Seed test data

### Step 3: Verify (30 seconds)
```bash
# Check service status
make status

# View logs
make logs
```

### Step 4: Access Services (immediately)

Open your browser and access:

| Service | URL | Credentials |
|---------|-----|-------------|
| **API** | http://localhost:3000 | - |
| **GraphQL Playground** | http://localhost:3000/graphql | - |
| **pgAdmin** | http://localhost:5050 | admin@lexiflow.com / admin |
| **Redis Commander** | http://localhost:8081 | admin / admin |
| **Mailhog (Email Testing)** | http://localhost:8025 | - |

---

## Alternative: Manual Step-by-Step

### Prerequisites Check
```bash
# Verify required software
make check

# Should show:
# ✓ Docker
# ✓ Docker Compose
# ✓ Node.js
# ✓ npm
```

### Step-by-Step Startup

#### 1. Setup Environment
```bash
# Copy environment file
cp .env.example .env

# Edit with your favorite editor
nano .env
# or
vim .env
# or
code .env
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Start Docker Services
```bash
# Development environment
make dev

# Or using docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

#### 4. Wait for Services (30 seconds)
```bash
# Watch containers start
docker-compose ps

# Wait for healthy status
make status
```

#### 5. Initialize Database
```bash
# Run migrations
make migrate

# Seed test data
make seed

# Or do both:
make db-init-seed
```

#### 6. Verify Everything Works
```bash
# Check all services
make status

# Test API
curl http://localhost:3000/health

# Test GraphQL
open http://localhost:3000/graphql

# View logs
make logs
```

---

## Common Commands

### Daily Development
```bash
# Start development environment
make dev

# View logs in real-time
make logs

# Access PostgreSQL
make shell-db

# Access Redis
make shell-redis

# Run tests
make test

# Stop everything
make down
```

### Database Operations
```bash
# Create migration after entity changes
make migrate-generate NAME=AddNewFeature

# Run migrations
make migrate

# Rollback last migration
make migrate-revert

# Reset database completely
make db-reset-force

# Create backup
make backup

# Restore from backup
make restore FILE=backups/backup.sql.gz
```

### Troubleshooting
```bash
# Clean restart
make down
make clean
make dev

# View specific service logs
make logs-app
make logs-db
make logs-redis

# Complete reset
make quick-reset
```

---

## What's Running?

### Docker Containers

| Container | Service | Port(s) | Purpose |
|-----------|---------|---------|---------|
| lexiflow-postgres | PostgreSQL 15 | 5432 | Main database |
| lexiflow-redis | Redis 7 | 6379 | Cache & sessions |
| lexiflow-pgadmin | pgAdmin 4 | 5050 | Database UI |
| lexiflow-redis-commander | Redis Commander | 8081 | Redis UI |
| lexiflow-app-dev | NestJS App | 3000, 3001 | Application |
| lexiflow-mailhog | Mailhog | 1025, 8025 | Email testing |

### Data Volumes

- `lexiflow-postgres-data`: Database storage (persistent)
- `lexiflow-redis-data`: Redis data (persistent)
- `lexiflow-pgadmin-data`: pgAdmin settings
- `./uploads`: File uploads (host mount)
- `./logs`: Application logs (host mount)
- `./backups`: Database backups (host mount)

---

## Testing Your Setup

### 1. Test API
```bash
# Health check
curl http://localhost:3000/health

# Expected response: {"status":"ok"}
```

### 2. Test GraphQL
```bash
# Open GraphQL Playground
open http://localhost:3000/graphql

# Try a query:
query {
  __schema {
    types {
      name
    }
  }
}
```

### 3. Test Database
```bash
# Access PostgreSQL
make shell-db

# In psql:
\dt                 # List tables
SELECT COUNT(*) FROM users;
\q                  # Quit
```

### 4. Test Redis
```bash
# Access Redis
make shell-redis

# In redis-cli:
PING                # Should return PONG
KEYS *              # List all keys
QUIT                # Exit
```

---

## Production Deployment

### Production Checklist

- [ ] Update `.env` with production credentials
- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Enable SSL/TLS for database
- [ ] Configure Redis password
- [ ] Set up reverse proxy (nginx/traefik)
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting
- [ ] Review resource limits
- [ ] Test backup/restore procedure

### Production Start

```bash
# 1. Configure production environment
cp .env.example .env.production
nano .env.production

# 2. Start production services
make prod
# Or:
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 3. Run migrations (NO seed data in production!)
make migrate

# 4. Verify
make status

# 5. Set up automated backups (cron)
crontab -e
# Add: 0 2 * * * cd /path/to/backend && make backup
```

---

## Environment Variables Reference

### Must Change for Production
```bash
DB_PASSWORD=<strong-password>
JWT_SECRET=<64-character-random-string>
JWT_REFRESH_SECRET=<64-character-random-string>
REDIS_PASSWORD=<strong-password>
SESSION_SECRET=<64-character-random-string>
```

### Generate Secure Secrets
```bash
# Generate 64-character secret
openssl rand -base64 64

# Generate 32-character password
openssl rand -base64 32
```

### Optional but Recommended
```bash
# Email (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# AWS (for S3 uploads)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# Sentry (for error tracking)
SENTRY_DSN=your-sentry-dsn

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_your_key
```

---

## Monitoring & Health Checks

### Check Service Health
```bash
# All services
make status

# Docker stats
docker stats

# PostgreSQL
docker exec lexiflow-postgres pg_isready -U lexiflow_user

# Redis
docker exec lexiflow-redis redis-cli PING
```

### View Logs
```bash
# All logs
make logs

# Application only
make logs-app

# Database only
make logs-db

# Redis only
make logs-redis

# Follow logs in real-time
docker-compose logs -f
```

### Monitor Resources
```bash
# Container resource usage
docker stats

# Disk usage
df -h
docker system df

# Clean up if needed
make clean
```

---

## Backup & Recovery

### Create Backup
```bash
# Manual backup
make backup

# Backups are stored in: ./backups/
# Format: lexiflow_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Automated Backups
```bash
# Add to crontab
crontab -e

# Daily at 2 AM
0 2 * * * cd /path/to/backend && make backup

# Hourly (for critical systems)
0 * * * * cd /path/to/backend && make backup
```

### Restore Backup
```bash
# List available backups
ls -lh backups/

# Restore specific backup
make restore FILE=backups/lexiflow_backup_20231212_120000.sql.gz

# WARNING: This will delete all current data!
```

---

## Troubleshooting Guide

### Problem: Containers won't start
```bash
# Solution 1: Check ports
sudo lsof -i :5432
sudo lsof -i :6379
sudo lsof -i :3000

# Solution 2: Clean restart
make down
make clean
make dev
```

### Problem: Database connection failed
```bash
# Check PostgreSQL is ready
docker exec lexiflow-postgres pg_isready -U lexiflow_user

# View logs
make logs-db

# Restart PostgreSQL
docker-compose restart postgres
```

### Problem: Migration failed
```bash
# Check status
make migrate-status

# Rollback if needed
make migrate-revert

# Try again
make migrate
```

### Problem: Out of disk space
```bash
# Check usage
docker system df

# Clean up
make clean
docker system prune -a --volumes

# Remove old backups
make clean-backups
```

### Problem: Slow performance
```bash
# Check resources
docker stats

# Increase Docker resources
# Docker Desktop > Settings > Resources
# - CPU: 4+ CPUs
# - Memory: 6+ GB

# Optimize database
make shell-db
VACUUM ANALYZE;
```

---

## Getting Help

### Documentation
1. **Quick Reference**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Daily commands
2. **Full Setup Guide**: [DOCKER_SETUP.md](./DOCKER_SETUP.md) - Complete documentation
3. **Scripts Guide**: [scripts/README.md](./scripts/README.md) - Script details
4. **Infrastructure Summary**: [INFRASTRUCTURE_SUMMARY.md](./INFRASTRUCTURE_SUMMARY.md) - Overview

### Commands
```bash
# Show all available commands
make help

# Show service information
make info

# Show version information
make version

# Verify setup
./verify-setup.sh
```

### Common Issues
- Port conflicts: Change ports in `.env`
- Permission errors: `sudo chown -R $USER:$USER .`
- Docker not running: `sudo systemctl start docker`
- Disk space: `make clean`

---

## Next Steps After Startup

1. **Test the API**
   - Visit http://localhost:3000/graphql
   - Try some queries
   - Test authentication endpoints

2. **Explore pgAdmin**
   - Visit http://localhost:5050
   - Browse database schema
   - Run SQL queries

3. **Check Redis Commander**
   - Visit http://localhost:8081
   - View cached data
   - Monitor memory usage

4. **Review Logs**
   - `make logs`
   - Check for any warnings
   - Verify all services started correctly

5. **Create Your First Backup**
   - `make backup`
   - Verify backup file created
   - Test restore procedure

6. **Start Development**
   - Make code changes
   - Hot reload should pick up changes
   - Run tests: `make test`

---

## Success Criteria

Your setup is successful when:

✅ All containers are running (`make status` shows all healthy)
✅ API responds at http://localhost:3000/health
✅ GraphQL playground loads at http://localhost:3000/graphql
✅ Database has tables (`make shell-db` then `\dt`)
✅ Redis is responding (`make shell-redis` then `PING`)
✅ Logs show no errors (`make logs`)
✅ Backup completes successfully (`make backup`)

---

## Support

If you encounter issues:

1. Check logs: `make logs`
2. Verify services: `make status`
3. Review documentation: `cat QUICK_REFERENCE.md`
4. Try clean restart: `make quick-reset`
5. Check system requirements: `make check`

---

**You're all set! Happy coding! 🚀**
