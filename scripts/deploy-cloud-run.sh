#!/usr/bin/env bash
# Emergency / one-off Cloud Run deploy from a machine that already has images
# or Docker. Production is Cloud Build (cloudbuild.yaml), submitted by GitHub
# Actions. Local Docker Compose is for development only.
# Usage:
#   ./scripts/deploy-cloud-run.sh
#   ./scripts/deploy-cloud-run.sh --rotate-secrets
#   ./scripts/deploy-cloud-run.sh --help
set -euo pipefail

export MSYS2_ARG_CONV_EXCL="${MSYS2_ARG_CONV_EXCL:-*}"

# Git Bash converts `/c` and splits unquoted "Google Cloud SDK" paths.
# cmd.exe //c lets Windows resolve gcloud.cmd from PATH (//c so Git Bash
# does not turn /c into C:\).
if command -v cmd.exe >/dev/null 2>&1 && command -v gcloud.cmd >/dev/null 2>&1; then
  gcloud() { cmd.exe //c gcloud.cmd "$@"; }
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PROJECT="${GCP_PROJECT:-cfc-g12}"
REGION="${GCP_REGION:-asia-southeast1}"
REPO="${AR_REPO:-church}"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}"
ACCOUNT="${GCP_ACCOUNT:-david.estrelloso.tribugenia@gmail.com}"

API_SERVICE="${API_SERVICE:-church-api}"
AUTH_SERVICE="${AUTH_SERVICE:-church-auth}"
WEB_SERVICE="${WEB_SERVICE:-church-web}"

ROTATE_SECRETS=0
SKIP_BUILD=0
SKIP_SECRETS=0
CI_DEPLOY=0

usage() {
  cat <<'EOF'
Deploy church stack to Google Cloud Run (asia-southeast1 by default).

Production: push to main. GitHub Actions submits cloudbuild.yaml; GCP builds
images and deploys. Do not use this script for routine production deploys.

  --rotate-secrets   Generate new BETTER_AUTH_SECRET and ADMIN_API_TOKEN versions
  --skip-build       Redeploy existing Artifact Registry *:latest (used by Cloud Build)
  --skip-secrets     Do not create/update Secret Manager secrets
  --ci               Use Application Default Credentials (Cloud Build / Actions)
  --help             Show this help

Env overrides: GCP_PROJECT, GCP_REGION, AR_REPO, API_SERVICE, AUTH_SERVICE, WEB_SERVICE,
               GCP_ACCOUNT (local only), CLOUDINARY_CLOUD_NAME, VITE_* build args

Secrets are seeded from .env / .env.production.local (DATABASE_URL, Cloudinary, etc.).
In CI, keep secrets in Secret Manager and pass --ci --skip-secrets.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --rotate-secrets) ROTATE_SECRETS=1; shift ;;
    --skip-build) SKIP_BUILD=1; shift ;;
    --skip-secrets) SKIP_SECRETS=1; shift ;;
    --ci) CI_DEPLOY=1; shift ;;
    --help|-h) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

log() { printf '+ %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

need_cmd gcloud
need_cmd docker
need_cmd openssl

load_env_file() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  local line key val escaped
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line//[[:space:]]/}" ]] && continue
    [[ "$line" == *=* ]] || continue
    key="${line%%=*}"
    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    val="${line#*=}"
    # Trim surrounding quotes only
    if [[ "$val" =~ ^\".*\"$ ]]; then
      val="${val:1:${#val}-2}"
    elif [[ "$val" =~ ^\'.*\'$ ]]; then
      val="${val:1:${#val}-2}"
    fi
    printf -v escaped '%q' "$val"
    eval "export ${key}=${escaped}"
  done < "$f"
}

load_env_file "$ROOT/.env"
load_env_file "$ROOT/.env.production.local"

ensure_apis() {
  if [[ "$CI_DEPLOY" == "1" ]]; then
    log "CI: skip enabling APIs (project should already have Run/AR/Secret Manager)"
    return
  fi
  log "Enabling GCP APIs on ${PROJECT}"
  gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    --project="$PROJECT" \
    --quiet
}

ensure_artifact_repo() {
  if gcloud artifacts repositories describe "$REPO" \
    --project="$PROJECT" \
    --location="$REGION" >/dev/null 2>&1; then
    log "Artifact Registry repo ${REPO} exists"
    return
  fi
  log "Creating Artifact Registry repo ${REPO}"
  gcloud artifacts repositories create "$REPO" \
    --project="$PROJECT" \
    --repository-format=docker \
    --location="$REGION" \
    --quiet
}

# Ensure docker can push to Artifact Registry
configure_docker_auth() {
  gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
}

project_number() {
  gcloud projects describe "$PROJECT" --format='value(projectNumber)'
}

runtime_sa() {
  echo "$(project_number)-compute@developer.gserviceaccount.com"
}

# Create secret if missing; optionally add a new version from stdin value.
# Usage: upsert_secret NAME VALUE [force_new=0]
upsert_secret() {
  local name="$1"
  local value="$2"
  local force="${3:-0}"

  if [[ -z "$value" ]]; then
    log "skip secret ${name} (empty value)"
    return 0
  fi

  if ! gcloud secrets describe "$name" --project="$PROJECT" >/dev/null 2>&1; then
    log "Creating secret ${name}"
    printf '%s' "$value" | gcloud secrets create "$name" \
      --project="$PROJECT" \
      --replication-policy=automatic \
      --data-file=- \
      --quiet
  elif [[ "$force" == "1" ]]; then
    log "Adding new version for secret ${name}"
    printf '%s' "$value" | gcloud secrets versions add "$name" \
      --project="$PROJECT" \
      --data-file=- \
      --quiet
  else
    log "Secret ${name} already exists (use --rotate-secrets to add a version)"
  fi

  local sa
  sa="$(runtime_sa)"
  gcloud secrets add-iam-policy-binding "$name" \
    --project="$PROJECT" \
    --member="serviceAccount:${sa}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet >/dev/null
}

ensure_secrets() {
  [[ "$SKIP_SECRETS" == "1" ]] && { log "Skipping secrets"; return; }

  [[ -n "${DATABASE_URL:-}" ]] || die "DATABASE_URL missing in .env / .env.production.local"

  upsert_secret church-database-url "$DATABASE_URL" "$ROTATE_SECRETS"

  local auth_secret admin_token
  if [[ "$ROTATE_SECRETS" == "1" ]] || ! gcloud secrets describe church-better-auth-secret --project="$PROJECT" >/dev/null 2>&1; then
    auth_secret="$(openssl rand -base64 32)"
    upsert_secret church-better-auth-secret "$auth_secret" 1
  else
    upsert_secret church-better-auth-secret "unused" 0
  fi

  if [[ "$ROTATE_SECRETS" == "1" ]] || ! gcloud secrets describe church-admin-api-token --project="$PROJECT" >/dev/null 2>&1; then
    admin_token="$(openssl rand -hex 32)"
    upsert_secret church-admin-api-token "$admin_token" 1
  else
    upsert_secret church-admin-api-token "unused" 0
  fi

  if [[ "$ROTATE_SECRETS" == "1" ]] || ! gcloud secrets describe church-gateway-secret --project="$PROJECT" >/dev/null 2>&1; then
    gateway_secret="$(openssl rand -hex 32)"
    upsert_secret church-gateway-secret "$gateway_secret" 1
  else
    upsert_secret church-gateway-secret "unused" 0
  fi

  # Optional — only if present in env files
  [[ -n "${GOOGLE_CLIENT_ID:-}" ]] && upsert_secret church-google-client-id "$GOOGLE_CLIENT_ID" "$ROTATE_SECRETS"
  [[ -n "${GOOGLE_CLIENT_SECRET:-}" ]] && upsert_secret church-google-client-secret "$GOOGLE_CLIENT_SECRET" "$ROTATE_SECRETS"
  [[ -n "${RESEND_API_KEY:-}" ]] && upsert_secret church-resend-api-key "$RESEND_API_KEY" "$ROTATE_SECRETS"
  [[ -n "${CLOUDINARY_API_KEY:-}" ]] && upsert_secret church-cloudinary-api-key "$CLOUDINARY_API_KEY" "$ROTATE_SECRETS"
  [[ -n "${CLOUDINARY_API_SECRET:-}" ]] && upsert_secret church-cloudinary-api-secret "$CLOUDINARY_API_SECRET" "$ROTATE_SECRETS"
}

image_tag() {
  local name="$1"
  echo "${REGISTRY}/${name}:$(git rev-parse --short HEAD 2>/dev/null || echo latest)"
}

build_and_push() {
  local svc="$1"
  local dockerfile="$2"
  local target="${3:-}"
  local tag
  tag="$(image_tag "$svc")"

  log "Building ${tag}"
  local -a build_args=()
  if [[ "$svc" == "$WEB_SERVICE" ]]; then
    build_args+=(
      --build-arg "VITE_API_BASE_URL=/api/v1"
      --build-arg "VITE_AUTH_BASE_URL=/api/auth"
      --build-arg "VITE_CLOUDINARY_CLOUD_NAME=${VITE_CLOUDINARY_CLOUD_NAME:-${CLOUDINARY_CLOUD_NAME:-}}"
      --build-arg "VITE_APP_NAME=${VITE_APP_NAME:-Church}"
    )
  fi
  if [[ -n "$target" ]]; then
    docker build -f "$dockerfile" --target "$target" "${build_args[@]}" -t "$tag" -t "${REGISTRY}/${svc}:latest" . >&2
  else
    docker build -f "$dockerfile" "${build_args[@]}" -t "$tag" -t "${REGISTRY}/${svc}:latest" . >&2
  fi
  log "Pushing ${tag}"
  docker push "$tag" >&2
  docker push "${REGISTRY}/${svc}:latest" >&2
  # Only the tag on stdout — callers capture this (do not mix with docker logs).
  printf '%s\n' "$tag"
}

service_url() {
  gcloud run services describe "$1" \
    --project="$PROJECT" \
    --region="$REGION" \
    --format='value(status.url)' 2>/dev/null || true
}

deploy_api() {
  local tag="$1"
  local web_url="${2:-https://placeholder.invalid}"
  local secrets="DATABASE_URL=church-database-url:latest,ADMIN_API_TOKEN=church-admin-api-token:latest,GATEWAY_SHARED_SECRET=church-gateway-secret:latest"
  local env_vars="ENV=production,CORS_ORIGINS=${web_url},SESSION_COOKIE_NAME=church_session,MIGRATIONS_DIR=/app/apps/api/migrations,CLOUDINARY_FOLDER=${CLOUDINARY_FOLDER:-church-prod}"

  if [[ -n "${CLOUDINARY_CLOUD_NAME:-}" ]]; then
    env_vars="${env_vars},CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}"
  fi
  if gcloud secrets describe church-cloudinary-api-key --project="$PROJECT" >/dev/null 2>&1; then
    secrets="${secrets},CLOUDINARY_API_KEY=church-cloudinary-api-key:latest"
  fi
  if gcloud secrets describe church-cloudinary-api-secret --project="$PROJECT" >/dev/null 2>&1; then
    secrets="${secrets},CLOUDINARY_API_SECRET=church-cloudinary-api-secret:latest"
  fi

  log "Deploying ${API_SERVICE}"
  gcloud run deploy "$API_SERVICE" \
    --project="$PROJECT" \
    --region="$REGION" \
    --image="$tag" \
    --allow-unauthenticated \
    --port=8080 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --set-env-vars="$env_vars" \
    --set-secrets="$secrets" \
    --quiet
}

deploy_auth() {
  local tag="$1"
  local web_url="${2:-https://placeholder.invalid}"
  local secrets="DATABASE_URL=church-database-url:latest,BETTER_AUTH_SECRET=church-better-auth-secret:latest,GATEWAY_SHARED_SECRET=church-gateway-secret:latest"
  local env_vars="HOST=0.0.0.0,NODE_ENV=production,AUTH_PORT=8080,BETTER_AUTH_URL=${web_url},CORS_ORIGINS=${web_url},AUTH_REQUIRE_EMAIL_VERIFICATION=${AUTH_REQUIRE_EMAIL_VERIFICATION:-true}"

  if [[ -n "${EMAIL_FROM:-}" ]]; then
    env_vars="${env_vars},EMAIL_FROM=${EMAIL_FROM}"
  fi
  if gcloud secrets describe church-google-client-id --project="$PROJECT" >/dev/null 2>&1; then
    secrets="${secrets},GOOGLE_CLIENT_ID=church-google-client-id:latest"
  fi
  if gcloud secrets describe church-google-client-secret --project="$PROJECT" >/dev/null 2>&1; then
    secrets="${secrets},GOOGLE_CLIENT_SECRET=church-google-client-secret:latest"
  fi
  if gcloud secrets describe church-resend-api-key --project="$PROJECT" >/dev/null 2>&1; then
    secrets="${secrets},RESEND_API_KEY=church-resend-api-key:latest"
  fi

  log "Deploying ${AUTH_SERVICE}"
  gcloud run deploy "$AUTH_SERVICE" \
    --project="$PROJECT" \
    --region="$REGION" \
    --image="$tag" \
    --allow-unauthenticated \
    --port=8080 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --set-env-vars="$env_vars" \
    --set-secrets="$secrets" \
    --quiet
}

deploy_web() {
  local tag="$1"
  local api_url="$2"
  local auth_url="$3"

  log "Deploying ${WEB_SERVICE}"
  # Do not set PORT in --set-env-vars — Cloud Run injects it from --port.
  gcloud run deploy "$WEB_SERVICE" \
    --project="$PROJECT" \
    --region="$REGION" \
    --image="$tag" \
    --allow-unauthenticated \
    --port=8080 \
    --memory=256Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=10 \
    --set-env-vars="API_UPSTREAM=${api_url},AUTH_UPSTREAM=${auth_url}" \
    --set-secrets="GATEWAY_SHARED_SECRET=church-gateway-secret:latest" \
    --quiet
}

main() {
  log "Project=${PROJECT} Region=${REGION} CI=${CI_DEPLOY}"
  if [[ "$CI_DEPLOY" == "1" ]]; then
    log "Using Application Default Credentials (CI)"
  else
    log "Account=${ACCOUNT}"
    gcloud config set account "$ACCOUNT" --quiet
  fi
  gcloud config set project "$PROJECT" --quiet

  ensure_apis
  ensure_artifact_repo
  if [[ "$SKIP_BUILD" != "1" ]]; then
    configure_docker_auth
  fi
  ensure_secrets

  local api_tag auth_tag web_tag
  if [[ "$SKIP_BUILD" == "1" ]]; then
    api_tag="${REGISTRY}/${API_SERVICE}:latest"
    auth_tag="${REGISTRY}/${AUTH_SERVICE}:latest"
    web_tag="${REGISTRY}/${WEB_SERVICE}:latest"
    log "Using existing images *:latest"
  else
    api_tag="$(build_and_push "$API_SERVICE" "apps/api/Dockerfile")"
    auth_tag="$(build_and_push "$AUTH_SERVICE" "apps/auth/Dockerfile" "runner")"
    web_tag="$(build_and_push "$WEB_SERVICE" "apps/web/Dockerfile" "runner")"
  fi

  # First pass: placeholder CORS / BETTER_AUTH_URL, then patch after web URL known
  deploy_api "$api_tag" "https://placeholder.invalid"
  deploy_auth "$auth_tag" "https://placeholder.invalid"

  local api_url auth_url
  api_url="$(service_url "$API_SERVICE")"
  auth_url="$(service_url "$AUTH_SERVICE")"
  [[ -n "$api_url" && -n "$auth_url" ]] || die "Failed to resolve api/auth service URLs"

  deploy_web "$web_tag" "$api_url" "$auth_url"

  local web_url
  web_url="$(service_url "$WEB_SERVICE")"
  [[ -n "$web_url" ]] || die "Failed to resolve web service URL"

  log "Patching api/auth with web URL ${web_url}"
  deploy_api "$api_tag" "$web_url"
  deploy_auth "$auth_tag" "$web_url"

  log "Smoke checks"
  curl -fsS -o /dev/null "${web_url}/" && log "web / OK"
  curl -fsS "${api_url}/health" && echo
  curl -fsS "${auth_url}/health" && echo
  curl -fsS "${web_url}/api/auth/church/features" && echo
  # /health is not under /api/v1; a proxied API 405/401 still proves nginx→api works
  code="$(curl -sS -o /dev/null -w '%{http_code}' -X OPTIONS "${web_url}/api/v1/auth/me" || true)"
  log "web /api/v1/auth/me OPTIONS → HTTP ${code}"

  cat <<EOF

Deploy complete.
  Web:  ${web_url}
  API:  ${api_url}
  Auth: ${auth_url}

Next: seed super admin against prod DB (uses DATABASE_URL from .env pointing at same Neon):
  BETTER_AUTH_URL=${web_url} CORS_ORIGINS=${web_url} pnpm auth:seed

If Google OAuth is enabled, add redirect URI:
  ${web_url}/api/auth/callback/google
EOF
}

main
