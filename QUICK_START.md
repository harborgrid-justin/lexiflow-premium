# LexiFlow AI Legal Suite - Quick Start Guide

Get up and running with LexiFlow in minutes!

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Docker)](#quick-start-docker)
3. [Manual Installation](#manual-installation)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [API Documentation](#api-documentation)
8. [Default Credentials](#default-credentials)
9. [Common Issues](#common-issues)
10. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Docker** 24.x or higher ([Download](https://www.docker.com/))
- **Docker Compose** 2.x or higher (comes with Docker Desktop)

### Optional (for manual installation)
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Redis** 6+ ([Download](https://redis.io/download))

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 5GB minimum
- **OS**: Windows 10/11, macOS 11+, or Linux (Ubuntu 20.04+)

---

## Quick Start (Docker)

The fastest way to get LexiFlow running is using Docker Compose:

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/lexiflow-premium.git
cd lexiflow-premium
```

### Step 2: Start Infrastructure Services
```bash
cd backend
docker-compose up -d
```

This will start:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **pgAdmin** on port 5050 (database UI)
- **Redis Commander** on port 8081 (Redis UI)

### Step 3: Install Backend Dependencies
```bash
# Still in backend directory
npm install
```

### Step 4: Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env if needed (defaults work for Docker setup)
```

### Step 5: Initialize Database
```bash
# Generate and run migrations
npm run migration:generate -- -n InitialMigration
npm run migration:run

# Seed test data
npm run seed
```

### Step 6: Start Backend
```bash
npm run start:dev
```

Backend will be available at:
- **REST API**: http://localhost:3000/api/v1
- **GraphQL**: http://localhost:3000/graphql
- **Swagger Docs**: http://localhost:3000/api/docs

### Step 7: Install Frontend Dependencies
```bash
# Open a new terminal
cd ..  # Back to project root
npm install
```

### Step 8: Start Frontend
```bash
npm run dev
```

Frontend will be available at:
- **Application**: http://localhost:5173

### Step 9: Access the Application
Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:3000/api/docs
- **GraphQL Playground**: http://localhost:3000/graphql
- **pgAdmin**: http://localhost:5050
- **Redis Commander**: http://localhost:8081

**Congratulations!** LexiFlow is now running. 🎉

---

## Manual Installation

If you prefer not to use Docker, follow these steps:

### Step 1: Install PostgreSQL

#### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows
Download and install from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

### Step 2: Install Redis

#### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Windows
Download and install from [Redis Downloads](https://redis.io/download) or use WSL

### Step 3: Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE lexiflow_db;
CREATE USER lexiflow_user WITH PASSWORD 'lexiflow_password';
GRANT ALL PRIVILEGES ON DATABASE lexiflow_db TO lexiflow_user;

# Exit psql
\q
```

### Step 4: Clone and Install
```bash
# Clone repository
git clone https://github.com/your-org/lexiflow-premium.git
cd lexiflow-premium

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### Step 5: Configure Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env` and update database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=lexiflow_db
DB_USERNAME=lexiflow_user
DB_PASSWORD=lexiflow_password

REDIS_HOST=localhost
REDIS_PORT=6379
```

### Step 6: Initialize Database
```bash
# Generate and run migrations
npm run migration:generate -- -n InitialMigration
npm run migration:run

# Seed test data
npm run seed
```

### Step 7: Start Application
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd .. # Back to root
npm run dev
```

---

## Environment Configuration

### Backend Environment Variables

The `.env.example` file in the `backend` directory contains all configuration options. Key variables:

#### Application Settings
```env
NODE_ENV=development
PORT=3000
WS_PORT=3001
API_PREFIX=api/v1
APP_URL=http://localhost:3000
```

#### Database Configuration
```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=lexiflow_db
DB_USERNAME=lexiflow_user
DB_PASSWORD=lexiflow_password
DB_SYNCHRONIZE=false  # Never true in production!
DB_LOGGING=false
```

#### Redis Configuration
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=3600
```

#### JWT Authentication
```env
JWT_SECRET=lexiflow_jwt_secret_enterprise_2024  # Change in production!
JWT_EXPIRES_IN=3600
JWT_REFRESH_SECRET=lexiflow_refresh_secret_2024  # Change in production!
JWT_REFRESH_EXPIRES_IN=604800
```

#### Security & Rate Limiting
```env
BCRYPT_ROUNDS=12
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
CORS_ORIGIN=*
CORS_CREDENTIALS=true
```

#### Email Configuration (Optional)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@lexiflow.com
SMTP_PASSWORD=your_email_password
SMTP_FROM=LexiFlow <noreply@lexiflow.com>
```

#### File Upload
```env
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png
```

#### GraphQL
```env
GRAPHQL_PLAYGROUND=true  # Disable in production
GRAPHQL_DEBUG=true  # Disable in production
GRAPHQL_INTROSPECTION=true  # Disable in production
GRAPHQL_DEPTH_LIMIT=10
GRAPHQL_COMPLEXITY_LIMIT=1000
```

### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_GRAPHQL_URL=http://localhost:3000/graphql
VITE_WS_URL=ws://localhost:3001
VITE_GOOGLE_GEMINI_API_KEY=your_api_key_here
```

---

## Database Setup

### Using Docker (Recommended)

Docker Compose automatically sets up the database. To reset:

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Manual Database Operations

#### Generate Migration
```bash
cd backend
npm run migration:generate -- -n YourMigrationName
```

#### Run Migrations
```bash
npm run migration:run
```

#### Revert Last Migration
```bash
npm run migration:revert
```

#### Show Migration Status
```bash
npm run migration:show
```

#### Seed Database
```bash
# Seed with default test data
npm run seed

# Seed with specific environment
npm run seed:test
```

#### Reset Database
```bash
# Revert all migrations, re-run them, and seed
npm run db:reset
```

---

## Running the Application

### Development Mode

#### Backend
```bash
cd backend

# Watch mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug
```

#### Frontend
```bash
# From project root
npm run dev
```

### Production Mode

#### Backend
```bash
cd backend

# Build
npm run build

# Start production server
npm run start:prod
```

#### Frontend
```bash
# From project root

# Build
npm run build

# Preview production build
npm run preview
```

### Available Scripts

#### Backend Scripts
```bash
npm run start          # Start in normal mode
npm run start:dev      # Start in watch mode
npm run start:debug    # Start in debug mode
npm run start:prod     # Start production build
npm run build          # Build for production
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm run test           # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run E2E tests
```

#### Frontend Scripts
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

---

## API Documentation

### Swagger/OpenAPI Documentation

Once the backend is running, access comprehensive API documentation:

**URL**: http://localhost:3000/api/docs

Features:
- Interactive API explorer
- Try out endpoints directly
- View request/response schemas
- Authentication testing
- Example requests and responses

### GraphQL Playground

Interactive GraphQL IDE:

**URL**: http://localhost:3000/graphql

Features:
- Query builder with autocomplete
- Schema exploration
- Query history
- Variables and headers
- Real-time query execution
- Subscription testing

### Example API Calls

#### REST API - Get Cases
```bash
curl -X GET "http://localhost:3000/api/v1/cases" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### GraphQL - Query Cases
```graphql
query GetCases {
  cases(filter: { status: ACTIVE }) {
    items {
      id
      caseNumber
      title
      status
      client {
        name
        email
      }
    }
    total
  }
}
```

---

## Default Credentials

### Application Users (from seed data)

The seed data creates several test users:

#### Admin User
- **Email**: admin@lexiflow.com
- **Password**: Admin123!
- **Role**: Admin

#### Attorney User
- **Email**: attorney@lexiflow.com
- **Password**: Attorney123!
- **Role**: Attorney

#### Paralegal User
- **Email**: paralegal@lexiflow.com
- **Password**: Paralegal123!
- **Role**: Paralegal

### Database Admin Tools

#### pgAdmin
- **URL**: http://localhost:5050
- **Email**: admin@lexiflow.com
- **Password**: admin

#### Redis Commander
- **URL**: http://localhost:8081
- **Username**: admin
- **Password**: admin

---

## Common Issues

### Port Already in Use

**Problem**: Port 3000, 5432, or 6379 already in use

**Solution**:
```bash
# Find process using port (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or change port in .env file
PORT=3001
```

### Database Connection Error

**Problem**: Cannot connect to PostgreSQL

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps  # For Docker
# or
sudo systemctl status postgresql  # For manual install

# Verify credentials in .env match database
# Restart Docker containers
docker-compose restart
```

### Redis Connection Error

**Problem**: Cannot connect to Redis

**Solution**:
```bash
# Check if Redis is running
docker ps  # For Docker
# or
redis-cli ping  # Should return PONG

# Restart Redis
docker-compose restart redis
```

### Migration Errors

**Problem**: Migration fails to run

**Solution**:
```bash
# Check current migration status
npm run migration:show

# Revert last migration if needed
npm run migration:revert

# Drop database and start fresh (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
npm run migration:run
npm run seed
```

### Frontend Not Connecting to Backend

**Problem**: Frontend API calls fail

**Solution**:
1. Verify backend is running: http://localhost:3000/api/v1
2. Check CORS settings in `backend/.env`:
   ```env
   CORS_ORIGIN=*
   ```
3. Verify frontend `.env` has correct API URL:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```
4. Clear browser cache and restart frontend

### npm install Fails

**Problem**: Dependency installation fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If using older Node version, upgrade to 18+
node --version
```

### Docker Compose Won't Start

**Problem**: Docker services fail to start

**Solution**:
```bash
# Check Docker is running
docker --version

# View logs
docker-compose logs

# Remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build

# Check container status
docker-compose ps
```

---

## Next Steps

### 1. Explore the Application
- Log in with test credentials
- Create a new case
- Upload documents
- Create time entries
- Generate an invoice
- Try the discovery platform
- Explore analytics dashboard

### 2. Explore the APIs
- Visit Swagger documentation: http://localhost:3000/api/docs
- Try GraphQL playground: http://localhost:3000/graphql
- Test authentication endpoints
- Query cases, documents, and billing data

### 3. Development Workflow
- Read the [DEVELOPMENT_REPORT.md](/home/user/lexiflow-premium/DEVELOPMENT_REPORT.md)
- Review the backend code structure
- Explore React components
- Study custom hooks
- Review service layer

### 4. Customize Configuration
- Update JWT secrets for security
- Configure email settings
- Set up external integrations
- Customize business logic

### 5. Deploy to Production
- Set up production database
- Configure environment variables
- Set up SSL/TLS certificates
- Configure reverse proxy (Nginx)
- Set up monitoring (Sentry, etc.)
- Configure backups
- Set up CI/CD pipeline

---

## Additional Resources

### Documentation
- [DEVELOPMENT_REPORT.md](/home/user/lexiflow-premium/DEVELOPMENT_REPORT.md) - Comprehensive project documentation
- [Backend README](/home/user/lexiflow-premium/backend/README.md) - Backend-specific documentation
- [.scratchpad](/home/user/lexiflow-premium/backend/.scratchpad) - Development dashboard

### API Documentation
- Swagger UI: http://localhost:3000/api/docs
- GraphQL Playground: http://localhost:3000/graphql
- GraphQL Schema: http://localhost:3000/graphql/schema

### Admin Tools
- pgAdmin: http://localhost:5050
- Redis Commander: http://localhost:8081

### Technology Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [GraphQL Documentation](https://graphql.org/)
- [Docker Documentation](https://docs.docker.com/)

---

## Getting Help

### Check Logs

#### Backend Logs
```bash
# Docker logs
docker-compose logs backend

# Development server logs
# Check terminal where npm run start:dev is running
```

#### Database Logs
```bash
docker-compose logs postgres
```

#### Redis Logs
```bash
docker-compose logs redis
```

### Debug Mode

Run backend in debug mode:
```bash
cd backend
npm run start:debug
```

Attach debugger to port 9229

### Health Checks

Check system health:
```bash
curl http://localhost:3000/health
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Update JWT_SECRET and JWT_REFRESH_SECRET
- [ ] Set NODE_ENV=production
- [ ] Disable GraphQL playground (GRAPHQL_PLAYGROUND=false)
- [ ] Disable GraphQL introspection (GRAPHQL_INTROSPECTION=false)
- [ ] Set DB_SYNCHRONIZE=false
- [ ] Configure SSL/TLS certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure rate limiting for production load
- [ ] Set up CDN for frontend assets
- [ ] Configure production CORS settings
- [ ] Set up load balancer
- [ ] Configure database connection pooling
- [ ] Set up Redis cluster for scalability
- [ ] Run security audit
- [ ] Perform load testing
- [ ] Set up CI/CD pipeline
- [ ] Configure backup and disaster recovery
- [ ] Review and update email templates
- [ ] Configure cloud storage (S3) for documents
- [ ] Set up database read replicas
- [ ] Configure auto-scaling

---

## Support

For issues, questions, or contributions:

- **Issues**: Create a GitHub issue
- **Documentation**: See DEVELOPMENT_REPORT.md
- **Email**: support@lexiflow.com

---

**Last Updated**: 2025-12-12
**Version**: 1.0.0
**Agent 11 - Coordination & Documentation Lead**
