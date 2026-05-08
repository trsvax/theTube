#!/usr/bin/env bash
# Sync local assets (fonts, logos, etc.) to S3.
# Run this when you add or update files in public/fonts/ or other asset dirs.
# Requires AWS CLI configured locally.
#
# Usage: ./sync-assets.sh

set -euo pipefail

BUCKET="${S3_BUCKET:-}"
if [[ -z "$BUCKET" ]]; then
  echo "Error: S3_BUCKET env var is not set." >&2
  echo "  export S3_BUCKET=your-bucket-name" >&2
  exit 1
fi

echo "Syncing public/fonts/ → s3://$BUCKET/fonts/"
aws s3 sync public/fonts/ "s3://$BUCKET/fonts/" \
  --exclude "*" \
  --include "*.woff" \
  --include "*.woff2"

echo "Done."
