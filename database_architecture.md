# Production Database Architecture Documentation

## Overview

The Personal AI Banking Coach database is built using **PostgreSQL** with the **`pgvector`** extension for high-performance vector search. The architecture cleanly separates content truth from user learning dynamics and administrative content governance.

---

## Architectural Principles & Schema Decisions

### 1. Domain Separation
* **Content Domain (`backend/app/models/content.py`)**: Authoritative, published exam taxonomy, structured questions, options, solutions, documents, validation records, anomalies, vector embeddings, and exam blueprints.
* **Learning Domain (`backend/app/models/learning.py`)**: Real-time student behavior, topic eligibility states (`LOCKED`..`MASTERED`), question attempt logs, mistake classifications, SuperMemo SM-2 spaced repetition schedules, daily mission progress, and Hermes AI sessions.
* **Admin Domain (`backend/app/models/admin.py`)**: Content authority governance, role-based access control (RBAC), PDF extraction processing jobs, side-by-side review items, audit logs, and publication state events.

---

### 2. Core Question Constraints & Validation Gates
* **Option Count Enforcement**: `CheckConstraint("option_count >= 4 AND option_count <= 5")`. Every published question must feature strictly 4 or 5 options.
* **Correct Answer Indexing**: `CheckConstraint("correct_option_index >= 0 AND correct_option_index < option_count")`. Ensures zero out-of-bounds correct answer references.
* **Publication State Machine**: Questions progress through `DRAFT` -> `REVIEW_REQUIRED` -> `APPROVED` -> `PUBLISHED`. Unapproved questions are filtered out of student-facing queries by default via indexed database clauses.

---

### 3. Performance & Query Patterns
* **Fast Exam Retrieval**: `Index("idx_question_taxonomy", "subject_id", "topic_id", "subtopic_id", "publication_status")` ensures sub-10ms question queries during mission and mock generation.
* **Topic Eligibility Filtering**: `Index("idx_user_topic_state_query", "user_id", "state")` enables instant lookup of user-enabled topics during adaptive daily mission generation.
* **Spaced Repetition Scheduling**: `Index("idx_user_revision_due", "user_id", "next_review_at")` allows instant fetching of due revision items for the student's daily mission.
* **RAG Retrieval**: `Vector(1536)` columns on `question_embeddings` and `knowledge_embeddings` indexed via `pgvector` HNSW index for ultra-fast hybrid semantic search.

---

### 4. Source Provenance & Auditability
* **`question_sources`**: Maintains direct link to original `documents` file, page number (`document_pages`), bounding box JSON coordinates, and extraction version.
* **`audit_logs`**: Logs every admin approval, edit, rejection, or publication status shift with timestamp and IP address.
* **`question_anomalies`**: Stores flagged mathematical discrepancies (SymPy verifier output vs source key), OCR substitutions, and broken decimals to prevent accidental publication.

---

## Seeded Taxonomy Summary

* **5 Exams**: IBPS RRB PO, IBPS PO, SBI PO, SBI Clerk, RBI Assistant.
* **5 Subjects**: Quantitative Aptitude, Reasoning Ability, English Language, General & Banking Awareness, Computer Knowledge.
* **19 Core Topics**: Simplification, Number Series, Quadratic Equations, Commercial Arithmetic, Data Interpretation, Puzzles & Seating, Syllogism, Reading Comprehension, Banking Awareness, etc.
* **61 Subtopics**: Detailed, micro-concept taxonomy items for granular mastery tracking.
