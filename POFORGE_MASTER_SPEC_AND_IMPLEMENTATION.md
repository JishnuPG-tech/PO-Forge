# POForge — Master Architecture, UI/UX Design System & Implementation Specification

> **Document Version**: 1.0.0  
> **Status**: Completed & Verified  
> **Repository**: POForge (`d:\Videos\Project`)  
> **Target Examinations**: IBPS RRB PO, IBPS PO, SBI PO, SBI Clerk, RBI Assistant  

---

## 1. Executive Summary & Product Positioning

**POForge** is a serious, academic personal banking exam preparation platform engineered as a continuously adaptive personal coaching system rather than a generic question bank or colorful quiz application.

### Key Architectural & UX Principles:
1. **Editorial & Academic Calm**: Restrained dark-mode visual hierarchy inspired by Linear, Notion, Arc, and well-typeset financial/banking documents.
2. **Accent Discipline**: Warm orange (`#FF7A1A` in dark mode, `#E0630A` in light mode) is restricted to at most **ONE primary action per screen**.
3. **No Saturated Color Washes**: Quiz option cards use border-only feedback states (with explicit `✓` / `✕` icons and color text), avoiding full green/red background floods.
4. **Deliberate Clinical Exam Mode**: Full-length mock exams switch to a 100% clinical grayscale aesthetic (`examMode={true}`) to mirror official examination hall software.
5. **Coach First, Scoreboard Second**: Diagnostics prioritize actionability (e.g. "3 Things to Fix From This Mock") over raw numbers.

---

## 2. Design System & CSS Tokens

### 2.1 CSS Variables (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Dark Mode (Default) — Pitch Black / Warm Orange */
:root,
.dark {
  --bg: #000000;          /* Pitch black base layer */
  --surface: #0D0D0D;     /* Cards sit 1 step above black */
  --surface-2: #161616;   /* Nested & hover surfaces */
  --border: #262626;      /* 1px subtle divider borders */
  --text: #FFFFFF;        /* Primary white text */
  --text-muted: #A3A3A3;  /* Secondary muted text */
  --accent: #FF7A1A;      /* Warm orange (Primary CTAs, active indicators) */
  --accent-soft: #2A1608; /* Faint orange wash for selected states */
  --success: #3FBE73;     /* Verified correct / mastery green */
  --danger: #F25C5C;      /* Incorrect / high-risk red */
  --warning: #E0A64A;     /* Needs attention / decay amber */
}

/* Light Mode — Warm Off-White / Darkened Orange (WCAG AA) */
.light {
  --bg: #FAFAF8;
  --surface: #FFFFFF;
  --surface-2: #F3F2EE;
  --border: #E7E5DF;
  --text: #17181A;
  --text-muted: #6B6E76;
  --accent: #E0630A;
  --accent-soft: #FDEEE1;
  --success: #1E7B4D;
  --danger: #B3261E;
  --warning: #A6650A;
}
```

### 2.2 Typography System

* **Headings (`h1`–`h3`, Hero Numbers, Readiness Labels)**: **Cabinet Grotesk** (Fontshare CDN) with `-0.02em` tracking.
* **Body Copy & Buttons**: **Inter** (`400` / `500` weights).
* **Timers, Scores & Data Figures**: **IBM Plex Mono** with `tabular-nums` formatting.

---

## 3. Component Architecture & UI Primitives (`src/components/ui/`)

| Component | File Path | Key Responsibilities & Rules |
| :--- | :--- | :--- |
| **Button** | [`Button.tsx`](file:///d:/Videos/Project/src/components/ui/Button.tsx) | `primary` (accent fill, max 1/screen), `secondary`, `ghost`, `danger`. `rounded-btn` (10px). |
| **Card** | [`Card.tsx`](file:///d:/Videos/Project/src/components/ui/Card.tsx) | Flat `bg-surface` border-only containers. `variant="mission"` for emphasized cards. `rounded-card` (12px). |
| **OptionCard** | [`OptionCard.tsx`](file:///d:/Videos/Project/src/components/ui/OptionCard.tsx) | Question options. States: `default`, `hover`, `selected` (accent border + accent-soft fill), `correct` (green border + `✓`), `incorrect` (red border + `✕`). Supports `examMode={true}` for grayscale exam hall mode. |
| **StatTile / StatRow** | [`StatTile.tsx`](file:///d:/Videos/Project/src/components/ui/StatTile.tsx) | Connected single-row stat metrics separated by 1px vertical borders (`divide-x divide-border`). No 4-card shadowed grid fallback. |
| **Badge** | [`Badge.tsx`](file:///d:/Videos/Project/src/components/ui/Badge.tsx) | Topic state pills pairing Icon + Label + Color: `🔒 Locked`, `◐ Learning`, `✓ Available`, `↻ Needs Revision`, `✓✓ Mastered`. |
| **Timer** | [`Timer.tsx`](file:///d:/Videos/Project/src/components/ui/Timer.tsx) | Monospaced tabular figures timer. Soft amber text shift when past target time (no flashing or red-panic animations). |
| **ProgressBar** | [`ProgressBar.tsx`](file:///d:/Videos/Project/src/components/ui/ProgressBar.tsx) | Flat 4px/6px horizontal bar chart primitive. Variants: `accent`, `success`, `warning`, `danger`. |
| **Sparkline** | [`Sparkline.tsx`](file:///d:/Videos/Project/src/components/ui/Sparkline.tsx) | Thin SVG trend sparkline chart primitive. |
| **SlideOverPanel** | [`SlideOverPanel.tsx`](file:///d:/Videos/Project/src/components/ui/SlideOverPanel.tsx) | Overlay drawer used for AI Coach (triggered globally via `/` key). |
| **CommandPalette** | [`CommandPalette.tsx`](file:///d:/Videos/Project/src/components/ui/CommandPalette.tsx) | Global keyboard search palette triggered via `⌘K` / `Ctrl+K`. |
| **EmptyState** | [`EmptyState.tsx`](file:///d:/Videos/Project/src/components/ui/EmptyState.tsx) | Dry, functional one-line copy + single CTA for zero-data views. No mascots. |
| **ErrorState** | [`ErrorState.tsx`](file:///d:/Videos/Project/src/components/ui/ErrorState.tsx) | One-line error message + retry CTA. No raw stack traces shown. |
| **Skeleton** | [`Skeleton.tsx`](file:///d:/Videos/Project/src/components/ui/Skeleton.tsx) | Layout-shaped pulse loader primitive matching target component bounds. |

---

## 4. Complete Application Route & Screen Directory

```
src/app/
├── globals.css                       # Global theme tokens, fonts, custom scrollbars
├── layout.next.tsx                   # Root layout, Cabinet Grotesk font integration
├── page.tsx                          # Today / Home Command Center (3 mission states)
├── practice/
│   └── page.tsx                      # 70/30 Desktop Split Question Engine
├── mock/
│   ├── page.tsx                      # Mock Hub (6 tabs: Full, Topic Grid, Sectional, Custom, Adaptive, History)
│   ├── exam/
│   │   └── page.tsx                  # Clinical Exam Mode (Grayscale, examMode={true})
│   └── result/
│       └── page.tsx                  # Mock Result & 3 Things to Fix Coach Block
├── analysis/
│   ├── page.tsx                      # Overview Readiness Meter & 4 Sparkline Trends
│   ├── weakness/
│   │   └── page.tsx                  # Weakness Center (Ranked worst-first cards with [FIX THIS] CTAs)
│   └── topic/
│       └── page.tsx                  # Topic Detail (StatRow, mistake breakdown, action plan)
├── mistakes/
│   └── page.tsx                      # Mistake Book (Category bars & inline detail accordion)
├── revision/
│   └── page.tsx                      # Revision Center (SuperMemo SM-2 Spaced Repetition Queue)
├── current-affairs/
│   ├── page.tsx                      # Daily Finite Capsule Hub
│   └── question/
│       └── page.tsx                  # Current Affairs MCQ Practice
├── library/
│   ├── page.tsx                      # RAG Knowledge Base Document List
│   └── reader/
│       └── page.tsx                  # Two-Pane PDF Reader & Page Inspector
├── coach/
│   └── page.tsx                      # Standalone Hermes AI Coach Page
├── settings/
│   └── page.tsx                      # Two-Pane Settings (Notifications off by default)
├── profile/
│   └── page.tsx                      # User Profile & Secondary Utility Actions
└── notifications/
    └── page.tsx                      # Flat Notification List
```

---

## 5. State Machines & Interactive Workflows

### 5.1 Today Mission Card State Machine (`src/app/page.tsx`)
```
 ┌─────────────────┐
 │   not_started   │ ──► [ Start Today's Mission → ]
 └────────┬────────┘
          │ (User clicks start / answers questions)
          ▼
 ┌─────────────────┐
 │   in_progress   │ ──► Progress Bar (22/90 Qs), Subject counts (Quant 8/25, Reasoning 14/25...)
 └────────┬────────┘
          │ (90 Qs completed)
          ▼
 ┌─────────────────┐
 │    complete     │ ──► Collapses to single line: "✓ Mission complete — 82/100 · 82% accuracy"
 └─────────────────┘     Frees vertical space above the fold!
```

### 5.2 Question Engine 70/30 Layout & Keyboard Controls (`src/app/practice/page.tsx`)
* **Keyboard Listener**:
  * `1` – `5`: Select options A, B, C, D, E
  * `Enter`: Submit selected answer / advance to next question
  * `→`: Next question
  * `M`: Mark / unmark for review
  * `/`: Open global AI Coach slide-over drawer (guarded against input focus)
* **Post-Submit Feedback**: Replaces submit bar inline (no modal, no route navigation).
* **How to Solve Accordion**: Expands inline in place (`CONCEPT`, `APPROACH` steps, `FAST EXAM METHOD`, `COMMON TRAP`).

### 5.3 Shared AI Coach Component (`src/components/coach/CoachPanel.tsx`)
* Shared by both `/coach` page and `GlobalShell` slide-over overlay.
* **Modes**:
  1. `CHAT`: Grounded claims + RAG source citation card (`Quant Notes.pdf · Page 42`).
  2. `WORKING`: Tool-use transparency checklist (`✓ Checking attempts`, `✓ Checking mastery`, `● Searching notes`, `○ Building recommendation`).
  3. `TEACHING`: Interactive lesson (`TEACH: PERCENTAGE`) with inline quick-check MCQ and 4 secondary action buttons (`[ I Understand ]`, `[ Give Another Example ]`, `[ Test Me ]`, `[ Simplify ]`).

---

## 6. Verification Results

| Audit | Method / Command | Result | Status |
| :--- | :--- | :--- | :--- |
| **TypeScript Strict Check** | `npx tsc --noEmit` | **0 errors** | Passed |
| **Dev Server Build** | `npm run dev` | Running on `http://localhost:3000` | Active |
| **Color Tokens** | Pitch Black (`#000000`), Orange (`#FF7A1A`) | Verified globally | Applied |
| **Key Shortcuts** | `1-5`, `Enter`, `→`, `M`, `⌘K`, `/` | All shortcuts functional & input-guarded | Verified |
| **Data Persistence** | `src/lib/persistence.ts` | Uses `localStorage` `poforge_user_data_v1` | Working |

---

## 7. Recommended Next Phase: Data Layer Migration & Ingestion Pipeline

To evolve from client-side prototype/demo content to a durable, multi-month study tool:

1. **SQLite Database Layer (`better-sqlite3` or Supabase)**:
   - Persist user attempt history, exact response times, confidence scores, mistake classifications (`concept_error`, `calculation_error`, `careless`).
   - Store SuperMemo SM-2 interval parameters (`easiness_factor`, `interval`, `repetitions`).
2. **Document Ingestion & Question Bank Pipeline**:
   - PDF document parsing engine for official question papers.
   - OCR for Indian banking exam mathematical symbols and multi-column layouts.
   - Vector embeddings (RAG) for Hermes AI Coach grounding.
