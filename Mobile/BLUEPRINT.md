# POForge — Hermes-First Android Coach (Conduit Fork Edition)
## Master Architecture, Design & Build Blueprint

---

## 0. WHAT CONDUIT ACTUALLY IS, AND HOW WE'RE USING IT

Conduit (cogwheel0/conduit) is a native Flutter (iOS + Android) chat
client, GPL-3.0, that supports three connection modes: Open WebUI, direct
OpenAI-compatible/Ollama/OpenRouter endpoints, and a specific self-hosted
"Hermes Agent" protocol of its own design. **Its "Hermes Agent" mode is
not your Hermes backend** — it's a different, unrelated protocol that
happens to share a name. We are not "connecting" to it; we are **forking
its client codebase** and replacing its networking/protocol layer with
calls to your actual FastAPI backend.

### What we keep from Conduit (the valuable part)
- Native Flutter chat shell: message thread rendering, streaming text,
  markdown, conversation history/search, secure credential storage,
  light/dark/system theming infrastructure.
- **Live tool-execution visibility UI** — Conduit already renders "the
  agent is using a tool" states with approval-before-sensitive-steps
  gating. This is architecturally the same concept as your `ToolCallCard`
  pending-confirmation pattern, already built and proven on
  `update_mission_config`. We adapt Conduit's existing widget for this
  rather than building one from scratch in Flutter.
- Voice input, file/image upload scaffolding — reusable later for things
  like "photograph a question from a physical book and ask Hermes about
  it," not required for v1 but useful groundwork already present.
- Native Android packaging pipeline already solved (Flutter → APK/AAB) —
  this alone saves the TWA/Capacitor decision entirely.

### What we strip out entirely
- Open WebUI connection mode and its auth flows (LDAP/SSO/proxy login) —
  irrelevant, you have one backend, one user.
- Direct OpenAI-compatible/Ollama/OpenRouter connection profiles — same
  reason, not needed.
- Conduit's own "Hermes Agent" protocol client code (the specific
  `API_SERVER_KEY` handshake, its scheduling contract) — replaced
  entirely with calls to your real backend's actual API.

### What we build new, on top of the forked shell
- A **POForge API adapter layer** replacing Conduit's networking code —
  talks to your FastAPI backend's real endpoints
  (`/hermes/chat`, `/missions/*`, `/analytics/*`, tool-call results),
  using your existing JWT auth, not Conduit's original auth flows.
- The **structured widget family** from the prior plan
  (`PracticeQuestionCard`, `SessionProgressCard`, `MockSessionCard`,
  `AnalysisSnapshotCard`, `ToolCallCard`) — implemented as new Flutter
  widgets rendered inline in Conduit's existing message-list architecture,
  in the same visual system as your web app (pitch black, orange accent,
  Clash Display headings — ported to Flutter theming, not re-invented).

---

## 1. ARCHITECTURE

```
┌───────────────────────────────────────────────────────────────┐
│  ANDROID APP — Forked Conduit (Flutter)                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ RETAINED FROM CONDUIT                                     │  │
│  │  - Chat thread renderer, streaming, markdown               │  │
│  │  - Tool-execution visibility + approval-gate widget        │  │
│  │  - Conversation history, search, secure storage             │  │
│  │  - Theming engine (retheme to POForge design tokens)        │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ NEW: POFORGE API ADAPTER (replaces Conduit's networking)   │  │
│  │  - JWT auth against YOUR backend                            │  │
│  │  - Maps to real endpoints: /hermes/chat, /missions/*,       │  │
│  │    /analytics/performance, tool-call submit/confirm          │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ NEW: STRUCTURED WIDGET FAMILY                                │  │
│  │  PracticeQuestionCard · SessionProgressCard ·                │  │
│  │  MockSessionCard · AnalysisSnapshotCard · ToolCallCard        │  │
│  │  (rendered inline in the retained chat thread)                │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTPS, your existing JWT auth
┌───────────────────────────▼───────────────────────────────────┐
│  YOUR EXISTING BACKEND (FastAPI — unchanged)                    │
│  Hermes Coach + OmniRoute, tool registry, validation gate,       │
│  question_generation_engine, RAG engine, mission/mock/analytics  │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────┐
│  CLOUD POSTGRES + pgvector (unchanged, per prior deployment)     │
└───────────────────────────┬───────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────┐
│  KAGGLE + MinerU AUTOMATED INGESTION (unchanged, already built)  │
└───────────────────────────────────────────────────────────────┘
```

Everything below the app layer is **100% unchanged** from everything
already built and verified in this project. This task only replaces the
client.

---

## 2. WHY THIS IS FASTER THAN BUILDING FROM SCRATCH

- Native chat UX (streaming, markdown rendering, scroll behavior, message
  grouping) is a genuinely fiddly thing to get right — Conduit has already
  solved it and it's proven in production (it's a published, actively
  maintained Play Store app).
- The tool-approval visibility pattern is close to identical in spirit to
  your own `ToolCallCard` confirm-before-apply requirement — adapting an
  existing, working implementation of this exact interaction pattern is
  much less work than designing and debugging it fresh in an unfamiliar
  framework (Flutter, if this is new to you).
- Native Android packaging (signing, Play Store metadata, adaptive icons)
  is already a solved, working pipeline in Conduit's repo — this alone
  removes an entire phase from the earlier TWA/Capacitor plan.

The real cost is Flutter/Dart being a different language/framework than
your Next.js frontend — if you have no Dart experience, budget real
learning-curve time here, same as any new stack adoption.

---

## 3. UI/UX BLUEPRINT — APK SCREENS (ASCII wireframes, same format as your existing docs)

### 3.1 App Shell

```
+------------------------------------------------+
|  ≡  POForge                          🔥12   ⋮   |   <- retained from Conduit's app bar
+------------------------------------------------+
|                                                  |
|              CHAT THREAD (primary view)          |
|                                                  |
+------------------------------------------------+
|  Message Hermes...                        [ ➤ ] |   <- retained composer
+------------------------------------------------+
|  Today  Practice  Mock  Analysis  Coach          |   <- new: bottom nav for direct page access
+------------------------------------------------+
```

- `≡` opens the conversation-history drawer (retained from Conduit).
- Bottom nav is new — added so direct page access (dedicated Mock exam
  mode especially) remains available without forcing everything through
  chat.

### 3.2 In-Chat Structured Widgets

```
HERMES: Here are 5 medium Profit & Loss questions, targeting the
        "discount vs marked price" trap you've missed twice this week.

+------------------------------------------------+
|  SESSION: Profit & Loss · Medium        1 / 5    |
|  [====----------------------------------]         |
+------------------------------------------------+

+------------------------------------------------+
|  A shopkeeper marks an article 40% above cost     |
|  price and allows a discount of 15%. Find his      |
|  profit percent.                        00:42     |
|                                                    |
|   ○  A.  15%                                      |
|   ○  B.  18%                                      |
|   ○  C.  19%                                      |
|   ○  D.  21%                                      |
|   ○  E.  None of these                            |
|                                                    |
|                          [ SUBMIT ]                |
+------------------------------------------------+
```

After submit — same inline feedback pattern as the web app, rendered as a
continuation of this same card, not a new message:

```
+------------------------------------------------+
|  ✓ CORRECT · 38s (target 45s)                     |
|                                    [ NEXT → ]      |
+------------------------------------------------+

HERMES: Nice — that's 2 in a row on this trap. Want the next one,
        or should I pull the difficulty up a notch?
```

### 3.3 Tool-Call Confirmation (adapted from Conduit's approval-gate widget)

```
HERMES: I can update today's Quant target from 90 to 40 questions.

+------------------------------------------------+
|  ⚙ update_mission_config                          |
|  Quant target: 90 → 40                             |
|                                                    |
|              [ Confirm ]        [ Cancel ]         |
+------------------------------------------------+
```

This directly reuses Conduit's existing "approve before sensitive steps"
pattern — the visual form factor already exists in the codebase; only the
tool schema and the confirm action's target endpoint change.

### 3.4 Mock Hand-off (deliberate exception, same as prior plan)

```
HERMES: Ready to start your Full Length mock — 80 questions, 45 minutes,
        real exam conditions.

+------------------------------------------------+
|  📝 IBPS RRB PO PRELIMS — FULL MOCK                |
|  80 Q · 45 min                                     |
|                          [ START MOCK → ]          |
+------------------------------------------------+
        (tapping this navigates OUT of chat into the
         dedicated, focused Mock exam-mode screen —
         a 45-minute timed exam deserves a real screen,
         not a chat card)
```

### 3.5 Theming — porting your design tokens to Flutter

Conduit's existing theme engine (light/dark/system) gets a new theme
definition using your established tokens:

```dart
// Illustrative — actual ThemeData construction in Flutter's idiom
const poforgeDark = ThemeData(
  scaffoldBackgroundColor: Color(0xFF000000), // --bg
  cardColor: Color(0xFF0D0D0D),                // --surface
  // --surface-2: 0xFF161616, --border: 0xFF262626
  colorScheme: ColorScheme.dark(
    primary: Color(0xFFFF7A1A),                 // --accent
    // --accent-soft: 0xFF2A1608
    error: Color(0xFFF25C5C),                    // --danger
  ),
  // Headings: Clash Display / Cabinet Grotesk via Flutter's
  // custom font loading (pubspec.yaml font assets)
  // Body: Inter · Numbers/timers: IBM Plex Mono / Geist Mono, tabular
);
```

Same one-accent-per-screen discipline, same flat/border-only card style,
same rules as the web app — ported, not reinvented.

---

## 4. BUILD PHASES

### Phase 0 — Fork & strip
1. `git clone --recursive` Conduit, confirm it builds and runs unmodified
   first (sanity baseline).
2. Remove Open WebUI mode, direct-connection profiles, and Conduit's own
   Hermes protocol client code.
3. Confirm the app still builds after stripping, even if non-functional —
   establishes a clean base before adding your logic.

### Phase 1 — API adapter layer
1. Implement the POForge backend adapter: JWT auth, `/hermes/chat`,
   `/missions/*`, `/analytics/performance`, tool-call submit/confirm
   endpoints — mapped onto whatever networking abstraction Conduit's
   codebase already uses internally (likely a service/repository layer —
   inspect and reuse its existing patterns rather than bolting on a
   parallel one).
2. Verify: log in from the app, send one real chat message, confirm a
   real response comes back from your actual backend — raw request/
   response evidence, same standing rule as every other phase in this
   project.

### Phase 2 — Structured widgets
1. Build `ToolCallCard` first (adapting Conduit's existing approval-gate
   widget) — reuse the already-proven `update_mission_config` flow as the
   test case, exactly as done on the web app.
2. Build `PracticeQuestionCard` + `SessionProgressCard` — wire to
   `generate_practice_question` / `serve_next_question` /
   `record_chat_practice_attempt` per the tool registry from the prior
   plan.
3. Build `AnalysisSnapshotCard` and the `MockSessionCard` hand-off.
4. Verify each against the same enforcement rule as before: confirm a
   question can ONLY arrive via the two sanctioned tools, never as
   freeform chat text formatted to look like an MCQ.

### Phase 3 — Theming & polish
1. Port design tokens (§3.5), fonts, icon/splash assets (the ascending-arc
   logo mark from earlier).
2. Bottom nav + direct page access for Today/Practice/Mock/Analysis —
   decide whether these are full native Flutter re-implementations or,
   pragmatically, embedded webviews pointing at your existing verified
   Next.js pages for the non-chat screens (this avoids re-building the
   entire Question Engine/Mock/Analysis UI twice, in two frameworks —
   worth strongly considering given how much work already went into the
   web versions).

### Phase 4 — Packaging & release
1. App icon/splash at required resolutions, package name/versioning.
2. Signed release APK/AAB via Flutter's existing build pipeline.
3. Install and test on a real device — full walkthrough: login → chat →
   practice session → tool-call confirm → mock hand-off → analysis.

---

## 5. THE ONE ARCHITECTURAL DECISION TO MAKE EXPLICITLY (Phase 3, item 2)

**Full native re-implementation of every page in Flutter vs. embedding
your existing, already-verified Next.js pages as webviews for non-chat
screens** is a real fork in this plan, and should be decided deliberately:

- **Full native**: more work, more consistent native feel, but means
  building the Question Engine, Mock exam mode, and Analysis dashboards
  a second time in a second framework — significant duplicated effort
  given how much verification work already went into the web versions.
- **Hybrid (chat native, other pages webview)**: faster, reuses 100% of
  already-proven web UI for anything not chat-centric, at the cost of a
  slightly less seamless native feel when navigating into those embedded
  views.

**Recommendation: hybrid.** The chat/coach experience is the actual new
value here and deserves native polish; the dedicated task screens
(Question Engine, Mock, Analysis) are already correctly designed and
extensively verified as web pages — re-embedding them via webview inside
the native shell gets you a real, functioning APK far faster than
duplicating that whole design system in Flutter from scratch.

---

## 6. VERIFICATION REQUIREMENTS (standing rule, unchanged)

Same discipline as every phase before this: raw logs, real screenshots on
a real device/emulator, real request/response evidence for the adapter
layer, and explicit confirmation the question-generation enforcement rule
(RAG never generates servable MCQs) holds in this new client exactly as
required in the backend. Stop after each phase and report back before
proceeding — do not batch Phases 0–4 into one combined report.
