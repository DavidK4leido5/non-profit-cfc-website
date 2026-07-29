#!/usr/bin/env bash
# One-time GCP setup for GitHub Actions → Cloud Run (frontend only).
# Usage: ./scripts/setup-gcp-deploy.sh YOUR_GCP_PROJECT_ID

set -euo pipefail

PROJECT_ID="${1:-}"
REGION="${REGION:-asia-southeast1}"
AR_REPO="${AR_REPO:-church-page}"
SA_NAME="${SA_NAME:-github-deploy-web}"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="${KEY_FILE:-./gcp-github-deploy-key.json}"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "Usage: $0 YOUR_GCP_PROJECT_ID"
  exit 1
fi

echo "→ Project: ${PROJECT_ID}  Region: ${REGION}"

gcloud config set project "${PROJECT_ID}"

echo "→ Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com

echo "→ Creating Artifact Registry repo (skip if exists)..."
gcloud artifacts repositories describe "${AR_REPO}" \
  --location="${REGION}" >/dev/null 2>&1 \
  || gcloud artifacts repositories create "${AR_REPO}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Church page containers"

echo "→ Creating service account (skip if exists)..."
gcloud iam service-accounts describe "${SA_EMAIL}" >/dev/null 2>&1 \
  || gcloud iam service-accounts create "${SA_NAME}" \
    --display-name="GitHub Actions web deploy"

bind_role() {
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$1" \
    --quiet >/dev/null
}

echo "→ Granting IAM roles..."
bind_role roles/run.admin
bind_role roles/artifactregistry.writer
bind_role roles/iam.serviceAccountUser

echo "→ Creating key: ${KEY_FILE}"
gcloud iam service-accounts keys create "${KEY_FILE}" \
  --iam-account="${SA_EMAIL}"

cat <<EOF

Done. Add these GitHub repository secrets:
  https://github.com/DavidK4leido5/non-profit-cfc-website/settings/secrets/actions

  GCP_PROJECT_ID = ${PROJECT_ID}
  GCP_SA_KEY     = (paste full contents of ${KEY_FILE})

Then push to master — web-deploy.yml will build and deploy.

Delete ${KEY_FILE} after adding the secret. Do NOT commit it.

Optional local deploy (after gcloud auth login):
  docker build -f apps/web/Dockerfile --target runner -t church-web:local .
  gcloud auth configure-docker ${REGION}-docker.pkg.dev
  # tag, push, and gcloud run deploy — or rely on GitHub Actions

EOF
