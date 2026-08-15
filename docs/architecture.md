# POForge - System Architecture Map

## Overview
POForge (Personal AI Banking Coach) is an adaptive banking examination operating system for serious exam preparation (IBPS RRB PO, IBPS PO, SBI PO, SBI Clerk, RBI Assistant).

## High-Level Architecture Topology
```
[ Next.js 15 Frontend (App Router, Tailwind CSS, shadcn/ui) ]
                      │ (HTTP REST / WebSocket Streaming)
                      ▼
[ FastAPI Application Server (Pydantic v2, SQLAlchemy 2.0 Async) ]
        │                       │                     │
        ▼                       ▼                     ▼
[ PostgreSQL + pgvector ]   [ Redis + Task Queue ]  [ Hermes + OmniRoute Router ]
(Content & Learner DB)      (Jobs & Prefetch Cache) (AI Coaching & Vision)
```

## Main Core Subsystems
1. **Document Intelligence & Ingestion Pipeline**: 40-stage file inspection, page rendering, OCR, layout reconstruction, mathematical extraction, unicode normalization, candidate structuring.
2. **Multi-Layer Question Validation Engine**: Structural, Text/OCR, Mathematics, Semantic, Taxonomy, and Duplicate validators.
3. **Adaptive RAG Engine**: Page-aware chunking (500 tokens), pgvector + BM25 hybrid search, Reciprocal Rank Fusion (RRF) reranking, grounded context assembly with provenance attributions.
4. **Hermes AI Coach & OmniRoute Model Router**: 21 scoped backend tools, system prompt injection defense, server-side model specialization (`CLASSIFICATION`, `DOCUMENT_UNDERSTANDING`, `COMPLEX_REASONING`, `TUTORING`, `VISION`).
5. **Learner Model & State Machine**: Deterministic mastery calculator (70% Acc + 20% Speed + 10% Retention), SuperMemo SM-2 spaced repetition scheduler, difficulty adaptation, topic eligibility validator.
6. **Adaptive Daily Mission Engine**: Reproducible blueprint generator, active subject sequence (`Quant` -> `Reasoning` -> `English` -> `Current Affairs`), state lifecycle (`start`, `pause`, `resume`, `submit`, `complete`), post-mission diagnostic analyzer.
7. **Complete Performance Analysis Engine**: Attempt telemetry recorder, mistake classifier, strongest/weakest topics, time losses, detailed incorrect-answer explainer.
