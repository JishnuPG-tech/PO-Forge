# POForge — Frontend-to-Backend Integration Mapping Specification

> **Document Version**: 1.0.0  
> **Status**: Comprehensive Mapping Matrix  
> **Backend Architecture**: FastAPI 2.0 (`http://localhost:8000/api/v1`)  
> **Frontend Architecture**: Next.js 15 (`http://localhost:3000`)  

---

## 1. Executive API Client Architecture

All frontend API calls are funneled through a centralized, typed API client located at `src/lib/api/`:

```
src/lib/api/
├── client.ts        # Central Axios/Fetch instance handling JWT headers, base URL, timeout, & error mapping
├── auth.ts          # Auth login, register, current-user profile methods
├── missions.ts      # Daily mission start, submit question attempt, completion methods
├── questions.tsx    # Question search, filtering, and admin publication approval
├── hermes.ts        # Hermes AI Coach chat & streaming interaction
├── analytics.ts     # Learner performance metrics, readiness score, and historical trends
├── documents.ts     # Document intelligence upload & RAG list
└── types.ts         # Strict TypeScript definitions for all API contracts
```

### Environment Variable Binding
* `NEXT_PUBLIC_API_BASE_URL`: `http://localhost:8000/api/v1` (Frontend safe, zero exposed secrets).

---

## 2. Comprehensive Subsystem Integration Matrix

### 2.1 Authentication & Session Subsystem

| Frontend Page / Component | HTTP Method & Endpoint | Backend Router & Handler | Service / Database Layer | Response Schema | Frontend State / Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Login Form / Auth Modal | `POST /api/v1/auth/login` | `auth_router.login_for_access_token` | JWT Token Generator (`HS256`, 1440m expiration) | `LoginResponse` (`access_token`, `user_id`, `is_admin`) | Stores JWT token, sets `AUTHENTICATED` state |
| Registration Modal | `POST /api/v1/auth/login` | `auth_router.login_for_access_token` | User Profile Bootstrap | `LoginResponse` | Boots default learner profile |
| `GlobalShell` / Route Guard | `GET /api/v1/auth/me` | `auth_router.read_current_user_profile` | `UserTokenPayload` Dependency | `{ user_id, email, is_admin, target_exam, target_exam_days_left }` | Hydrates user profile & target exam |

---

### 2.2 Today Command Center (`/`)

| Frontend Page / Component | HTTP Method & Endpoint | Backend Router & Handler | Service / Database Layer | Response Schema | Frontend State / Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Mission Card Header | `GET /api/v1/analytics/performance` | `analytics_router.get_student_performance_analytics` | `PerformanceAnalysisEngine` | `PerformanceAnalytics` (`streak_days`, `target_exam_days_left`, `overall_mastery_percentage`) | Renders `Good morning, Jishnu` + `🔥 12-day streak` |
| Mission Card State | `POST /api/v1/missions/start` | `missions_router.start_today_mission` | `DailyMissionLifecycleManager` | `DailyMissionState` (`status`, `completed_question_count`, `target_question_count`) | Controls `not_started`, `in_progress`, or `complete` mission state |
| StatRow Metrics | `GET /api/v1/analytics/performance` | `analytics_router.get_student_performance_analytics` | Performance Engine | `overall_mastery_percentage`, `overall_accuracy_percentage`, `average_speed_seconds`, `revision_health_percentage` | Displays 4 flat connected StatTiles |

---

### 2.3 Practice & Question Engine (`/practice`)

| Frontend Page / Component | HTTP Method & Endpoint | Backend Router & Handler | Service / Database Layer | Response Schema | Frontend State / Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Question Stem & Options | `GET /api/v1/questions/search` | `questions_router.search_published_questions` | Question Bank Store | `List[QuestionSearchResponse]` | Renders current question stem, options A-E |
| Question Submit Action | `POST /api/v1/missions/submit-question` | `missions_router.submit_question_attempt` | `DailyMissionLifecycleManager` | `{ status, question_id, is_correct, completed_count, target_count }` | Renders inline `✓ Correct` / `✕ Incorrect` feedback bar |
| Subject Transition | `POST /api/v1/missions/submit-question` (sectional boundary) | Mission Lifecycle Manager | Sectional Summary | Updated `DailyMissionState` | Displays `QUANT COMPLETE ✓` subject transition screen |
| Mission Complete | `POST /api/v1/missions/submit-question` (final question) | Mission Lifecycle Manager | `MissionReport` | Full Mission Analytics | Displays final score `82/100` and quiet checkmark animation |

---

### 2.4 Exam Mock Engine (`/mock`, `/mock/exam`, `/mock/result`)

| Frontend Page / Component | HTTP Method & Endpoint | Backend Router & Handler | Service / Database Layer | Response Schema | Frontend State / Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Mock Hub Blueprints | `GET /api/v1/questions/search` | `questions_router.search_published_questions` | Blueprint Assembly | `List[QuestionSearchResponse]` | Populates Topic, Sectional, Full Length, and Custom Mocks |
| Clinical Exam Mode (`/mock/exam`) | `POST /api/v1/missions/start` | `missions_router.start_today_mission` | Grayscale Exam Engine | `DailyMissionState` with `examMode={true}` | Forces 100% grayscale styling with zero accent colors |
| Mock Result (`/mock/result`) | `GET /api/v1/analytics/performance` | `analytics_router.get_student_performance_analytics` | Performance & Diagnostic Engine | `mistake_intelligence` & `weakest_topics` | Renders **3 Things to Fix From This Mock** coach block |

---

### 2.5 Analysis, Weaknesses & Revision (`/analysis`, `/analysis/weakness`, `/revision`)

| Frontend Page / Component | HTTP Method & Endpoint | Backend Router & Handler | Service / Database Layer | Response Schema | Frontend State / Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Hero Readiness Meter | `GET /api/v1/analytics/performance` | `analytics_router.get_student_performance_analytics` | `PerformanceAnalysisEngine` | `readiness_state`, `readiness_score`, `subject_mastery` | Renders horizontal progress bars for Knowledge, Accuracy, Speed, Consistency, Retention |
| Weakness Center (`/analysis/weakness`) | `GET /api/v1/analytics/performance` | `analytics_router.get_student_performance_analytics` | Mistake Intelligence Engine | `weakest_topics`, `mistake_intelligence` | Renders ranked worst-first cards with individual `[ FIX THIS → ]` CTAs |
| Revision Queue (`/revision`) | `GET /api/v1/analytics/performance` | `analytics_router.get_student_performance_analytics` | SuperMemo SM-2 Spaced Repetition Engine | `revision_health_percentage`, `weakest_topics` | Populates `Due Today` revision list |

---

### 2.6 Current Affairs, Library & Hermes AI Coach (`/current-affairs`, `/library`, `/coach`)

| Frontend Page / Component | HTTP Method & Endpoint | Backend Router & Handler | Service / Database Layer | Response Schema | Frontend State / Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Current Affairs Capsule | `GET /api/v1/questions/search?topic_code=CURRENT_AFFAIRS` | `questions_router.search_published_questions` | Question Bank | `List[QuestionSearchResponse]` | Populates finite daily newspaper capsule and MCQ screen |
| Library Documents | `GET /api/v1/documents/` | `documents_router.list_ingested_documents` | Document Intelligence Store | `List[IngestedDocument]` | Displays indexed PDF notes (`RAG Indexed ✓`) |
| Document Upload | `POST /api/v1/documents/upload` | `documents_router.upload_coaching_document` | `DocumentIntelligencePipeline` | `{ document_id, filename, bytes_received, pipeline_result }` | Executes 40-stage document intelligence pipeline |
| Hermes AI Coach Chat | `POST /api/v1/hermes/chat` | `hermes_router.chat_with_hermes_coach` | `HermesAICoach` + `OmniRoute` | `HermesChatResponse` (`response`, `model_used`, `tool_calls`, `sources`) | Streams tutor responses, tool execution states (`✓`, `●`, `○`), & RAG source citations |

---

## 3. Standardized API Error Handling Matrix

| HTTP Status Code | User-Facing Message / Handling Strategy |
| :--- | :--- |
| **400 Bad Request** | "Invalid request parameters. Please verify input fields." |
| **401 Unauthorized** | "Authentication required. Redirecting to login..." |
| **403 Forbidden** | "You do not have administrative permission for this action." |
| **404 Not Found** | "The requested question, document, or session was not found." |
| **422 Validation Error** | "Form validation failed. Please check required fields." |
| **500 / 503 Server Error** | "The POForge service is temporarily unavailable. Retry button enabled." |
