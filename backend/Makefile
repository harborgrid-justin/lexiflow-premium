# LexiFlow Backend - Makefile
# Convenient commands for common development tasks

.PHONY: help install dev prod test clean logs status backup restore migrate seed shell-db shell-redis build rebuild

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)LexiFlow Backend - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# Installation & Setup
install: ## Install dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	npm install
	@echo "$(GREEN)Dependencies installed!$(NC)"

setup: install ## Initial setup (install + env file)
	@echo "$(BLUE)Setting up environment...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(YELLOW).env file created. Please update with your settings.$(NC)"; \
	else \
		echo "$(YELLOW).env file already exists.$(NC)"; \
	fi
	@mkdir -p uploads logs backups
	@echo "$(GREEN)Setup complete!$(NC)"

# Docker Services
up: dev ## Alias for 'make dev'

dev: ## Start development environment
	@echo "$(BLUE)Starting development environment...$(NC)"
	./scripts/docker-helper.sh up dev

prod: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	./scripts/docker-helper.sh up prod

down: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	./scripts/docker-helper.sh down

restart: ## Restart all services
	@echo "$(YELLOW)Restarting services...$(NC)"
	./scripts/docker-helper.sh restart

rebuild: ## Rebuild and restart all services
	@echo "$(BLUE)Rebuilding services...$(NC)"
	./scripts/docker-helper.sh rebuild

# Database Operations
db-init: ## Initialize database with migrations
	@echo "$(BLUE)Initializing database...$(NC)"
	./scripts/init-db.sh

db-init-seed: ## Initialize database with migrations and seed data
	@echo "$(BLUE)Initializing database with seed data...$(NC)"
	./scripts/init-db.sh --with-seed

migrate: ## Run database migrations
	@echo "$(BLUE)Running migrations...$(NC)"
	./scripts/migrate.sh run

migrate-revert: ## Revert last migration
	@echo "$(YELLOW)Reverting last migration...$(NC)"
	./scripts/migrate.sh revert

migrate-generate: ## Generate new migration (use: make migrate-generate NAME=MigrationName)
	@if [ -z "$(NAME)" ]; then \
		echo "$(RED)ERROR: Migration name required. Use: make migrate-generate NAME=YourMigrationName$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Generating migration: $(NAME)$(NC)"
	./scripts/migrate.sh generate $(NAME)

migrate-create: ## Create empty migration (use: make migrate-create NAME=MigrationName)
	@if [ -z "$(NAME)" ]; then \
		echo "$(RED)ERROR: Migration name required. Use: make migrate-create NAME=YourMigrationName$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Creating migration: $(NAME)$(NC)"
	./scripts/migrate.sh create $(NAME)

migrate-status: ## Show migration status
	@echo "$(BLUE)Migration status:$(NC)"
	./scripts/migrate.sh show

seed: ## Seed database with test data
	@echo "$(BLUE)Seeding database...$(NC)"
	./scripts/seed-db.sh

db-reset: ## Reset database (WARNING: Deletes all data)
	@echo "$(RED)This will delete all data!$(NC)"
	./scripts/reset-db.sh

db-reset-force: ## Force reset database without confirmation
	@echo "$(RED)Force resetting database...$(NC)"
	./scripts/reset-db.sh --force --with-seed

# Backup & Restore
backup: ## Create database backup
	@echo "$(BLUE)Creating database backup...$(NC)"
	./scripts/backup-db.sh

restore: ## Restore database from backup (use: make restore FILE=backup.sql.gz)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)ERROR: Backup file required. Use: make restore FILE=backup.sql.gz$(NC)"; \
		echo "Available backups:"; \
		ls -lh backups/*.sql.gz 2>/dev/null || echo "  (none)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restoring database from $(FILE)...$(NC)"
	./scripts/restore-db.sh $(FILE)

# Shell Access
shell-db: ## Open PostgreSQL shell
	@echo "$(BLUE)Opening PostgreSQL shell...$(NC)"
	./scripts/docker-helper.sh shell-db

shell-redis: ## Open Redis CLI
	@echo "$(BLUE)Opening Redis CLI...$(NC)"
	./scripts/docker-helper.sh shell-redis

shell-app: ## Open application shell
	@echo "$(BLUE)Opening application shell...$(NC)"
	./scripts/docker-helper.sh shell-app

# Monitoring
logs: ## Show logs from all services
	./scripts/docker-helper.sh logs

logs-app: ## Show application logs
	docker-compose logs -f app

logs-db: ## Show PostgreSQL logs
	docker-compose logs -f postgres

logs-redis: ## Show Redis logs
	docker-compose logs -f redis

status: ## Show service status
	./scripts/docker-helper.sh status

ps: ## Show running containers
	docker-compose ps

# Development
start: ## Start application (local, not Docker)
	@echo "$(BLUE)Starting application locally...$(NC)"
	npm run start:dev

start-debug: ## Start application in debug mode
	@echo "$(BLUE)Starting application in debug mode...$(NC)"
	npm run start:debug

build: ## Build application
	@echo "$(BLUE)Building application...$(NC)"
	npm run build

# Testing
test: ## Run tests
	@echo "$(BLUE)Running tests...$(NC)"
	npm run test

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	npm run test:watch

test-cov: ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	npm run test:cov

test-e2e: ## Run end-to-end tests
	@echo "$(BLUE)Running end-to-end tests...$(NC)"
	npm run test:e2e

# Linting & Formatting
lint: ## Run linter
	@echo "$(BLUE)Running linter...$(NC)"
	npm run lint

lint-fix: ## Fix linting issues
	@echo "$(BLUE)Fixing linting issues...$(NC)"
	npm run lint:fix

format: ## Format code
	@echo "$(BLUE)Formatting code...$(NC)"
	npm run format

# Cleanup
clean: ## Clean up Docker resources
	@echo "$(YELLOW)Cleaning up Docker resources...$(NC)"
	./scripts/docker-helper.sh clean

clean-all: clean ## Clean everything (Docker + node_modules + build)
	@echo "$(YELLOW)Removing node_modules and build artifacts...$(NC)"
	rm -rf node_modules dist coverage .nyc_output
	@echo "$(GREEN)Cleanup complete!$(NC)"

clean-logs: ## Remove all log files
	@echo "$(YELLOW)Removing log files...$(NC)"
	rm -rf logs/*.log

clean-backups: ## Remove old backups (older than 30 days)
	@echo "$(YELLOW)Removing old backups...$(NC)"
	find backups -name "*.sql.gz" -type f -mtime +30 -delete

# Quick Commands
quick-start: setup dev db-init-seed ## Complete setup and start (for first time users)
	@echo "$(GREEN)LexiFlow is ready!$(NC)"
	@echo "$(BLUE)Access the application at:$(NC)"
	@echo "  - API: http://localhost:3000"
	@echo "  - GraphQL: http://localhost:3000/graphql"
	@echo "  - pgAdmin: http://localhost:5050"
	@echo "  - Redis Commander: http://localhost:8081"

quick-reset: down clean dev db-init-seed ## Quick reset (stop, clean, start fresh)
	@echo "$(GREEN)Environment reset complete!$(NC)"

# Production Deployment
deploy-prod: ## Deploy to production
	@echo "$(BLUE)Deploying to production...$(NC)"
	@echo "$(YELLOW)Make sure you have configured .env for production!$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
	@echo "$(GREEN)Production deployment complete!$(NC)"

# Utility Commands
check: ## Check system requirements
	@echo "$(BLUE)Checking system requirements...$(NC)"
	@echo -n "Docker: "
	@docker --version || echo "$(RED)NOT INSTALLED$(NC)"
	@echo -n "Docker Compose: "
	@docker-compose --version || echo "$(RED)NOT INSTALLED$(NC)"
	@echo -n "Node.js: "
	@node --version || echo "$(RED)NOT INSTALLED$(NC)"
	@echo -n "npm: "
	@npm --version || echo "$(RED)NOT INSTALLED$(NC)"

info: ## Show service information
	@echo "$(BLUE)LexiFlow Service Information$(NC)"
	@echo ""
	@echo "$(GREEN)Service URLs:$(NC)"
	@echo "  API:              http://localhost:3000"
	@echo "  GraphQL:          http://localhost:3000/graphql"
	@echo "  WebSocket:        ws://localhost:3001"
	@echo "  pgAdmin:          http://localhost:5050"
	@echo "  Redis Commander:  http://localhost:8081"
	@echo "  Mailhog (dev):    http://localhost:8025"
	@echo ""
	@echo "$(GREEN)Default Credentials:$(NC)"
	@echo "  pgAdmin:          admin@lexiflow.com / admin"
	@echo "  Redis Commander:  admin / admin"
	@echo ""

version: ## Show version information
	@echo "$(BLUE)LexiFlow Backend Version Information$(NC)"
	@echo ""
	@node --version | sed 's/^/Node.js:      /'
	@npm --version | sed 's/^/npm:          /'
	@docker --version | sed 's/Docker version /Docker:       /'
	@docker-compose --version | sed 's/docker-compose version /Compose:      /'
