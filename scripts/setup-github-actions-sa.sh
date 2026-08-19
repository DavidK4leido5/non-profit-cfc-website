#!/usr/bin/env bash
# Create a GCP service account for GitHub Actions → Cloud Run deploys.
# Run once (locally) while logged in as a project owner:
#   bash scripts/setup-github-actions-sa.sh
#
# Then add the printed JSON as GitHub secret: GCP_SA_KEY
set -euo pipefail

export MSYS2_ARG_CONV_EXCL="${MSYS2_ARG_CONV_EXCL:-*}"
if command -v gcloud.cmd >/dev/null 2>&1; then
  gcloud() { gcloud.cmd "$@"; }
fi

PROJECT="${GCP_PROJECT:-cfc-g12}"
SA_NAME="${SA_NAME:-github-actions-deploy}"
SA_EMAIL="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"
KEY_FILE="${KEY_FILE:-./.github-sa-key.json}"

log() { printf '+ %s\n' "$*"; }

gcloud config set project "$PROJECT" --quiet

if ! gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT" >/dev/null 2>&1; then
  log "Creating service account ${SA_EMAIL}"
  gcloud iam service-accounts create "$SA_NAME" \
    --project="$PROJECT" \
    --display-name="GitHub Actions Cloud Run deploy" \
    --quiet
else
  log "Service account already exists: ${SA_EMAIL}"
fi

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')"
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# GitHub Actions submits Cloud Build; Cloud Build SA builds images and deploys.
for ROLE in \
  roles/run.admin \
  roles/artifactregistry.writer \
  roles/secretmanager.secretAccessor \
  roles/cloudbuild.builds.editor \
  roles/storage.admin
do
  log "Binding ${ROLE} on project → ${SA_EMAIL}"
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$ROLE" \
    --condition=None \
    --quiet >/dev/null
done

for ROLE in \
  roles/run.admin \
  roles/artifactregistry.writer \
  roles/secretmanager.secretAccessor
do
  log "Binding ${ROLE} on project → ${CB_SA}"
  gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${CB_SA}" \
    --role="$ROLE" \
    --condition=None \
    --quiet >/dev/null
done

log "Allow deploy SA and Cloud Build SA to act as runtime compute SA"
for MEMBER in "$SA_EMAIL" "$CB_SA"; do
  gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
    --project="$PROJECT" \
    --member="serviceAccount:${MEMBER}" \
    --role="roles/iam.serviceAccountUser" \
    --quiet >/dev/null
done

if [[ -f "$KEY_FILE" ]]; then
  log "Key file already exists at ${KEY_FILE} (not overwritten)"
else
  log "Creating key → ${KEY_FILE}"
  gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SA_EMAIL" \
    --project="$PROJECT" \
    --quiet
fi

# Keep key out of git
if [[ -f .gitignore ]] && ! grep -qxF '.github-sa-key.json' .gitignore; then
  printf '\n.github-sa-key.json\n' >> .gitignore
fi

cat <<EOF

Done.

1. Add GitHub Actions secret GCP_SA_KEY = contents of ${KEY_FILE}
   (Repo → Settings → Secrets and variables → Actions → New repository secret)

2. Optional repo variable CLOUDINARY_CLOUD_NAME (non-secret) if web CDN should use it at build time.

3. Delete the local key after uploading:
   rm -f ${KEY_FILE}

4. Push to main/master. GitHub Actions typechecks, then submits Cloud Build.
   Images are built in GCP and deployed to Cloud Run. No Docker on your laptop.
EOF
