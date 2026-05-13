#!/usr/bin/env zsh
# aws-setup.sh — One-time AWS infrastructure setup for theTube
#
# Prerequisites:
#   - AWS CLI installed and configured (aws configure)
#   - An ACM certificate for thetube.today in us-east-1 (CloudFront requires this region)
#     Request one at: https://console.aws.amazon.com/acm/home?region=us-east-1
#   - Route 53 hosted zone for thetube.today already created
#
# Usage:
#   chmod +x scripts/aws-setup.sh
#   ./scripts/aws-setup.sh
#
# What this script creates:
#   - S3 bucket (private, CloudFront-only access)
#   - CloudFront OAC + distribution with behaviors
#   - CloudFront key pair for signed cookies
#   - IAM user + policy for GitHub Actions
#   - Route 53 A/AAAA alias records
#   Outputs credentials to add as GitHub Actions secrets.

set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────
BUCKET_NAME="thetube-today"
REGION="us-east-1"
DOMAIN="thetube.today"
ACM_CERT_ARN="arn:aws:acm:us-east-1:110255818591:certificate/f7a101e7-aff7-45bd-8f3a-4ebac8e43e0a"
HOSTED_ZONE_ID="Z09834561ROB66CQGZHJH"
# ─────────────────────────────────────────────────────────────────────────────

if [[ -z "$ACM_CERT_ARN" || -z "$HOSTED_ZONE_ID" ]]; then
  echo "ERROR: Set ACM_CERT_ARN and HOSTED_ZONE_ID at the top of this script before running."
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account: $ACCOUNT_ID  Region: $REGION"

# ── 1. S3 Bucket ─────────────────────────────────────────────────────────────
echo "\n── Creating S3 bucket: $BUCKET_NAME"

if [[ "$REGION" == "us-east-1" ]]; then
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
else
  aws s3api create-bucket \
    --bucket "$BUCKET_NAME" \
    --region "$REGION" \
    --create-bucket-configuration LocationConstraint="$REGION"
fi

aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "S3 bucket created and public access blocked."

# ── 2. CloudFront Origin Access Control ──────────────────────────────────────
echo "\n── Creating CloudFront OAC"

OAC_ID=$(aws cloudfront create-origin-access-control \
  --origin-access-control-config \
    "Name=thetube-oac,Description=theTube S3 OAC,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3" \
  --query 'OriginAccessControl.Id' \
  --output text)

echo "OAC ID: $OAC_ID"

# ── 3. CloudFront Distribution ───────────────────────────────────────────────
echo "\n── Creating CloudFront distribution (takes ~5 min to deploy)"

DISTRIBUTION=$(aws cloudfront create-distribution --distribution-config "{
  \"CallerReference\": \"thetube-$(date +%s)\",
  \"Comment\": \"theTube\",
  \"DefaultRootObject\": \"index.html\",
  \"Enabled\": true,
  \"HttpVersion\": \"http2and3\",
  \"Origins\": {
    \"Quantity\": 1,
    \"Items\": [{
      \"Id\": \"s3-origin\",
      \"DomainName\": \"${BUCKET_NAME}.s3.${REGION}.amazonaws.com\",
      \"S3OriginConfig\": { \"OriginAccessIdentity\": \"\" },
      \"OriginAccessControlId\": \"${OAC_ID}\"
    }]
  },
  \"DefaultCacheBehavior\": {
    \"TargetOriginId\": \"s3-origin\",
    \"ViewerProtocolPolicy\": \"redirect-to-https\",
    \"CachePolicyId\": \"658327ea-f89d-4fab-a63d-7e88639e58f6\",
    \"AllowedMethods\": { \"Quantity\": 2, \"Items\": [\"GET\", \"HEAD\"] }
  },
  \"CustomErrorResponses\": {
    \"Quantity\": 2,
    \"Items\": [
      { \"ErrorCode\": 404, \"ResponseCode\": \"404\", \"ResponsePagePath\": \"/404.html\" },
      { \"ErrorCode\": 403, \"ResponseCode\": \"404\", \"ResponsePagePath\": \"/404.html\" }
    ]
  },
  \"Aliases\": {
    \"Quantity\": 1,
    \"Items\": [\"${DOMAIN}\"]
  },
  \"ViewerCertificate\": {
    \"ACMCertificateArn\": \"${ACM_CERT_ARN}\",
    \"SSLSupportMethod\": \"sni-only\",
    \"MinimumProtocolVersion\": \"TLSv1.2_2021\"
  },
  \"PriceClass\": \"PriceClass_100\"
}")

DISTRIBUTION_ID=$(echo "$DISTRIBUTION" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['Distribution']['Id'])")
DISTRIBUTION_ARN=$(echo "$DISTRIBUTION" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['Distribution']['ARN'])")
CLOUDFRONT_DOMAIN=$(echo "$DISTRIBUTION" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['Distribution']['DomainName'])")

echo "Distribution ID:  $DISTRIBUTION_ID"
echo "CloudFront domain: $CLOUDFRONT_DOMAIN"

# ── 4. S3 Bucket Policy — allow CloudFront OAC only ──────────────────────────
echo "\n── Attaching bucket policy"

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Effect\": \"Allow\",
    \"Principal\": { \"Service\": \"cloudfront.amazonaws.com\" },
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::${BUCKET_NAME}/*\",
    \"Condition\": {
      \"StringEquals\": {
        \"AWS:SourceArn\": \"${DISTRIBUTION_ARN}\"
      }
    }
  }]
}"

echo "Bucket policy attached."

# ── 5. CloudFront Key Pair for Signed Cookies ─────────────────────────────────
echo "\n── Generating CloudFront key pair for signed cookies"

openssl genrsa -out cloudfront-private-key.pem 2048
openssl rsa -pubout -in cloudfront-private-key.pem -out cloudfront-public-key.pem

CF_PUBLIC_KEY_ID=$(aws cloudfront create-public-key \
  --public-key-config "CallerReference=thetube-$(date +%s),Name=thetube-signed-cookies,EncodedKey=$(cat cloudfront-public-key.pem)" \
  --query 'PublicKey.Id' \
  --output text)

CF_KEY_GROUP_ID=$(aws cloudfront create-key-group \
  --key-group-config "Name=thetube-key-group,Items=[\"${CF_PUBLIC_KEY_ID}\"]" \
  --query 'KeyGroup.Id' \
  --output text)

echo "CloudFront Key Pair ID: $CF_PUBLIC_KEY_ID"
echo "Key Group ID:           $CF_KEY_GROUP_ID"
echo "Private key saved to:   cloudfront-private-key.pem  ← DO NOT COMMIT"
rm cloudfront-public-key.pem

# ── 6. IAM User for GitHub Actions ───────────────────────────────────────────
echo "\n── Creating IAM user for GitHub Actions"

aws iam create-user --user-name thetube-deploy

aws iam put-user-policy \
  --user-name thetube-deploy \
  --policy-name thetube-deploy-policy \
  --policy-document "{
    \"Version\": \"2012-10-17\",
    \"Statement\": [
      {
        \"Effect\": \"Allow\",
        \"Action\": [\"s3:PutObject\", \"s3:DeleteObject\", \"s3:ListBucket\"],
        \"Resource\": [
          \"arn:aws:s3:::${BUCKET_NAME}\",
          \"arn:aws:s3:::${BUCKET_NAME}/*\"
        ]
      },
      {
        \"Effect\": \"Allow\",
        \"Action\": \"cloudfront:CreateInvalidation\",
        \"Resource\": \"arn:aws:cloudfront::${ACCOUNT_ID}:distribution/${DISTRIBUTION_ID}\"
      },
      {
        \"Effect\": \"Allow\",
        \"Action\": [\"cloudfront:CreateFunction\", \"cloudfront:UpdateFunction\", \"cloudfront:PublishFunction\", \"cloudfront:DescribeFunction\"],
        \"Resource\": \"arn:aws:cloudfront::${ACCOUNT_ID}:function/short-url-redirects\"
      }
    ]
  }"

KEYS=$(aws iam create-access-key --user-name thetube-deploy)
ACCESS_KEY=$(echo "$KEYS" | python3 -c "import sys,json; print(json.load(sys.stdin)['AccessKey']['AccessKeyId'])")
SECRET_KEY=$(echo "$KEYS" | python3 -c "import sys,json; print(json.load(sys.stdin)['AccessKey']['SecretAccessKey'])")

# ── 7. Route 53 DNS ───────────────────────────────────────────────────────────
echo "\n── Creating Route 53 DNS records"

aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "{
    \"Changes\": [
      {
        \"Action\": \"UPSERT\",
        \"ResourceRecordSet\": {
          \"Name\": \"${DOMAIN}\",
          \"Type\": \"A\",
          \"AliasTarget\": {
            \"HostedZoneId\": \"Z2FDTNDATAQYW2\",
            \"DNSName\": \"${CLOUDFRONT_DOMAIN}\",
            \"EvaluateTargetHealth\": false
          }
        }
      },
      {
        \"Action\": \"UPSERT\",
        \"ResourceRecordSet\": {
          \"Name\": \"${DOMAIN}\",
          \"Type\": \"AAAA\",
          \"AliasTarget\": {
            \"HostedZoneId\": \"Z2FDTNDATAQYW2\",
            \"DNSName\": \"${CLOUDFRONT_DOMAIN}\",
            \"EvaluateTargetHealth\": false
          }
        }
      }
    ]
  }"

echo "DNS records created."

# ── Summary ───────────────────────────────────────────────────────────────────
echo "
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Setup complete. Add these GitHub Actions secrets:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  AWS_ACCESS_KEY_ID          $ACCESS_KEY
  AWS_SECRET_ACCESS_KEY      $SECRET_KEY
  AWS_REGION                 $REGION
  S3_BUCKET                  $BUCKET_NAME
  CLOUDFRONT_DISTRIBUTION_ID $DISTRIBUTION_ID

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Remaining manual steps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Update the /protected/* CloudFront behavior to use
     key group: $CF_KEY_GROUP_ID
     (console: CloudFront → distribution → behaviors → /protected/*)

  2. Store cloudfront-private-key.pem somewhere safe (1Password etc.)
     Key pair ID: $CF_PUBLIC_KEY_ID
     Used to generate signed cookies for protected content.

  3. For Bluesky custom handle — add this DNS TXT record in Route 53:
     Name:  _atproto.$DOMAIN
     Type:  TXT
     Value: \"did=did:plc:xxxxxxxxxxxx\"  ← value from Bluesky Settings → Handle

  4. Add PRIVATE_REPO_TOKEN secret (GitHub PAT with repo scope)
     for the private content repo checkout.

  CloudFront distribution is deploying (~5 min).
  Check status: aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status'
"
