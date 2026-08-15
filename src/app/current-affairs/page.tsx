"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, Skeleton } from "@/components/ui";
import { questionsApi, QuestionResponse } from "@/lib/api";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function CurrentAffairsPage() {
  const [period, setPeriod] = useState<"TODAY" | "WEEK" | "MONTH">("TODAY");

  // Backend API states
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadQuestions = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await questionsApi.searchQuestions({ subject_code: "GA_BANKING", limit: 10 });
      setQuestions(data);
    } catch (e: any) {
      console.warn("Failed to load CA questions from backend:", e);
      setErrorMsg(e.message || "Unable to connect to POForge backend service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const categories = [
    "Banking",
    "Economy",
    "Government",
    "Reports",
    "Appointments",
    "Awards",
    "Schemes",
  ];

  const displayCapsules = questions.length > 0
    ? questions.map((q) => q.text)
    : [
        "RBI releases Financial Stability Report (FSR) highlighting bank NPA trends.",
        "Retail inflation (CPI) cools to 3.54% in July 2026.",
        "NABARD sanctions ₹1,500 crore for rural infrastructure in Rajasthan.",
        "Government launches revised PM-Kisan portal updates.",
      ];

  return (
    <GlobalShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text">
            Current Affairs & Banking Awareness
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Finite daily newspaper capsules tailored for IBPS RRB PO / SBI PO exams.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 font-mono text-xs bg-surface border border-border p-1 rounded-btn">
          {(["TODAY", "WEEK", "MONTH"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded cursor-pointer ${
                period === p
                  ? "bg-accent-soft text-accent font-bold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {p === "TODAY" ? "Today" : p === "WEEK" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
        <span className="text-text-muted">Categories:</span>
        {categories.map((cat, i) => (
          <span
            key={i}
            className="px-2.5 py-1 bg-surface-2 border border-border rounded-badge text-text-muted whitespace-nowrap"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 bg-danger-soft border border-danger/30 rounded-card flex items-center justify-between text-xs text-danger font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={loadQuestions}
            className="flex items-center gap-1 bg-surface border border-border px-3 py-1 rounded text-text hover:bg-surface-2 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <Card variant="mission" className="p-6 space-y-4 max-w-2xl mx-auto">
          <Skeleton className="w-1/3 h-6" />
          <Skeleton className="w-full h-32" />
        </Card>
      ) : (
        /* TODAY'S CAPSULE CARD */
        <Card variant="mission" className="p-6 space-y-5 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                Daily Digest
              </span>
              <h2 className="text-lg font-bold text-text">
                TODAY'S CAPSULE — {displayCapsules.length} updates
              </h2>
            </div>
            <span className="text-xs font-mono text-text-muted">August 15, 2026</span>
          </div>

          <ul className="space-y-2 text-xs text-text leading-relaxed font-mono list-disc list-inside">
            {displayCapsules.map((text, idx) => (
              <li key={idx}>{text}</li>
            ))}
          </ul>

          <div className="flex items-center gap-3 pt-2">
            <Link href="/practice?subject=GA_BANKING" className="flex-1">
              <Button variant="primary" size="md" fullWidth>
                <span>PRACTICE MCQS →</span>
              </Button>
            </Link>
            <Link href="/library" className="flex-1">
              <Button variant="secondary" size="md" fullWidth>
                READ CAPSULE
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </GlobalShell>
  );
}
