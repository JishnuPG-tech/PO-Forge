# POForge — Master Backend Technical Specification & Service Reference

> **Document Version**: 2.0.0  
> **Backend Stack**: FastAPI 2.0, Python 3.13, Pydantic V2, SQLAlchemy, Pytest (44 Passed)  
> **API Base URL**: `http://localhost:8000/api/v1`  
> **Target Examinations**: IBPS RRB PO, IBPS PO, SBI PO, SBI Clerk, RBI Assistant  

---

## 1. Executive Backend Architecture

The POForge backend platform is built as a production-grade microservice-ready FastAPI application designed for high-concurrency student question sessions, automated daily mission lifecycle management, 40-stage document intelligence ingestion, automated mathematical question validation, and RAG-grounded Hermes AI tutoring.

```
backend/
├── app/
│   ├── main.py                     # FastAPI app instance, CORS middleware, global exception handler
│   ├── core/
│   │   └── config.py               # Pydantic BaseSettings, JWT secret, database URL, Hermes API key
│   ├── api/
│   │   ├── deps.py                 # OAuth2 Bearer token dependencies, admin authorization guards
│   │   └── routers/
│   │       ├── auth.py             # Login, token generation, user profile (/auth)
│   │       ├── documents.py        # Document upload & intelligence pipeline (/documents)
│   │       ├── questions.py        # Question search & publication gate approvals (/questions)
│   │       ├── hermes_ai.py        # Hermes AI Coach chat & OmniRoute execution (/hermes)
│   │       ├── missions.py         # Daily mission lifecycle & question submission (/missions)
│   │       └── analytics.py        # Learner readiness & performance analytics (/analytics)
│   ├── db/
│   │   ├── session.py              # SQLAlchemy engine & SessionLocal factory
│   │   └── init_db.py              # Seed data bootstrapping for banking exams
│   ├── models/
│   │   ├── enums.py                # Enumerations for states, difficulties, mistakes, readiness
│   │   ├── content.py              # Exams, Subjects, Topics, Questions, Options, Solutions
│   │   ├── learning.py             # LearnerProfiles, MissionStates, Attempts, Mistakes, Revisions
│   │   └── admin.py                # IngestedDocuments, ProcessingJobs, ValidationReports, Anomalies
│   └── services/
│       ├── document_intelligence/  # 40-stage document processing, OCR, forensics, parser
│       ├── validation_engine/      # Structural, mathematical, duplicate detection, quality gate
│       ├── learner_engine/         # SuperMemo SM-2, topic mastery, learner profile
│       ├── mission_engine/         # Mission lifecycle manager, section sequence generator
│       ├── performance_engine/     # Readiness meter, trend calculator, mistake classifier
│       ├── rag_engine/             # Vector store, chunker, semantic retriever
│       └── ai_agent/               # Hermes AI Coach & OmniRoute model task router
└── tests/                          # 44-test Pytest test suite (100% Passing)
```

---

## 2. Core Service Engines & Intelligence Subsystems

### 2.1 Document Intelligence Pipeline (`backend/app/services/document_intelligence/`)
* **Pipeline Orchestrator (`pipeline.py`)**: Executes a 40-stage document processing workflow for uploaded banking exam papers (PDF, DOCX, images).
* **Document Forensics (`forensics.py`)**: Analyzes page layouts, watermark pollution, page boundaries, header/footer repetition, and multi-column formats.
* **OCR & Structural Parser (`ocr_engine.py`, `parser.py`)**: Extracts raw text, mathematical expressions, option labels (`A-E`), and answer keys while repairing OCR substitution errors (e.g. `O` vs `0`, `l` vs `1`).

### 2.2 Question Validation & Quality Gate (`backend/app/services/validation_engine/`)
* **Gatekeeper (`gatekeeper.py`)**: 7-stage quality gate enforcing structural integrity, option completeness, answer presence, and publication status.
* **Math Verifier (`math_verifier.py`)**: Uses SymPy to verify arithmetic calculations, algebraic solutions, BODMAS simplification, and percentage formulas.
* **Duplicate Detector (`duplicate_detector.py`)**: Detects duplicate or near-duplicate questions using text similarity and semantic embeddings.

### 2.3 SuperMemo SM-2 Spaced Repetition Engine (`backend/app/services/learner_engine/`)
* **SuperMemo SM-2 (`supermemo_sm2.py`)**: Implements the SuperMemo SM-2 algorithm to compute interval spacing (`I(n)`), easiness factor (`EF`), and repetition count (`q` scale 0–5).
* **Mastery Calculator (`mastery_calculator.py`)**: Evaluates overall and topic-specific mastery based on SuperMemo retention and historical accuracy.

### 2.4 Daily Mission Engine (`backend/app/services/mission_engine/`)
* **Lifecycle Manager (`mission_lifecycle.py`)**: Manages `not_started`, `in_progress`, and `complete` daily mission states.
* **Section Generator (`mission_generator.py`)**: Generates balanced 90-question daily target sessions partitioned across active subjects (`Quantitative Aptitude`, `Reasoning`, `English`, `Current Affairs`).

### 2.5 Performance & Mistake Intelligence Engine (`backend/app/services/performance_engine/`)
* **Readiness Meter (`readiness_meter.py`)**: Computes 5-dimension readiness (Knowledge, Accuracy, Speed, Consistency, Retention) and maps students to 5 readiness tiers:
  1. `FOUNDATION` (0 – 40%)
  2. `DEVELOPING` (41 – 60%)
  3. `COMPETITIVE` (61 – 75%)
  4. `STRONG` (76 – 89%)
  5. `EXAM_READY` (90 – 100%)
* **Mistake Classifier (`mistake_classifier.py`)**: Classifies incorrect attempts into categories (`CONCEPT_ERROR`, `CALCULATION_ERROR`, `CARELESS_ERROR`, `TIME_PRESSURE`, `MISREAD_QUESTION`, `GUESSING`).

### 2.6 Hermes AI Coach & OmniRoute Router (`backend/app/services/ai_agent/`)
* **Hermes Coach (`hermes_coach.py`)**: High-level AI tutor orchestrating RAG knowledge retrieval, student attempt analysis, and personalized teaching plans.
* **OmniRoute Router (`omniroute_router.py`)**: Dynamic model selection routing tasks across `TUTORING`, `COMPLEX_REASONING`, and `CLASSIFICATION` models.

---

## 3. Database Schema & Domain Models

### 3.1 Enumerations (`backend/app/models/enums.py`)
* `PublicationStatus`: `DRAFT`, `REVIEW_REQUIRED`, `APPROVED`, `PUBLISHED`, `ARCHIVED`
* `TopicState`: `LOCKED`, `NOT_LEARNED`, `LEARNING`, `AVAILABLE`, `NEEDS_REVISION`, `MASTERED`
* `QuestionDifficulty`: `EASY`, `MEDIUM`, `HARD`
* `MistakeCategory`: `CONCEPT_ERROR`, `CALCULATION_ERROR`, `CARELESS_ERROR`, `MISREAD_QUESTION`, `WRONG_APPROACH`, `TIME_PRESSURE`, `GUESSING`, `KNOWLEDGE_GAP`
* `ExamReadinessState`: `FOUNDATION`, `DEVELOPING`, `COMPETITIVE`, `STRONG`, `EXAM_READY`

### 3.2 Key Database Tables (`content.py`, `learning.py`, `admin.py`)
* `exams`: Stores exam metadata (`code`, `name`, `total_questions`, `duration_minutes`).
* `questions`: Question stems, option list, correct option index, explanation, shortcut, difficulty, and publication status.
* `learner_profiles`: Student target exam, streak count, readiness state, overall mastery %.
* `attempts`: Student question attempt records including selected option, response time (ms), correctness, and mistake category.
* `ingested_documents`: Admin uploaded coaching notes, page count, question detection counts, and processing job status.

---

## 4. API Endpoints Reference

### 4.1 Authentication (`/api/v1/auth`)
* `POST /api/v1/auth/login`: Authenticates user and returns JWT Bearer token (`access_token`, `user_id`, `is_admin`).
* `GET /api/v1/auth/me`: Retrieves current authenticated user profile and enabled subjects.

### 4.2 Documents (`/api/v1/documents`)
* `POST /api/v1/documents/upload`: Uploads coaching PDF/DOCX document and triggers 40-stage Document Intelligence pipeline.
* `GET /api/v1/documents/`: Returns list of ingested documents and RAG indexing status.

### 4.3 Questions (`/api/v1/questions`)
* `GET /api/v1/questions/search`: Queries published question bank filtered by `subject_code`, `topic_code`, `difficulty`, and `limit`.
* `POST /api/v1/questions/{id}/approve`: Admin publication gate approving question for student practice.

### 4.4 Daily Missions (`/api/v1/missions`)
* `POST /api/v1/missions/start`: Generates or restores today's 90-question daily mission session.
* `POST /api/v1/missions/submit-question`: Submits question attempt (`section_index`, `question_index`, `selected_option_index`, `response_time_ms`) and returns correctness and updated mission progress.

### 4.5 Performance Analytics (`/api/v1/analytics`)
* `GET /api/v1/analytics/performance`: Returns student readiness state, score, subject mastery breakdown, mistake intelligence, strongest/weakest topics, and 7-day trends.

### 4.6 Hermes AI Coach (`/api/v1/hermes`)
* `POST /api/v1/hermes/chat`: Sends message to Hermes AI Coach and receives RAG-grounded response, model used, tool calls, and source citations.

---

## 5. Backend Test Suite Inventory (`backend/tests/`)

All 44 test cases across 10 test modules run and pass in 1.70 seconds via `python -m pytest backend/tests`:

1. `test_adversarial_quality_gate.py`: Verifies malformed question filtering, missing options, and duplicate rejection.
2. `test_daily_mission_engine.py`: Verifies daily target question generation, subject sectioning, and mission completion.
3. `test_document_intelligence_pipeline.py`: Verifies 40-stage PDF processing, OCR text extraction, and forensics.
4. `test_fastapi_endpoints.py`: Verifies FastAPI routes, authentication dependencies, and JSON response models.
5. `test_hermes_and_omniroute.py`: Verifies Hermes coach response generation and OmniRoute model routing.
6. `test_learner_engine.py`: Verifies SuperMemo SM-2 calculation, interval spacing, and topic mastery update logic.
7. `test_performance_analysis_engine.py`: Verifies 5-dimension readiness score computation and mistake classification.
8. `test_rag_subsystem.py`: Verifies vector chunking, embedding generation, and semantic document retrieval.
9. `test_system_concurrency_and_security.py`: Verifies JWT authentication tokens, role-based access control, and async task execution.
10. `test_validation_framework.py`: Verifies SymPy mathematical verification and OCR substitution error handling.
