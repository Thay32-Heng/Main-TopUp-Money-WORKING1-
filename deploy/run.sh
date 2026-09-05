#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="${PROJECT_ROOT}/deploy"
CONTROL_PLANE_DIR="${PROJECT_ROOT}/services/control-plane"
TEMPLATE_DIR="${PROJECT_ROOT}/packages/topup-template"

command="$1"
shift || true

function build_template() {
  echo "==> Building Docker image topup-template:1.0.0..."
  docker build -t topup-template:1.0.0 -f "${TEMPLATE_DIR}/Dockerfile" "${TEMPLATE_DIR}"
  echo "✓ Built and tagged topup-template:1.0.0"
}

function up() {
  echo "==> Starting SaaS infrastructure stack..."
  mkdir -p "${DEPLOY_DIR}/traefik/dynamic"
  docker compose -f "${DEPLOY_DIR}/docker-compose.yml" up -d
  echo "✓ Stack started in background."
  echo "  - Traefik: http://localhost:80 (Dashboard: http://localhost:8080)"
  echo "  - Control Plane: http://localhost:3001"
}

function down() {
  echo "==> Stopping SaaS infrastructure stack..."
  docker compose -f "${DEPLOY_DIR}/docker-compose.yml" down
}

function seed_saas() {
  echo "==> Synchronizing Prisma schema and seeding Control Plane database..."
  cd "${CONTROL_PLANE_DIR}"
  npm run db:generate
  npm run db:push
  npm run db:seed
  echo "✓ Control Plane database schema and initial seed applied."
}

function test_provision() {
  local slug="${1:-demostore}"
  local email="${2:-admin@example.com}"
  local name="${3:-Demo Gaming Store}"

  echo "==> Running automated end-to-end test provisioning for slug '${slug}'..."
  cd "${CONTROL_PLANE_DIR}"
  npm run test:e2e -- --slug "${slug}" --email "${email}" --name "${name}"
}

case "$command" in
  build-template)
    build_template
    ;;
  up)
    up
    ;;
  down)
    down
    ;;
  seed-saas)
    seed_saas
    ;;
  test-provision)
    test_provision "$@"
    ;;
  *)
    echo "Usage: $0 {build-template|up|down|seed-saas|test-provision [slug] [email] [name]}"
    exit 1
    ;;
esac
