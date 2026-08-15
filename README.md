# POForge — Personal AI Banking Coach

POForge is a continuously adaptive personal coaching system engineered for **IBPS RRB PO, IBPS PO, SBI PO, SBI Clerk, and RBI Assistant** examinations.

---

## ⚡ Tech Stack

* **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v3, Lucide Icons, Recharts
* **Backend**: FastAPI, SQLAlchemy 2.0 (Async), Alembic, Pydantic v2, SQLite / PostgreSQL
* **AI & RAG Engine**: Hermes AI Coach with Omniroute Router, SuperMemo SM-2 Spaced Repetition, IRT (Item Response Theory) Mastery Calculator
* **Document Intelligence**: MinerU layout parser, MFR formula extraction, PaddleOCR, high-precision boundary segmentation

---

## 🚀 Getting Started

### 1. Frontend Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 2. Backend Service

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r pyproject.toml
uvicorn backend.app.main:app --reload --port 8000
```

---

## 📱 Features

1. **Today Hub**: Dynamic daily missions, streak tracker, real-time countdown to exam date.
2. **Practice Engine**: Adaptive question delivery, question palette drawer, instant solution explanations.
3. **Mock Engine**: 52+ topic tests, full-length timed mocks with sectional cutoffs and negative marking (-0.25).
4. **Analysis & Readiness**: IRT ability curves, accuracy donut charts, and weakness diagnostics.
5. **Revision Center**: 5-minute rapid formula warmups using 3D interactive flashcards powered by SM-2.
6. **Hermes AI Coach**: Live conversational coaching, weakness analysis, and automated mission adjustments.
7. **Mobile & Android Optimized**: 100% responsive, safe-area inset support, touch ergonomics.

---

## 📄 License

MIT
