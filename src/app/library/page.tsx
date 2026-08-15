"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, Badge, Skeleton } from "@/components/ui";
import { documentsApi, DocumentResponse } from "@/lib/api";
import { FileText, RefreshCw, AlertTriangle } from "lucide-react";

export default function LibraryPage() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await documentsApi.listDocuments();
      setDocuments(data);
    } catch (e: any) {
      console.warn("Failed to load documents from backend:", e);
      setErrorMsg(e.message || "Unable to connect to POForge backend service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const displayDocs = documents.length > 0
    ? documents
    : [
        {
          document_id: "DOC_001",
          filename: "Quant Notes.pdf",
          status: "INDEXED",
          chunk_count: 182,
          created_at: new Date().toISOString(),
        },
        {
          document_id: "DOC_002",
          filename: "Reasoning Notes.pdf",
          status: "INDEXED",
          chunk_count: 94,
          created_at: new Date().toISOString(),
        },
        {
          document_id: "DOC_003",
          filename: "Banking Awareness.pdf",
          status: "PROCESSING",
          chunk_count: 62,
          created_at: new Date().toISOString(),
        },
      ];

  return (
    <GlobalShell>
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text">
          My Library (RAG Knowledge Base)
        </h1>
        <p className="text-xs text-text-muted">
          Your personal study notes and PDF documents indexed for Hermes AI RAG retrieval.
        </p>
      </div>

      {/* Error Retry banner */}
      {errorMsg && (
        <div className="p-4 bg-danger-soft border border-danger/30 rounded-card flex items-center justify-between text-xs text-danger font-mono mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={loadDocuments}
            className="flex items-center gap-1 bg-surface border border-border px-3 py-1 rounded text-text hover:bg-surface-2 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton state */}
      {isLoading ? (
        <div className="space-y-3">
          <Card variant="default" className="p-4 space-y-2">
            <Skeleton className="w-1/3 h-5" />
            <Skeleton className="w-1/4 h-4" />
          </Card>
          <Card variant="default" className="p-4 space-y-2">
            <Skeleton className="w-1/3 h-5" />
            <Skeleton className="w-1/4 h-4" />
          </Card>
        </div>
      ) : (
        /* Flat List */
        <div className="space-y-3">
          {displayDocs.map((doc, idx) => (
            <Card
              key={doc.document_id || idx}
              variant="default"
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="text-sm font-bold text-text">{doc.filename}</h3>
                  <span className="text-xs font-mono text-text-muted">
                    {doc.chunk_count} chunks / pages • {doc.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                <Badge
                  variant={doc.status === "INDEXED" ? "success" : "warning"}
                  label={doc.status === "INDEXED" ? "RAG Indexed ✓" : "Processing... ◐"}
                />

                <div className="flex items-center gap-2">
                  <Link href={`/library/reader?doc=${doc.document_id}`}>
                    <Button variant="secondary" size="sm">
                      OPEN
                    </Button>
                  </Link>
                  <Link href={`/coach?prompt=Summarize ${doc.filename}`}>
                    <Button variant="ghost" size="sm">
                      ASK AI
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </GlobalShell>
  );
}
