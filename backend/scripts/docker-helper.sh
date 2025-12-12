#!/bin/bash

# ============================================
# LexiFlow Docker Helper Script
# ============================================
# Convenient commands for Docker operations

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Show help function
show_help() {
    echo "==========================================="
    echo "LexiFlow Docker Helper"
    echo "==========================================="
    echo ""
    echo "Usage: $0 [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  up              Start all services"
    echo "  down            Stop all services"
    echo "  restart         Restart all services"
    echo "  logs            Show logs for all services"
    echo "  ps              Show running containers"
    echo "  clean           Remove all containers, volumes, and networks"
    echo "  rebuild         Rebuild and restart all services"
    echo "  shell-db        Open PostgreSQL shell"
    echo "  shell-redis     Open Redis CLI"
    echo "  shell-app       Open application shell"
    echo "  backup          Create database backup"
    echo "  restore         Restore database from backup"
    echo "  migrate         Run database migrations"
    echo "  seed            Seed database with test data"
    echo "  status          Show service health status"
    echo ""
    echo "Environments:"
    echo "  dev             Development environment (default)"
    echo "  prod            Production environment"
    echo "  test            Test environment"
    echo ""
    echo "Examples:"
    echo "  $0 up dev       Start development environment"
    echo "  $0 logs         Show logs"
    echo "  $0 clean        Clean up everything"
    echo ""
}

# Get environment
ENV=${2:-dev}
COMPOSE_FILES="-f docker-compose.yml"

case $ENV in
    dev|development)
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.dev.yml"
        ;;
    prod|production)
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.prod.yml"
        ;;
    test)
        COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.test.yml"
        ;;
    *)
        if [ "$ENV" != "dev" ] && [ -n "$2" ]; then
            echo -e "${YELLOW}Unknown environment: $ENV, using base configuration${NC}"
            COMPOSE_FILES="-f docker-compose.yml"
        fi
        ;;
esac

# Parse command
COMMAND=${1:-help}

case $COMMAND in
    up|start)
        echo -e "${GREEN}Starting services ($ENV)...${NC}"
        docker-compose $COMPOSE_FILES up -d
        echo ""
        echo -e "${GREEN}Services started!${NC}"
        echo ""
        $0 status
        ;;

    down|stop)
        echo -e "${YELLOW}Stopping services...${NC}"
        docker-compose $COMPOSE_FILES down
        echo -e "${GREEN}Services stopped!${NC}"
        ;;

    restart)
        echo -e "${YELLOW}Restarting services ($ENV)...${NC}"
        docker-compose $COMPOSE_FILES restart
        echo -e "${GREEN}Services restarted!${NC}"
        ;;

    logs)
        SERVICE=${3:-}
        if [ -z "$SERVICE" ]; then
            docker-compose $COMPOSE_FILES logs -f --tail=100
        else
            docker-compose $COMPOSE_FILES logs -f --tail=100 $SERVICE
        fi
        ;;

    ps|list)
        docker-compose $COMPOSE_FILES ps
        ;;

    clean)
        echo -e "${RED}WARNING: This will remove all containers, volumes, and networks!${NC}"
        echo -e "${YELLOW}Are you sure? (yes/no)${NC}"
        read -r response
        if [ "$response" = "yes" ]; then
            echo -e "${YELLOW}Cleaning up...${NC}"
            docker-compose $COMPOSE_FILES down -v --remove-orphans
            echo -e "${GREEN}Cleanup complete!${NC}"
        else
            echo "Operation cancelled."
        fi
        ;;

    rebuild)
        echo -e "${BLUE}Rebuilding services ($ENV)...${NC}"
        docker-compose $COMPOSE_FILES down
        docker-compose $COMPOSE_FILES build --no-cache
        docker-compose $COMPOSE_FILES up -d
        echo -e "${GREEN}Rebuild complete!${NC}"
        ;;

    shell-db|psql)
        echo -e "${BLUE}Opening PostgreSQL shell...${NC}"
        docker exec -it lexiflow-postgres psql -U lexiflow_user -d lexiflow_db
        ;;

    shell-redis|redis-cli)
        echo -e "${BLUE}Opening Redis CLI...${NC}"
        docker exec -it lexiflow-redis redis-cli
        ;;

    shell-app|bash)
        CONTAINER=${3:-lexiflow-app-dev}
        echo -e "${BLUE}Opening shell in $CONTAINER...${NC}"
        docker exec -it $CONTAINER sh
        ;;

    backup)
        echo -e "${BLUE}Creating database backup...${NC}"
        ./scripts/backup-db.sh
        ;;

    restore)
        if [ -z "$3" ]; then
            echo -e "${RED}ERROR: Backup file required${NC}"
            echo "Usage: $0 restore [env] <backup-file>"
            exit 1
        fi
        echo -e "${BLUE}Restoring database from backup...${NC}"
        ./scripts/restore-db.sh "$3"
        ;;

    migrate|migration)
        echo -e "${BLUE}Running database migrations...${NC}"
        ./scripts/migrate.sh run
        ;;

    seed)
        echo -e "${BLUE}Seeding database...${NC}"
        ./scripts/seed-db.sh
        ;;

    status|health)
        echo -e "${CYAN}Service Health Status:${NC}"
        echo ""
        docker-compose $COMPOSE_FILES ps
        echo ""
        echo -e "${CYAN}Container Stats:${NC}"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $(docker-compose $COMPOSE_FILES ps -q 2>/dev/null) 2>/dev/null || echo "No containers running"
        ;;

    help|--help|-h)
        show_help
        ;;

    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
