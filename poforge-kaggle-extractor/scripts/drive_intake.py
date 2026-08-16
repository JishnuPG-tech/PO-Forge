"""
Google Drive Intake & SHA-256 Dedup Module.
Pulls newly added PDF bank exam materials from a target Google Drive folder,
computes cryptographic SHA-256 hash, and deduplicates against processed_files.json.
"""
import os
import sys
import json
import hashlib
import io
from typing import List, Dict, Any, Optional
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload


def compute_sha256(filepath: str) -> str:
    """Compute SHA-256 hash of a local file."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


class DriveIntakeManager:
    def __init__(
        self,
        service_account_json_path: Optional[str] = None,
        service_account_info: Optional[Dict[str, Any]] = None,
        manifest_path: str = "manifest/processed_files.json"
    ):
        self.manifest_path = manifest_path
        self.manifest = self._load_manifest()
        
        # Authenticate via service account JSON file or dict from Kaggle Secrets
        if service_account_info:
            self.creds = service_account.Credentials.from_service_account_info(
                service_account_info,
                scopes=["https://www.googleapis.com/auth/drive.readonly"]
            )
        elif service_account_json_path and os.path.exists(service_account_json_path):
            self.creds = service_account.Credentials.from_service_account_file(
                service_account_json_path,
                scopes=["https://www.googleapis.com/auth/drive.readonly"]
            )
        else:
            self.creds = None
            print("[DRIVE] Warning: No service account credentials supplied. Running in offline/local mock mode.")

        if self.creds:
            self.service = build("drive", "v3", credentials=self.creds)
        else:
            self.service = None

    def _load_manifest(self) -> Dict[str, Any]:
        if os.path.exists(self.manifest_path):
            with open(self.manifest_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"version": "1.0.0", "total_documents_processed": 0, "files": {}}

    def save_manifest(self):
        os.makedirs(os.path.dirname(self.manifest_path) or ".", exist_ok=True)
        with open(self.manifest_path, "w", encoding="utf-8") as f:
            json.dump(self.manifest, f, indent=2)

    def is_processed(self, file_hash: str) -> bool:
        return file_hash in self.manifest.get("files", {})

    def record_processed_file(self, file_hash: str, filename: str, page_count: int, summary: Dict[str, Any]):
        if "files" not in self.manifest:
            self.manifest["files"] = {}
        self.manifest["files"][file_hash] = {
            "filename": filename,
            "page_count": page_count,
            "processed_at": summary.get("timestamp"),
            "candidates_count": summary.get("candidates_count", 0),
            "published_count": summary.get("published_count", 0),
            "rejected_count": summary.get("rejected_count", 0)
        }
        self.manifest["total_documents_processed"] = len(self.manifest["files"])
        self.save_manifest()

    def fetch_new_files_from_drive(self, folder_id: str, download_dir: str = "downloads") -> List[Dict[str, Any]]:
        """List PDF files in Drive folder and download only un-processed files."""
        if not self.service:
            print("[DRIVE] Service not initialized. Skipping remote drive fetch.")
            return []

        os.makedirs(download_dir, exist_ok=True)
        query = f"'{folder_id}' in parents and mimeType = 'application/pdf' and trashed = false"
        results = self.service.files().list(q=query, fields="files(id, name, md5Checksum, size)").execute()
        drive_files = results.get("files", [])

        print(f"[DRIVE] Found {len(drive_files)} PDF files in target Drive folder.")
        new_files_to_process = []

        for f_meta in drive_files:
            file_id = f_meta["id"]
            file_name = f_meta["name"]
            local_dest = os.path.join(download_dir, file_name)

            print(f"[DRIVE] Downloading '{file_name}' to check SHA-256 hash...")
            request = self.service.files().get_media(fileId=file_id)
            fh = io.FileIO(local_dest, "wb")
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()

            # Compute SHA-256
            sha256 = compute_sha256(local_dest)
            if self.is_processed(sha256):
                print(f"[DEDUP] Skipping '{file_name}' (SHA-256: {sha256[:12]}... already in manifest).")
                os.remove(local_dest)
            else:
                print(f"[NEW] Queued '{file_name}' (SHA-256: {sha256[:12]}...) for MinerU extraction.")
                new_files_to_process.append({
                    "file_id": file_id,
                    "filename": file_name,
                    "local_path": local_dest,
                    "sha256": sha256
                })

        return new_files_to_process
