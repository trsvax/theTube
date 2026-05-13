#!/usr/bin/env bash
# One-time setup: associates the short-url-redirects CloudFront Function
# with the thetube.today distribution's default cache behavior (viewer-request).
# Safe to re-run — checks for existing association first.
set -euo pipefail

DISTRIBUTION_ID="E2DMNPNLN0VAQM"
FUNCTION_NAME="short-url-redirects"

FUNCTION_ARN=$(aws cloudfront describe-function \
  --name "$FUNCTION_NAME" \
  --query 'FunctionSummary.FunctionMetadata.FunctionARN' \
  --output text)

echo "Function ARN: $FUNCTION_ARN"

CONFIG_JSON=$(aws cloudfront get-distribution-config --id "$DISTRIBUTION_ID")
ETAG=$(echo "$CONFIG_JSON" | jq -r '.ETag')
DIST_CONFIG=$(echo "$CONFIG_JSON" | jq '.DistributionConfig')

# Check if already associated
EXISTING=$(echo "$DIST_CONFIG" | jq -r \
  '.DefaultCacheBehavior.FunctionAssociations.Items[]? | select(.EventType=="viewer-request") | .FunctionARN')

if [ "$EXISTING" = "$FUNCTION_ARN" ]; then
  echo "Already associated. Nothing to do."
  exit 0
fi

UPDATED=$(echo "$DIST_CONFIG" | jq \
  --arg arn "$FUNCTION_ARN" \
  '.DefaultCacheBehavior.FunctionAssociations = {"Quantity": 1, "Items": [{"FunctionARN": $arn, "EventType": "viewer-request"}]}')

aws cloudfront update-distribution \
  --id "$DISTRIBUTION_ID" \
  --distribution-config "$UPDATED" \
  --if-match "$ETAG" \
  --query 'Distribution.Status' \
  --output text

echo "Done. Distribution is deploying — takes a few minutes to go live."
