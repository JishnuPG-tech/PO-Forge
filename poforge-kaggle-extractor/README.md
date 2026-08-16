# POForge — Kaggle-Based GPU Document Extraction Pipeline

> **Standalone, ephemeral extraction worker for bank exam materials using Kaggle's free GPU quota, SHA-256 deduping, MinerU document intelligence, and a secure Dataset buffer.**

---

## 1. Architecture Overview

```
┌──────────────────────────────┐       ┌─────────────────────────────────┐
│   SOURCE MATERIAL (Drive)    │       │   KAGGLE GPU WORKER (Ephemeral) │
│   - Bank Exam PDF Backlog    │──────▶│   1. Drive API Pull (Service Acct)│
│   - Telegram Solved Papers   │       │   2. SHA-256 Hash Dedup Check   │
└──────────────────────────────┘       │   3. MinerU Layout + OCR        │
                                       │   4. Multi-Layer Validation Gate │
                                       │   5. Push to Kaggle Dataset Buffer│
                                       └────────────────┬────────────────┘
                                                        │
                                                        ▼
                                       ┌─────────────────────────────────┐
                                       │   HANDOFF SCRIPT (Your Server)  │
                                       │   - Pulls Kaggle Dataset Buffer │
                                       │   - Strict Schema Validation    │
                                       │   - Inserts into Production DB  │
                                       │   - Triggers Corpus Intelligence│
                                       └────────────────┬────────────────┘
                                                        │
                                                        ▼
                                       ┌─────────────────────────────────┐
                                       │   PRODUCTION POSTGRES DATABASE  │
                                       │   (Single source of truth)      │
                                       └─────────────────────────────────┘
```

### Why the Kaggle Dataset Buffer?
* **Zero DB Credentials in Kaggle**: Keeps production database credentials completely out of the notebook environment.
* **Ephemeral Workflows**: Kaggle GPU instances run for 1–2 hours, perform heavy computation, push structured JSON batches, and disappear.
* **Fault Isolation**: Extraction errors or network timeouts never affect the live web app or production database.

---

## 2. Directory Structure

```text
poforge-kaggle-extractor/
├── notebooks/
│   └── extract_and_validate.ipynb      # Complete Kaggle GPU extraction notebook
├── shared/                              # Synced models & validation gate
│   ├── validation_engine/
│   │   ├── gatekeeper.py                # Multi-layer quality gate
│   │   └── schemas.py                   # Rule results & typed anomalies
│   ├── document_intelligence/
│   │   ├── boundary_parser.py           # Option, question stem & answer parsing
│   │   └── schemas.py                   # Candidate schemas & status enums
│   ├── math_verifier.py                 # SymPy equation solver & verification
│   └── schemas.py                       # Unified Pydantic models
├── scripts/
│   ├── drive_intake.py                  # Google Drive API pull + SHA-256 dedup
│   ├── kaggle_dataset_push.py           # Pushes batch output to Kaggle Dataset
│   └── handoff_to_production_db.py      # Runs on your server: dataset -> Postgres DB
├── manifest/
│   └── processed_files.json             # SHA-256 ledger preventing re-processing
├── requirements.txt
└── README.md
```

---

## 3. Step-by-Step Setup

### 3.1 Kaggle Setup
1. Verify your Kaggle account with a phone number (enables free GPU access: T4 x2 or P100).
2. Go to **Account Settings** -> **API** -> **Create New Token** (`kaggle.json`).
3. Place `kaggle.json` in `~/.kaggle/kaggle.json` (Linux/Mac) or `%USERPROFILE%\.kaggle\kaggle.json` (Windows).
4. Create a private Kaggle Dataset buffer named `poforge-extraction-buffer`.

### 3.2 Google Drive API Setup
1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Drive API**.
3. Create a **Service Account** (e.g., `poforge-extractor@your-project.iam.gserviceaccount.com`).
4. Generate and download the Service Account private key JSON file.
5. In Google Drive, share your exam material folder with the Service Account email with **Viewer (Read-only)** permissions.

### 3.3 Configure Kaggle User Secrets
In your Kaggle Notebook under **Add-ons -> Secrets**, add:
* `GDRIVE_SERVICE_ACCOUNT_JSON`: The raw JSON content of your service account key.
* `GDRIVE_FOLDER_ID`: The ID of your Google Drive folder.
* `KAGGLE_USERNAME`: Your Kaggle username.
* `KAGGLE_KEY`: Your Kaggle API key.
* `KAGGLE_DATASET_SLUG`: `your_username/poforge-extraction-buffer`.

---

## 4. Running the Extraction Pipeline

### Semi-Automated Terminal Execution (No Browser Babysitting)

1. **Push & Start Notebook Run**:
   ```bash
   kaggle kernels push -p notebooks/
   ```

2. **Check Execution Status**:
   ```bash
   kaggle kernels status <your-username>/extract-and-validate
   ```

3. **Fetch Logs / Output Summary**:
   ```bash
   kaggle kernels output <your-username>/extract-and-validate -p logs/
   ```

---

## 5. Handoff to Production Database

Run this on your local machine or backend server (where `DATABASE_URL` is configured):

```bash
# Pulls latest Kaggle dataset buffer, validates candidates, and inserts into production DB
python scripts/handoff_to_production_db.py your_username/poforge-extraction-buffer
```

Each inserted question will be tagged with:
```json
{
  "ingestion_source": "kaggle_batch",
  "batch_date": "2026-08-16",
  "miner_backend": "mineru_pipeline_gpu"
}
```

---

## 6. Security & Best Practices Checklist

- [x] **No DB Credentials in Kaggle**: All database transactions are managed by `handoff_to_production_db.py` on your own infrastructure.
- [x] **Private Notebook & Dataset**: Kaggle notebooks and datasets are configured private.
- [x] **Read-Only Drive Access**: Service account scoped exclusively to `drive.readonly`.
- [x] **Deduplication Ledger**: `manifest/processed_files.json` tracks SHA-256 file hashes to prevent redundant extraction across weekly GPU resets.
- [x] **Multi-Layer Validation**: Candidates pass structural, OCR character integrity, SymPy equation re-derivation, and duplicate checks before publication.
