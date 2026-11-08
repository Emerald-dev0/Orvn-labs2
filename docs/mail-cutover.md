# Mail cutover, and who gets access to what

Decided 4 November 2026: **Zoho Mail** for `orvnlabs.com`, replacing Google Workspace. This is the
order to do it in, plus the part people forget — who gets a mailbox, who gets into the admin queue,
and who can touch the infrastructure. They are four different lists and they are not the same people.

---

## 1. Before touching DNS

- [ ] Record the baseline: `cd apps/platform && npm run dns:check` — save the output.
- [ ] Confirm `hello@orvnlabs.com` receives today. If it does not, nothing is lost by rushing.
- [ ] Decide the addresses (§2). You get **five mailboxes on the free tier**, not five attempts: a
      sixth user moves the whole account onto a paid plan.
- [ ] Lower the TTL on the five existing Google MX records to **300** and wait an hour.

## 2. Addresses

| Address | Kind | Who reads it |
| --- | --- | --- |
| `daniel@orvnlabs.com` | mailbox, super admin | you |
| `hello@orvnlabs.com` | mailbox or group | whoever answers the site |
| `early@orvnlabs.com` | alias or group | the same person, or both |
| `legal@orvnlabs.com` | alias | optional, receives only |

Aliases do not consume a mailbox; groups do not either. Use them before you use up a slot.

`EARLY_ACCESS_INBOX` points at `early@orvnlabs.com` (or `hello@`). If it is a **group with two
members**, both people get the queue notification — that is the point of a group.

## 3. The cutover

1. **Create the Zoho account** with the free plan, add `orvnlabs.com`, verify with the TXT record.
2. **Create the mailboxes and aliases** from §2.
3. **Publish Zoho's DKIM** (`zmail._domainkey`) and confirm it resolves before going further:
   `npm run dns:check` should list it.
4. **Switch the MX**: delete all five `aspmx.l.google.com` records, add Zoho's three —
   `mx.zoho.com` 10, `mx2.zoho.com` 20, `mx3.zoho.com` 50. Copy the exact values Zoho prints; a
   `.eu` or `.in` account uses regional hosts and the wrong ones will accept mail then drop it.
5. **Test in both directions.** Personal Gmail → `hello@`; reply from Zoho → back. Check headers say
   `spf=pass`, `dkim=pass`, `dmarc=pass`.
6. **Remove the Google records** only now: `google._domainkey`, and the `google-site-verification`
   TXT entries if Search Console is not in use.
7. **Delete `resend._domainkey`.** Nothing here sends through Resend.
8. **Add SPF**, once:
   ```
   orvnlabs.com   TXT   "v=spf1 include:zoho.com include:<calder's include> ~all"
   ```
   Use the include Zoho prints (regional accounts differ). Keep it even though Zoho only sends your
   replies — replies are your mail.
9. **Repoint DMARC reporting** at a mailbox that still exists, e.g.
   `rua=mailto:hello@orvnlabs.com`. Reports to a dead address bounce, which looks like coverage
   without being any.
10. **Add the Calder sending domain** (`orvnlabs.com`, root) and publish its DKIM, proxy off.
11. **Finish**: `npm run dns:check -- --expect zoho` must pass with nothing missing.

### Rollback

If Zoho goes wrong at step 4, put the five Google MX records back and restore their TTL. Mail that
arrived at Zoho in the meantime is still in Zoho — nothing is destroyed by switching back, but
anything sent to Zoho and not yet collected is not visible at Google. Do step 5 before deleting
anything at step 6, and the rollback stays cheap.

---

## 4. Giving other people access

### 4.1 A mailbox

Zoho Admin Console → **Users** → *Add User*. Two ways, and the difference matters:

- **Invite**: Zoho emails the person a link; they set their own password. Use this.
- **Create with a password**: only when you must hand over credentials in person, and force a change
  at first sign-in.

Rules worth holding to:

- **Never share one mailbox between two people.** Every message then has the same author, and nobody
  can tell who answered. Two people who both need `hello@` get a **group** addressed to `hello@` and
  their own mailbox behind it.
- **Keep exactly one super admin**, plus one other admin who can recover the account. Losing the only
  super admin is the failure mode that ends a domain.
- **2FA on the super admin**, and on anyone who can change DNS-adjacent settings.
- The free tier has **no IMAP/POP**, so every teammate reads mail in `mail.zoho.com` or the Zoho app.
  Tell them that on day one, or they will try Apple Mail and conclude the account is broken.

### 4.2 The product's admin queue

A Zoho mailbox does **not** grant access to `/admin/early-access`. That gate is `ADMIN_EMAILS` in the
deployment environment — a comma-separated list of addresses, checked on every request:

```
ADMIN_EMAILS=daniel@orvnlabs.com,ops@orvnlabs.com
```

Anybody not on the list gets a 404, even with a valid session. Changing it is a redeploy, which is
deliberate: the list is small and rarely changes.

### 4.3 A workspace

People who work on properties get a workspace invitation, not a mailbox: owner, editor or viewer. A
viewer can read the record and cannot change visibility or draft. Invitations are issued with
`npm run invite --email …`, and the queue offers the command to copy.

### 4.4 Infrastructure

Cloudflare, Neon, Vercel and Calder each have their own team/member screens. They are not connected
to Zoho or to the app. Give the narrowest role each provider offers — and never to a shared login.

---

## 5. The four access lists, side by side

| Layer | Controlled in | Grants |
| --- | --- | --- |
| Mailbox | Zoho Admin Console | reading and sending `@orvnlabs.com` |
| Admin queue | `ADMIN_EMAILS` env | seeing and triaging early-access requests |
| Workspace | in-app invitation | owner / editor / viewer on property records |
| Infrastructure | each provider | DNS, database, deploys, sending domain |

Someone can have the first and not the second, and usually should.
