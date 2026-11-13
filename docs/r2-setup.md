# Cloudflare R2 setup (property media)

Status: steps for the founder or engineering. Roadmap item: §14 step 9 and §15 item 8.
Code: `apps/platform/lib/storage.ts`, `apps/platform/lib/env.ts`, `apps/platform/app/api/health/route.ts`.

## Why

Uploads (P1.3) and the Stage 0 deal test need private object storage. The bucket stays private.
Files leave storage only through `/api/media/[...key]`, which checks release state first.
No browser ever receives a storage URL or a write credential.

## 1. Create the bucket

1. Cloudflare dashboard → R2 → **Create bucket**.
2. Name: `orrei-media` (the name in `apps/platform/.env.example`). Keep it private.
3. Do **not** enable public access or a custom public domain on this bucket.
4. No CORS rules are needed. All reads and writes are made by the server.

## 2. Create an API token

1. R2 → **Manage API tokens** → **Create API token**.
2. Permission: **Object Read & Write**.
3. Scope: **Apply to specific buckets only** → `orrei-media`. Do not use an account-wide token.
4. Copy the three values shown once: Access Key ID, Secret Access Key and the account ID (shown on the R2 overview page).

## 3. Set the four variables in Vercel

Project: the ORREI platform project. Environment: **Production** (and Preview if preview deployments must upload).

| Name | Value |
| --- | --- |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Token access key ID |
| `R2_SECRET_ACCESS_KEY` | Token secret |
| `R2_BUCKET` | `orrei-media` |

Mark the secret and key values as **Sensitive**. Do not paste them into chat, logs or commits.

Then redeploy: Vercel reads environment variables at build and deploy time.

## 4. Verify

1. Open `https://orvnlabs.com/api/health` (or the production URL). Expect `"storage": true`.
2. Sign in as an invited operator, open a property, upload one image marked public-eligible
   and one PDF marked private.
3. Open the private file's URL in a signed-out browser. Expect no access.
4. Open the public image's URL. Expect the file.

Record the result in roadmap P1.3 evidence before marking it Verified.

## Troubleshooting

- `storage: false` after redeploy: a variable is missing or misnamed. Check all four names exactly.
- Uploads fail with a 403: the token is not scoped to `orrei-media`, or its permission is read-only.
- The secret was lost: create a new token and replace the old values. The old token can then be revoked.
