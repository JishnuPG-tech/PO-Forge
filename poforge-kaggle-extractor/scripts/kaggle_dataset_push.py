"""
Kaggle Dataset Push Script.
Pushes newly extracted and validated batch results to a private Kaggle Dataset buffer.
Prevents direct database writes from Kaggle, ensuring zero DB credentials in the notebook.
"""
import os
import sys
import json
import time
import subprocess
from typing import Dict, Any


def push_batch_to_kaggle_dataset(
    dataset_dir: str,
    dataset_slug: str,
    version_notes: str = "Automated MinerU batch extraction"
) -> bool:
    """
    Pushes directory containing batch_output.json and processed_files.json
    as a new version of the Kaggle Dataset.
    """
    print(f"\n[DATASET PUSH] Packaging dataset from '{dataset_dir}' -> '{dataset_slug}'")
    metadata_file = os.path.join(dataset_dir, "dataset-metadata.json")
    
    if not os.path.exists(metadata_file):
        owner, dset = dataset_slug.split("/") if "/" in dataset_slug else ("user", dataset_slug)
        meta = {
            "title": "POForge Extracted Bank Exam Dataset Buffer",
            "id": dataset_slug,
            "licenses": [{"name": "CC0-1.0"}]
        }
        with open(metadata_file, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

    cmd = [
        "kaggle", "datasets", "version",
        "-p", dataset_dir,
        "-m", f"{version_notes} ({time.strftime('%Y-%m-%d %H:%M:%S')})",
        "-r", "zip"
    ]
    
    try:
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"[DATASET PUSH] Successfully pushed new version to Kaggle Dataset {dataset_slug}!")
            print(res.stdout)
            return True
        else:
            print(f"[DATASET PUSH] CLI Error:\n{res.stderr}")
            return False
    except Exception as e:
        print(f"[DATASET PUSH] Failed to run Kaggle CLI: {e}")
        return False
