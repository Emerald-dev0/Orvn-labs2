# Mail: Cloudflare receives, Gmail replies, Calder sends the product's mail

Decided 4 November 2026, replacing Google Workspace. Three systems, three jobs:

| Job | System | Record it owns |
| --- | --- | --- |
| Receiving `hello@`, `early@`, `daniel@` | **Cloudflare Email Routing** | `MX` + its SPF include |
| You replying as `hello@` | **Gmail, Send mail as** | SPF include or a relay's DKIM, see §4 |
| The product's mail | **Calder** | its DKIM selector + SPF include |
| Policy | **DMARC** | `_dmarc` |

The one thing to internalise: **Email Routing is receive-only.** There is no mailbox and no SMTP, so
"can I reply as `hello@`" is a separate question with a separate answer (§4).

Step-by-step values, in the order you can obtain them: **[env-setup.md](env-setup.md)**.

---

## 1. Inbound — Cloudflare Email Routing

Cloudflare → `orvnlabs.com` → **Email** → *Email Routing* → enable. Cloudflare writes the MX records
and its SPF record itself; there is nothing to preserve, because you are leaving Workspace.

1. **Destination addresses.** Add the Gmail you actually read. Cloudflare sends it a confirmation link
   — the destination stays inactive until clicked. Nothing routes before that click.
2. **Custom addresses**, each with a rule:

   | Address | Routes to | Used for |
   | --- | --- | --- |
   | `hello@orvnlabs.com` | shared Gmail | the address on the site, deal sheets and invoices |
   | `early@orvnlabs.com` | shared Gmail | `EARLY_ACCESS_INBOX` — queue notifications |
   | `daniel@orvnlabs.com` | your Gmail | you, when a domain address is expected |

3. **One SPF record.** Cloudflare inserts `include:_spf.mx.cloudflare.net`. If an SPF record already
   exists, merge into it — two SPF records is the same as none, receivers use the first and ignore the
   rest.
4. **Check:** `npm run dns:check` — mail host should read *Cloudflare Email Routing*.

### Giving other people access

There are no mailboxes to hand out, so access is per-address:

- **A teammate who needs their own address**: add their email as a **destination** (they confirm it),
  then add a rule `name@orvnlabs.com` → their email. Their copy is separate from yours.
- **A teammate who answers `hello@`**: two options. Route `hello@` to both, so each gets a copy and
  answers independently — fast, but two people can reply to the same message. Or route `hello@` to one
  inbox and give the other person **delegated access to that Gmail** (Gmail → Settings → *Grant access
  to your account*), so there is one record of who answered.
- **Never** forward `hello@` to a shared login password. Cloudflare destination addresses are
  per-person, and that is the audit trail.

Email Routing is free for this, with a generous cap on addresses and rules; the limits that matter are
Cloudflare's, not a mailbox count.

## 2. What goes away

- The five `aspmx.l.google.com` MX records — Cloudflare replaces them when you enable routing.
- `google._domainkey` — delete once routing works. Nothing signs with it any more.
- `resend._domainkey` — delete. Nothing in this product sends through Resend.
- Any `google-site-verification` TXT — keep only if Search Console is in use.

## 3. Sanity test before you trust it

**Inbound** cannot be tested by a script — it needs a real message from outside. Send one from your
phone to `hello@orvnlabs.com` and check the destination inbox. If it does not arrive within a minute,
the destination address was never confirmed (§1, step 1): unconfirmed destinations reject mail rather
than holding it, and the sender sees a bounce.

**Outbound** can be, and should be before an applicant hits it:

```
cd apps/platform
npm run mail:test -- --dry        # are the key, MAIL_FROM and inbox set?
npm run mail:test                 # send one real message to EARLY_ACCESS_INBOX
```

It goes through the same `sendEmail()` seam the site uses, so a pass means the key is valid, the
sender identity is verified and the network is fine. Failures come back named: an unverified identity
reports `sender_not_verified`, a bad key reports `unauthorized`, with the request id to quote.

Then send from Gmail *as* `hello@` to a personal address and read the headers. What you see there
decides §4.

## 4. Outbound — Gmail, Send mail as

Gmail → Settings → **Accounts and Import** → *Send mail as* → **Add another email address**.

### Path A — "Send through Gmail"

Type the name `ORREI` and `hello@orvnlabs.com`, choose *Send through Gmail*, and enter the confirmation
code that arrives at `hello@` (routing forwards it to you).

It works, and it is not authenticated for your domain: Google sends from Gmail's infrastructure, your
SPF does not authorise it, and Gmail does not sign with your domain's key. SPF, DKIM and DMARC
alignment **fail** for `orvnlabs.com` on those messages, Gmail adds a `Sender:` header, and some
clients render "hello@orvnlabs.com via gmail.com".

Consequence: **DMARC stays at `p=none` forever** on this path, because quarantine would start binning
your own replies. Fine while replies are internal; not fine for a first contact with a buyer.

### Path B — "Send through your own SMTP server"

Same screen, different choice. Point it at a relay that lets you verify the domain — Brevo, SMTP2GO or
Resend all do it on a free tier; check their current limits. Publish the DKIM records and SPF include
the relay issues, wait for verified, then paste its SMTP credentials into Gmail.

Now replies are DKIM-signed on `orvnlabs.com`, alignment passes, and `p=quarantine` becomes reachable.
Ten more minutes than Path A, and it is the difference between a domain that looks professional in
headers and one that does not.

## 5. Calder

Calder → **Domains & DNS** → *Add Sending Domain* → **`orvnlabs.com`**, the root, not a subdomain —
the product sends as `hello@orvnlabs.com` and DMARC alignment is judged on the domain in the From.
Publish the records with **proxy off on any CNAME**, then add the **sender identity**
`hello@orvnlabs.com` with display name `ORREI`.

`MAIL_FROM` must match that identity exactly. A From that is not verified is the classic "200 OK,
nothing arrived".

## 6. Order that keeps mail flowing

1. Turn on Email Routing, confirm the destination, add the three addresses.
2. Send in (`npm run mail:test` verifies the way out; a message from your phone verifies the way in).
3. Delete the Google and Resend DKIM records.
4. Configure Gmail *Send mail as* (A now, B before buyer mail).
5. Merge SPF into one record covering Cloudflare, the relay if any, and Calder.
6. Repoint DMARC `rua` at an address that exists — `hello@` is fine now, and reports will forward to
   you.
7. Add the Calder sending domain and identity, then set `MAIL_FROM`.
8. `npm run dns:check -- --expect cloudflare` passes with nothing missing.

### Rollback

Everything here is a DNS record and a Gmail setting. Re-adding Google's MX restores inbound; deleting
the alias in Gmail restores outbound. Nothing is destroyed, but mail routed to Cloudflare while the
destination was unconfirmed is simply rejected — so confirm the destination first, before the switch.

## 7. The four access lists

| Layer | Controlled where | Grants |
| --- | --- | --- |
| Inbound mail | Cloudflare → Email Routing, destination addresses | receiving at an `@orvnlabs.com` address |
| Sending as `hello@` | Gmail *Send mail as*, per Google account | replying as the company |
| Admin queue | `ADMIN_EMAILS` env | seeing and triaging early-access requests |
| Workspace | in-app invitation | owner / editor / viewer on property records |
| Infrastructure | Cloudflare, Neon, Vercel, Calder team screens | DNS, database, deploys, sending domain |

They are independent. Somebody can answer `hello@` and still get a 404 on `/admin`, which is usually
the correct arrangement.
