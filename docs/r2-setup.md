# Cloudflare R2 setup (property media)

Roadmap: §14 step 9 and §15 item 8. Code: `apps/platform/lib/storage.ts`, `lib/env.ts`, `app/api/health/route.ts`, `app/api/media/[...key]/route.ts`.

Dashboard labels can change slightly. If a label differs, look for the nearest match and tell the engineer.

## What this sets up

- One **private** R2 bucket for property files.
- One **API token** that can read, write and delete objects in that bucket only.
- Four variables in Vercel that the server uses to sign requests.

The browser never gets a storage URL or a write key. Files leave storage only through `/api/media/...`, which checks release state first. The token needs Object Read & Write because the code uses GET, PUT and DELETE (`lib/storage.ts`).

Nothing in this guide needs to go in Git. Do not paste the secret in chat, a commit, a ticket or a screenshot.

---

## Part 1: Create the bucket (Cloudflare)

1. Sign in at https://dash.cloudflare.com with the account that will own ORREI media.
2. In the left menu, click **R2 Object Storage**. If you see a plan prompt, accept the free R2 plan.
3. Click **Create bucket**.
4. **Bucket name:** `orrei-media`. Rules: lowercase letters, numbers and hyphens only. This must match `R2_BUCKET` in Part 3.
5. **Location:** leave as automatic (default) unless you have a reason to choose one.
6. **Storage class:** Standard.
7. Click **Create bucket**.
8. Open the bucket → **Settings**.
9. Check that **Public access** is **Disabled** (the R2.dev subdomain is off and no custom domain is attached). If it is on, turn it off.
10. Do not add a CORS rule. All reads and writes are made by the server, not by a browser.

**Check:** the bucket appears in the list, and its Public access shows Disabled.

---

## Part 2: Create the API token and note the account ID

### 2a. Find the account ID

1. Go to **R2 Object Storage** → **Overview**.
2. On the right side, find **Account Details**. Copy the **Account ID**. It is a 32-character string.
3. Keep it open. You will paste it into Vercel in Part 3.

### 2b. Create the token

1. On the R2 Overview page, click **Manage API tokens** (or **API** → **Manage API tokens**, depending on layout).
2. Click **Create API token**.
3. **Token name:** `orrei-media-platform` (any name is fine; use the same name every time).
4. **Permissions:** choose **Object Read & Write**. Do not choose Admin, and do not choose Object Read only.
5. **Bucket scope:** choose **Apply to specific buckets only**, then tick `orrei-media`. Do not leave it on all buckets.
6. **TTL:** Forever, unless the team wants a rotation date. If you set an expiry, put a reminder in the calendar to rotate before it.
7. Click **Create API token**.

### 2c. Copy the three values (shown once)

The results page shows:

- **Access Key ID** → this is `R2_ACCESS_KEY_ID`
- **Secret Access Key** → this is `R2_SECRET_ACCESS_KEY`
- **Endpoint / jurisdiction URL** (it looks like `https://<account-id>.r2.cloudflarestorage.com`). You do not need to paste it. The code builds this URL from the account ID.

Copy the Access Key ID and the Secret Access Key now, into a password manager. If you close the page without copying the secret, you cannot see it again. Create a new token and replace the values (Part 4).

**Check:** you have the Account ID, the Access Key ID and the Secret Access Key, and they are in a password manager, not a chat or file.

---

## Part 3: Set the four variables in Vercel

Do this on the ORREI **platform** project (not the Calder or other projects).

1. Open https://vercel.com and select the team that owns the platform project. Open the project.
2. Go to **Settings** → **Environment Variables**.
3. Add each variable below. For each one:
   - **Key:** exactly as shown, case-sensitive.
   - **Value:** paste it.
   - **Environments:** tick **Production**. Tick **Preview** only if preview deployments must upload test files. Leave **Development** off unless someone runs `vercel dev` with real storage.
   - **Sensitive:** tick the option that hides the value after saving (labelled Sensitive, or choose the sensitive type where offered). Do this for the secret. It is good practice for the key ID too.

| Key | Value | Sensitive? |
| --- | --- | --- |
| `R2_ACCOUNT_ID` | the 32-character account ID | yes |
| `R2_ACCESS_KEY_ID` | the token's Access Key ID | yes |
| `R2_SECRET_ACCESS_KEY` | the token's Secret Access Key | yes (required) |
| `R2_BUCKET` | `orrei-media` | no |

4. Click **Save** after each one, or save all at once.
5. Check the list: four `R2_*` names, each showing the environments you chose.

**Check for typos:** the names must match exactly. A missing `R2_` prefix or a space at the end of a value will show `storage: false`.

### Redeploy

Vercel only reads new variables when a deployment is built.

1. Go to the project's **Deployments** tab.
2. Open the latest **Production** deployment, click the **⋯** menu, then **Redeploy**.
3. Leave **Use existing Build Cache** on, then click **Redeploy**.
4. Wait for the status to show **Ready**.

---

## Part 4: Verify

### 4a. Health check

1. Open `https://orvnlabs.com/api/health` in a browser.
2. Expect JSON with `"storage": true`.
3. If it shows `false`: go back to Part 3, check the four names and that Production was ticked, then redeploy again.

### 4b. Upload check (needs an invited operator account)

1. Sign in as an invited operator.
2. Open or create a property.
3. Upload one **image** and mark it public-eligible.
4. Upload one **PDF** and mark it private.
5. Confirm both appear on the property page with their status.

### 4c. Access check

1. Open a private browser window (signed out).
2. Try the private PDF's address. Expect **no access**.
3. Try the public image's address. Expect the image.

### 4d. Record the evidence

Write the date, the health result, and the screenshots from 4a–4c into the P1.3 evidence in `docs/ROADMAP.md`. Only then mark P1.3 Verified.

---

## Part 5: Rotate or replace the token

Use this if the secret was lost, pasted somewhere it should not be, or the token expires.

1. In Cloudflare, go to R2 → Manage API tokens. Create a new token exactly as in Part 2b.
2. In Vercel, edit the three values (`R2_ACCOUNT_ID` stays the same). Save.
3. Redeploy (Part 3).
4. Run the health check and one upload.
5. Back in Cloudflare, revoke the old token.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `/api/health` shows `storage: false` | A variable is missing, misspelled or not on Production | Check the four names; redeploy |
| Upload fails with an access error | Token scope is wrong, or the token is read-only | Recreate with Object Read & Write, scoped to `orrei-media` |
| Private file opens while signed out | Code or route problem, not R2 settings | Stop testing. Report it as a P0 security defect |
| Public image does not load | Route or release state, not R2 | Check the property is published and the file is public-eligible |
| Secret not visible in Cloudflare | It is only shown once | Rotate (Part 5) |
