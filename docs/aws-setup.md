# AWS Setup

One-time infrastructure setup for theTube. The GitHub Actions deploy assumes this is already in place.

---

## S3 Bucket

1. Create a private S3 bucket (e.g. `thetube-today`)
2. **Block all public access** — CloudFront is the only entry point
3. Enable versioning (optional but useful for rollback)

### Bucket policy — allow CloudFront only

Attach this policy to the bucket, replacing `<DISTRIBUTION_ARN>` and `<BUCKET_NAME>`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<BUCKET_NAME>/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "<DISTRIBUTION_ARN>"
        }
      }
    }
  ]
}
```

---

## CloudFront Distribution

1. Create a distribution with the S3 bucket as origin
2. Use **Origin Access Control (OAC)** — not the legacy OAI
3. Set default root object: `index.html`
4. Enable custom error pages: 404 → `/404.html`, 403 → `/404.html`

### Behaviors

| Path pattern   | Cache policy     | Signed cookies required | Notes                        |
| -------------- | ---------------- | ----------------------- | ---------------------------- |
| `default (*)`  | CachingOptimized | No                      | All public content           |
| `/protected/*` | CachingDisabled  | Yes                     | Role-gated assets and images |
| `/_indexes/*`  | CachingDisabled  | Role-dependent          | Role-based JSON index files  |

#### Setting up signed cookies on `/protected/*`

1. Create a **CloudFront key group** with a public key
2. Store the private key securely (not in any repo)
3. Edit the `/protected/*` behavior → Restrict viewer access → Yes → key group

The private key is used server-side (or locally via CLI) to generate signed cookies distributed to authorized visitors.

---

## Role-based Index Files

Role-gated index files live under `/_indexes/`:

| File                     | Audience     | Access                 |
| ------------------------ | ------------ | ---------------------- |
| `/_indexes/public.json`  | Everyone     | Public                 |
| `/_indexes/kids.json`    | Kids role    | Signed cookie required |
| `/_indexes/friends.json` | Friends role | Signed cookie required |

Set `/protected/*` and `/_indexes/kids.json`, `/_indexes/friends.json` behaviors to require signed cookies.

> **Note:** Role-based index files are a planned feature — not yet implemented.

---

## IAM — GitHub Actions Deploy User

Create an IAM user (or role) for GitHub Actions with least-privilege permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::<BUCKET_NAME>", "arn:aws:s3:::<BUCKET_NAME>/*"]
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

### GitHub Actions secrets required

| Secret                       | Value                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| `AWS_ACCESS_KEY_ID`          | IAM user access key                                                      |
| `AWS_SECRET_ACCESS_KEY`      | IAM user secret key                                                      |
| `AWS_REGION`                 | e.g. `us-east-1`                                                         |
| `S3_BUCKET`                  | Bucket name                                                              |
| `CLOUDFRONT_DISTRIBUTION_ID` | Distribution ID                                                          |
| `PRIVATE_REPO_TOKEN`         | GitHub PAT with `repo` scope — for checking out the private content repo |

---

## DNS (Route 53)

1. Create a hosted zone for `thetube.today`
2. Add an `A` record aliased to the CloudFront distribution
3. Add `AAAA` record for IPv6 (same alias target)
4. For Bluesky custom handle — add TXT record:
   ```
   _atproto.thetube.today  TXT  "did=did:plc:xxxxxxxxxxxx"
   ```
   Value provided by Bluesky Settings → Handle → "I have my own domain"

---

## CloudFront Signed Cookie — generating for a visitor

To grant a visitor access to a role (e.g. `kids`), generate a signed cookie locally and share it via a link:

```bash
aws cloudfront sign \
  --url "https://thetube.today/protected/*" \
  --key-pair-id <KEY_PAIR_ID> \
  --private-key file://cloudfront-private-key.pem \
  --date-less-than "2027-01-01"
```

The recipient bookmarks a URL that sets the cookie. Until it expires they can see protected content.

> The private key (`cloudfront-private-key.pem`) must never be committed to any repo.
