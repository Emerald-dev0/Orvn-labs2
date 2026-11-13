// Blog data — static, file-based. No CMS dependency.
//
// To add a post: add a new object to POSTS with a unique `slug`.
// The body is plain markdown-lite (paragraphs separated by blank lines, headings prefixed with
// `## `, and bullets prefixed with `- `). The renderer in pages/BlogPost.jsx handles it.
//
// All posts should have a clear conversion arc — every body ends with a CTA pointing to one of:
//   - /calculators/leakage   (run leakage score)
//   - /blog (newsletter signup is handled by the post page itself)

export const CATEGORIES = [
  'First-contact infrastructure',
  'Lead leakage',
  'CRM graveyards',
  'ISA operations',
  'Agent handoff',
  'After-hours leads',
  'Brokerage intelligence',
  'PAS build notes',
];

export const POSTS = [
  {
    slug: 'why-real-estate-leads-go-cold',
    title: 'Why real estate leads go cold before agents call',
    excerpt:
      'The window between inquiry and first contact is where most brokerage revenue dies. The fix is not faster agents — it is a different operating layer.',
    category: 'Lead leakage',
    date: '2026-04-14',
    readMinutes: 6,
    body: `## The cold lead is rarely a bad lead

When a brokerage describes a "cold lead," the diagnosis is almost always wrong. The lead was warm at the moment they raised their hand. What happened next determined whether they stayed warm.

Three things tend to happen between inquiry and first contact:

- The response is delayed past the intent window.
- The response is generic and does not engage real intent.
- The response never books a next step.

Each of those failures is operational, not motivational. You cannot solve them by reminding the team to be faster.

## Why "speed-to-lead" misses the point

Speed alone is not the whole story. A 30-second response that asks "Hey, are you still looking?" is not better than a 5-minute response that captures budget, timeline, and books an appointment.

The right framing is **first-contact infrastructure**: the operating layer that controls what happens immediately after intent. It needs to do five things, every time, in writing:

- Answer fast enough to land before the lead moves on.
- Qualify intent — is this a real buyer, what stage, what timeline.
- Capture budget and timeline.
- Route or book — never leave a qualified lead un-actioned.
- Log the outcome so reports reflect reality.

When any one of those breaks, the lead goes cold. Most brokerages have one or two working and three or four broken.

## What to do this week

Run a five-minute audit. Pick ten leads from the last 30 days. For each one, write down: how long until first response, what was asked, what was captured, what was booked, what is the current status. You will find at least one of the five movements failing on most rows.

Then decide whether to fix it with people or with infrastructure. Both work. Only one scales.`,
  },
  {
    slug: 'first-contact-audit',
    title: 'The first-contact audit every brokerage should run',
    excerpt:
      'Ten leads, five questions, twenty minutes. The smallest, fastest diagnostic of how much money your brokerage is leaking before a deal is even on the table.',
    category: 'First-contact infrastructure',
    date: '2026-04-07',
    readMinutes: 5,
    body: `## What the audit is

Pick the ten most recent inbound leads. For each one, answer five questions:

- Time from inquiry to first human response.
- Was budget or timeline captured in writing.
- Was the lead routed to a specific named agent.
- Is there an appointment on a calendar.
- What does the CRM status field say, and is it accurate.

That is the audit. Twenty minutes, no tooling required.

## What you will find

In every brokerage we have run this with, three patterns repeat:

- A response time that varies wildly between leads. Average looks fine. Worst-case is a disaster.
- Status fields that do not match what actually happened. "Contacted" hides everything from "left voicemail" to "had a 20-minute conversation."
- Almost no booked appointments tied to the inquiry record.

Each gap is a leak. Each leak is recoverable.

## What to do with the result

Take the worst row. Find the operational failure that caused it. Decide whether the fix is process, headcount, or infrastructure. Fix that one row before you generalize.

Most brokerages skip the audit because the result feels obvious. It is not. The numbers are usually worse than the gut estimate, and the bottleneck is rarely where the owner thinks it is.`,
  },
  {
    slug: 'contacted-is-dirty-data',
    title: 'Why "contacted" is dirty data inside real estate CRMs',
    excerpt:
      'A status field that means anything means nothing. The single highest-leverage CRM hygiene change is making "contacted" answer four sub-questions, not one.',
    category: 'CRM graveyards',
    date: '2026-03-31',
    readMinutes: 4,
    body: `## The status field problem

"Contacted" is the most dangerous status in a real estate CRM. It can mean:

- Left a voicemail.
- Sent a templated text.
- Had a five-minute conversation, captured nothing.
- Had a real qualifying conversation.
- Already booked an appointment.

When one tag covers all five, the dashboard shows a number that does not correspond to a business reality.

## The fix is structural, not behavioral

Telling the team to "be more accurate" does not work. The fix is making the status field unable to lie. That means tying status to events, not to subjective judgment.

A status that says "qualified — budget and timeline captured, agent assigned" is true or false. A status that says "contacted" is neither.

This is exactly what first-contact infrastructure produces as a side effect: the conversation creates structured data, the data sets the status, the dashboard reflects what happened.

## What to look for in your CRM today

Run a quick check. How many leads in your CRM are sitting in "contacted" or "follow up" stages and have been there for more than 14 days. That is your graveyard. Most of those leads were never qualified, never routed, never booked. The data does not say so because the field is too coarse.

Recovering even ten percent of a 12-month-old graveyard is usually worth more than a quarter of net new lead spend.`,
  },
  {
    slug: 'speed-to-lead-is-a-conversion-event',
    title: 'Speed-to-lead is not a productivity metric. It is a conversion event.',
    excerpt:
      'Most brokerages track speed-to-lead as a team-performance KPI. That framing hides the real cost. Speed-to-lead is the moment intent either survives or dies.',
    category: 'Lead leakage',
    date: '2026-03-24',
    readMinutes: 5,
    body: `## The KPI framing problem

When speed-to-lead is filed under "team performance," it gets the same treatment as call volume or task completion. It is monitored, occasionally praised, occasionally criticized. Nothing structural changes.

The right framing is different. Speed-to-lead is a **conversion event**: the single moment where intent either carries forward or evaporates. It is not a measure of effort. It is a measure of whether the operating layer caught the lead in time.

## Why the "5-minute rule" survives

The reason the well-known "respond within 5 minutes" rule has survived a decade of changing tooling is that it tracks a real psychological phenomenon. After five to ten minutes, the lead has moved to the next thing — another listing, another agent, another tab. They are no longer the same lead.

This is not about hustling harder. It is about whether your first-contact layer fires before the intent window closes.

## What to do about it

Stop tracking average speed-to-lead. Track the percentage of inbound leads that received a substantive first response within ten minutes. Substantive means it asked at least one qualifying question and offered at least one next step.

Most brokerages will find that number is in single digits. The fix is the same as the rest: either grow the team to cover the gap, or install a layer that closes it automatically.`,
  },
  {
    slug: 'after-hours-cost',
    title: 'The hidden cost of after-hours leads',
    excerpt:
      'Inquiries that arrive after 7pm and before 9am are usually a brokerage’s highest-intent leads — and the ones most likely to leak. Here is why, and what to do.',
    category: 'After-hours leads',
    date: '2026-03-17',
    readMinutes: 4,
    body: `## After-hours intent is selected, not random

A lead that fills out a form at 11pm is not a passive lead. They were on Zillow at 11pm, on your site at 11pm, and motivated enough to type their phone number into a box. That is the highest-intent population a brokerage sees.

It is also the population most likely to vanish before any human responds.

## Why the leak is so large

Three things happen to after-hours leads at most brokerages:

- Voicemail catches the call. Nobody returns it before 10am.
- A web-form submission lands in an inbox that nobody checks until morning.
- An auto-reply email is sent that does not qualify or book anything.

By 9am the lead has moved on. The reply, when it arrives, lands cold.

## What working infrastructure looks like

A first-contact layer that handles after-hours intent does three things:

- Responds in writing, in conversation, within seconds.
- Qualifies and books for the next available agent slot.
- Logs the conversation so the agent has full context the next morning.

That is exactly what PAS controls. The point is not "AI does it." The point is that the operating layer never sleeps, so intent is never lost to the calendar.`,
  },
];

export const getAllPosts = () =>
  [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

export const getRecentPosts = (n = 3) => getAllPosts().slice(0, n);

export const getPost = (slug) => POSTS.find((p) => p.slug === slug) || null;

export const getRelatedPosts = (slug, n = 3) =>
  getAllPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, n);
