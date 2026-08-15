# POForge — Personal Study OS
## Complete UI/UX Design Blueprint (v1)

> A solo-use, no-fluff bank exam preparation webapp. Built around one question:
> **"What do I need to do today to get closer to a rank?"**

Benchmarked against Testbook, Oliveboard, Smartkeeda, Adda247 — keeping their
functional strengths (daily quizzes, topic-wise practice, mock analysis,
current affairs capsules, mistake tracking) while stripping every bit of the
noise that makes those apps feel like a marketplace: no ads, no course
upsells, no gamified clutter, no "batch" pressure. This is a private cockpit,
not a coaching platform.

---

## 0. Design Thesis

| They optimize for | You need to optimize for |
|---|---|
| Retention & conversion | Focus & consistency |
| Selling test series | Closing knowledge gaps |
| Social proof (leaderboards, batches) | Self-comparison over time |
| Content volume | Content you actually finish |
| Notifications to bring you back | A UI that respects your streak, not begs for it |

Three words drive every screen: **Calm. Clear. Compounding.**
Calm = low visual noise, generous whitespace, no dopamine-bait animations.
Clear = one primary action per screen, always.
Compounding = every screen should visibly connect to "yesterday" and "tomorrow" — mastery is a line graph, not a badge.

---

## 1. Visual Identity

**Personality:** Editorial + academic + quietly premium — closer to Linear,
Notion, or a well-designed banking dashboard than to a "quiz app."

**Typography**
- Headings: `Söhne` / `General Sans` / fallback `Inter` (600–700 weight)
- Body & data: `Inter` (400–500)
- Numbers/timers/scores: `IBM Plex Mono` or `Geist Mono` — tabular figures, so numbers never jitter when they update
- Base size 16px, 1.5 line-height for reading blocks, 1.2 for UI labels

**Color system (Light)**
```
--bg:          #FAFAF8   (warm off-white, not pure white — reduces eye strain)
--surface:     #FFFFFF
--surface-2:   #F3F2EE
--border:      #E7E5DF
--text:        #17181A
--text-muted:  #6B6E76
--accent:      #1F4B99   (deep academic blue — trust, focus)
--accent-soft: #E9EEF9
--success:     #1E7B4D
--danger:      #B3261E
--warning:     #A6650A
```

**Color system (Dark)**
```
--bg:          #101113
--surface:     #17191C
--surface-2:   #1E2124
--border:      #2A2D31
--text:        #EDEDEE
--text-muted:  #9A9DA6
--accent:      #6E9CF5
--accent-soft: #1B2740
--success:     #4ADE80 (desaturated for eye comfort: #3FBE73)
--danger:      #F27272
--warning:     #E0A64A
```

Rule: **accent color is used for exactly one primary action per screen.**
Everything else stays neutral. Status (correct/incorrect/locked/mastered) is
always paired with an icon/pattern, never color alone.

**Spacing & shape**
- 8px base grid. Card radius 12px. Buttons 10px. No pill-shaped buttons except tags/badges.
- Shadows: almost none in light mode (border-only cards); a single soft `0 1px 3px rgba(0,0,0,.06)` on hover/elevated cards.
- Max content width 1120px desktop; single column ≤ 640px mobile.

**Motion**
- 150–200ms ease-out for all transitions. No bounce, no confetti, no
  particle bursts. The one exception: a single quiet checkmark animation on
  "Mission Complete" (250ms, no sound by default).

---

## 2. Information Architecture

```
/                → Today (home)
/practice        → Question Engine (topic/subject/custom session)
/mock            → Mock tests (topic / sectional / full / adaptive)
/analysis        → Mastery, weaknesses, trends
/mistakes        → Mistake Book
/revision        → Spaced-repetition queue
/current-affairs → Daily/weekly capsules + MCQs
/library         → Notes, PDFs, saved explanations (your RAG corpus)
/coach           → AI chat (Hermes) — always available as a slide-over, not just a tab
/settings        → Exam, targets, theme, data
```

**Primary nav (desktop, left rail — icon + label, collapsible):**
`Today · Practice · Mock · Analysis · Revision · Coach`

**Mobile bottom nav (5 max):**
`Today · Practice · Mock · Analysis · Coach`
(Revision, Current Affairs, Library live one level down, surfaced via Today.)

---

## 3. Global Shell

**Top bar (desktop)**
```
┌──────────────────────────────────────────────────────────────────────┐
│  POForge          [ ⌘K  Search... ]        IBPS RRB PO ▾   🔔   ◐  J │
└──────────────────────────────────────────────────────────────────────┘
```
- `⌘K` opens a command palette (search questions, topics, notes, jump to any
  page) — this replaces a heavy search UI. Fastest path for a solo power user.
- Exam switcher is a dropdown, not a page — you may prep for more than one exam in parallel.
- `◐` = theme toggle. `J` = you (no need for a fake avatar system).

**Mobile top bar:** logo left, streak flame + theme toggle right. No search bar clutter — `⌘K` becomes a floating search icon.

---

## 4. Today (Home) — "What do I do right now"

Single-column stack, most important thing first, nothing below the fold that isn't earned.

```
┌────────────────────────────────────────────────────────────┐
│ Good morning, Jishnu               🔥 12-day streak         │
│ IBPS RRB PO · 43 days left                                  │
└────────────────────────────────────────────────────────────┘

┌──────────────────────── TODAY'S MISSION ─────────────────────┐
│ 90 Qs · ~75 min                                               │
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░  22 / 90                  │
│                                                                │
│  Quant 8/25   Reasoning 14/25   English 0/20   CA 0/20        │
│                                                                │
│                  [ Continue Today's Mission → ]                │
└────────────────────────────────────────────────────────────┘

┌── Streak / Accuracy / Mastery / Days Left ──┐   (4 flat stat tiles, no card shadows)

┌── AI Coach — one line, today only ──────────┐
│ "Profit & Loss dragged your accuracy down    │
│  yesterday. 10-min recovery set ready."      │
│                          [ Start · Ask more ]│
└──────────────────────────────────────────────┘

┌── Revision due (12) ─┐  ┌── 7-day trend (sparkline) ─┐
```

Design rule: **the Mission card is the only thing with a filled/emphasized
background.** Everything else is neutral so the eye always lands on "what to
do next" first.

States:
- Not started → `Start Today's Mission`
- In progress → `Continue Today's Mission` (progress bar fills, subject
  chips show live counts)
- Done → card collapses to a single success line + `View Analysis`, freeing
  vertical space for revision/trend instead of hogging the top forever.

---

## 5. Question Engine — the core loop, must feel instant

**Layout (desktop): 70/30 split — question | palette**
```
┌──────────────────────────────────────────┬───────────────┐
│ Quant · Profit & Loss     Q 12/25   00:42 │  PALETTE      │
│                                            │  ● ● ○ ! ○    │
│  A shopkeeper marks an article 40% above  │  ○ ○ ○ ● ●    │
│  cost price and allows a discount of 15%. │  ...          │
│  Find his profit percent.                 │               │
│                                            │  ● answered   │
│  ○ A. 15%     ○ B. 18%    ○ C. 19%        │  ○ unvisited  │
│  ○ D. 21%     ○ E. None of these          │  ! marked     │
│                                            │               │
├────────────────────────────────────────────┴───────────────┤
│  ← Previous     Mark for review     Skip      [ Submit → ]  │
└───────────────────────────────────────────────────────────┘
```
- Timer top-right, monospaced, turns amber (never red-panic-flash) past target time, never plays a sound.
- Option cards: full-width, generous 16px padding, radio indicator left-aligned. Selected state = accent border + accent-soft fill, not a color swap of the whole card (keeps contrast calm).
- Keyboard-first: `1-5` selects option, `Enter` submits, `→` next, `M` marks for review. This matters — you're a dev, use it.

**Post-submit feedback (inline, not a separate page)**
```
✓ Correct · 38s (target 45s)                     [ Next → ]
```
or
```
✕ Incorrect · Your answer B · Correct answer D
Mistake type: Concept error
[ How to solve ]   [ Try similar ]                [ Next → ]
```
"How to solve" expands inline (accordion), never modal — keeps flow state, no context switch.

**Mobile:** single column, sticky mini-header (subject · Q count · timer),
palette becomes a bottom drawer accessible by swiping up or a small "12/25"
pill tap.

---

## 6. Mock Tests

Tabs: `Topic · Sectional · Full Length · Adaptive · History`

- Topic/Sectional mocks: dense grid cards — topic name, question count, your best score, a tiny trend arrow, one button.
- Full mock: exam-replica layout — real IBPS-style palette + sections, deliberately more "serious/clinical" than practice mode (no accent color, plain grayscale UI, exam timer prominent) — this trains you for actual exam visual conditions, a trick Testbook/Oliveboard under-invest in.
- Adaptive mock: shows current ability score (IRT-style, e.g. θ=74) and lets difficulty float — one clean stat block, not overexplained.
- Result screen: score, accuracy, sectional split, then **immediately** a "3 things to fix" list generated from this mock — not just a scoreboard. This is what makes it a coach, not a scoreboard app like most competitors.

---

## 7. Analysis — "What should I fix"

Order matters, top to bottom = most actionable first:

1. **Readiness meter** — one hero stat (Foundation → Developing → Competitive → Strong → Exam Ready) as a horizontal bar, not a gimmicky gauge/dial.
2. **Weakness Center** — ranked list, worst first, each with a single `Fix this` CTA that launches a targeted 10-question set. This is the money screen — spend the most design effort here.
3. Subject/topic mastery table — sortable, compact, no chart overload.
4. Trends — 4 small sparkline charts (accuracy, speed, mock score, consistency), togglable 7D/30D/90D/All. Use one consistent chart style everywhere (thin line, single accent color, no gradient fills, no 3D).

---

## 8. Mistake Book & Revision

- Mistake Book: filterable by mistake type (Concept / Calculation / Careless / Time pressure / Misread), each entry expandable to full "why + how to solve + remember" without leaving the list (accordion, not navigation).
- Revision: spaced-repetition queue, dead simple — `Due today / Upcoming / Recovered`. No streak-shaming copy; just facts and a single start button.

---

## 9. AI Coach (Hermes)

- Lives as a **slide-over panel** reachable from anywhere (keyboard shortcut `/`), not only a standalone page — because you'll want to ask "why did I get this wrong" mid-question, not after navigating away.
- Quick actions as a static left rail inside the panel: `Explain my mistakes · Teach a topic · Practice with me · Analyze performance · Search my notes · Plan tomorrow`.
- Tool-use transparency: subtle checklist ("✓ checked recent attempts · ● searching notes") — never raw logs, never a spinner with no context.
- Every data-grounded claim shows a tiny `Based on 43 attempts · 68% accuracy` footer — earns trust without needing a citation modal.
- RAG source cards: title + page + `Open source` — flat, no extra chrome.

---

## 10. Current Affairs & Library

- CA: date-grouped capsule cards, `Read` and `Practice MCQs` as two flat buttons — treat this like a daily newspaper section, not a feed to doomscroll (no infinite scroll; today's capsule is complete and finite).
- Library: your notes/PDFs as a simple list with an "Indexed ✓" tag once RAG-ingested, `Ask AI` action per document.

---

## 11. Empty / Loading / Error States

Keep these dry and functional — not cutesy illustrations, since this is a personal tool:
```
No mistakes yet.  Complete a session to start your Mistake Book.  [Start Practice]
No mocks yet.     Take your first mock to build a performance baseline.  [Take Mock]
```
Loading = skeleton blocks matching final layout shape, never a spinner-only screen.
Errors = one line, plain language, one retry action. Never a stack trace, never blame the user.

---

## 12. Component System (build order for implementation)

1. Design tokens (colors, spacing, radius, type scale) as CSS variables
2. `Button` (primary/secondary/ghost), `Card` (flat/elevated), `ProgressBar`, `StatTile`
3. `OptionCard` (default/hover/selected/correct/incorrect)
4. `Badge`/`StatusPill` (mastered/learning/locked/needs-revision — icon-coded)
5. `Timer` (monospaced, calm color escalation)
6. `Sparkline` chart primitive (reused across Home/Analysis)
7. `CommandPalette` (⌘K)
8. `SlideOverPanel` (used by Coach + How-to-Solve + Filters)
9. `Skeleton` variants per page

**Suggested stack:** React + Tailwind (tokens above as CSS vars, mapped into
Tailwind theme) + shadcn/ui for primitives + Recharts for sparklines/trend
charts + Framer Motion only for the handful of approved micro-interactions
(page/question transitions, mission-complete checkmark).

---

## 13. Non-Negotiable UX Rules

1. One primary CTA per screen — always.
2. Status is never color-only (icon + label + color).
3. No page should require more than 2 taps to reach the Question Engine.
4. The daily Mission card is always the first thing you see on Home.
5. Dark mode is default (you build/study at night) — professional, not neon.
6. Nothing auto-plays sound. Ever.
7. Every analysis screen ends with an action button, never just a chart.

---

## 14. What NOT to copy from Testbook/Oliveboard/Smartkeeda

- No course marketplace shelves, no "batches," no price tags anywhere.
- No leaderboards or social comparison — this is single-player.
- No push-notification spam patterns — one calm daily reminder, user-configurable, off by default.
- No gamified badges/coins/streako-mascots — the streak number itself is the only game element, kept small and quiet.
