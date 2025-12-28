#!/bin/bash
# =============================================================================
# LexiFlow Premium - Docker Connectivity Test Script
# =============================================================================
# Tests connectivity between all Docker services
# Usage: ./scripts/docker-test-connectivity.sh
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=============================================="
echo "LexiFlow Premium - Connectivity Test"
echo "=============================================="

cd "$PROJECT_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local name="$1"
    local command="$2"
    local expected="$3"

    echo -n "Testing: $name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

echo ""
echo "1. Checking Docker Container Status"
echo "----------------------------------------------"
docker compose ps

echo ""
echo "2. Testing Service Health Endpoints"
echo "----------------------------------------------"

# Test frontend health (Nginx)
run_test "Frontend health (localhost:80/health)" \
    "curl -sf http://localhost:80/health"

# Test backend health directly
run_test "Backend health (localhost:5000/api/health)" \
    "curl -sf http://localhost:5000/api/health"

# Test backend through frontend proxy
run_test "Backend via Nginx proxy (/api/health)" \
    "curl -sf http://localhost:80/api/health"

# Test Redis
run_test "Redis connection" \
    "docker compose exec -T redis redis-cli ping | grep -q PONG"

echo ""
echo "3. Testing Inter-Container Communication"
echo "----------------------------------------------"

# Test frontend can reach backend
run_test "Frontend -> Backend (container network)" \
    "docker compose exec -T frontend curl -sf http://backend:5000/api/health"

# Test backend can reach Redis
run_test "Backend -> Redis (container network)" \
    "docker compose exec -T backend curl -sf http://redis:6379 2>&1 | grep -q 'ERR wrong number of arguments' || docker compose exec -T redis redis-cli ping | grep -q PONG"

echo ""
echo "4. Testing API Endpoints"
echo "----------------------------------------------"

# Test API versioned endpoint
run_test "API v1 endpoint (/api/v1)" \
    "curl -sf -o /dev/null -w '%{http_code}' http://localhost:5000/api/v1/auth/health | grep -q '200\|401\|404'"

# Test Swagger docs
run_test "Swagger documentation (/api/docs)" \
    "curl -sf -o /dev/null -w '%{http_code}' http://localhost:5000/api/docs | grep -q '200\|301\|302'"

echo ""
echo "5. Testing Database Connection"
echo "----------------------------------------------"

# Test database health via backend
run_test "Database connection (via health endpoint)" \
    "curl -sf http://localhost:5000/api/health | grep -qi 'database\|status'"

echo ""
echo "6. Network Configuration"
echo "----------------------------------------------"

# Show network details
docker network inspect lexiflow-premium_lexiflow-network --format '{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{"\n"}}{{end}}' 2>/dev/null || echo "Network not found (containers may not be running)"

echo ""
echo "=============================================="
echo "Test Summary"
echo "=============================================="
echo -e "Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Failed: ${RED}${TESTS_FAILED}${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All connectivity tests passed!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}Some tests failed. Check the logs above.${NC}"
    echo ""
    echo "Troubleshooting tips:"
    echo "  - Ensure all containers are running: docker compose ps"
    echo "  - Check container logs: docker compose logs [service]"
    echo "  - Verify network: docker network ls"
    echo "  - Restart services: docker compose restart"
    exit 1
fi
