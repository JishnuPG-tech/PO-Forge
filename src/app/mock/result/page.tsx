"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, ProgressBar, Skeleton } from "@/components/ui";
import { analyticsApi, AnalyticsResponse } from "@/lib/api";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function MockResultPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await analyticsApi.getPerformanceAnalytics();
      setAnalytics(data);
    } catch (e: any) {
      console.warn("Failed to load mock result analytics:", e);
      setErrorMsg(e.message || "Unable to connect to POForge backend service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const overallAccuracy = analytics?.overall_accuracy_percentage ?? 84.1;
  const overallMastery = analytics?.overall_mastery_percentage ?? 76.2;
  const avgSpeed = analytics?.average_speed_seconds ?? 42.5;

  const quantMastery = analytics?.subject_mastery?.["QUANT"] ?? 72;
  const reasoningMastery = analytics?.subject_mastery?.["REASONING"] ?? 81;

  const weakestTopics = analytics?.weakest_topics || ["PROFIT_LOSS", "DATA_INTERPRETATION"];

  return (
    <GlobalShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Error state */}
        {errorMsg && (
          <div className="p-4 bg-danger-soft border border-danger/30 rounded-card flex items-center justify-between text-xs text-danger font-mono">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-1 bg-surface border border-border px-3 py-1 rounded text-text hover:bg-surface-2 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton state */}
        {isLoading ? (
          <Card variant="default" className="p-6 space-y-4">
            <Skeleton className="w-1/2 h-8 mx-auto" />
            <Skeleton className="w-full h-16" />
          </Card>
        ) : (
          <>
            {/* Score Header Card */}
            <Card variant="mission" className="p-8 text-center space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                Mock Completed
              </span>
              <div className="text-4xl font-extrabold font-mono tabular-nums text-text">
                78 <span className="text-xl text-text-muted font-normal">/ 80</span>
              </div>
              <div className="text-xl font-bold font-mono text-success">
                {overallAccuracy}% Score
              </div>

              <div className="flex items-center justify-center gap-6 text-xs font-mono text-text-muted border-t border-border pt-4">
                <span>
                  Accuracy: <strong className="text-text">{overallAccuracy}%</strong>
                </span>
                <span>
                  Avg Speed: <strong className="text-text">{avgSpeed}s</strong>
                </span>
                <span>
                  Mastery Index: <strong className="text-text">{overallMastery}</strong>
                </span>
              </div>
            </Card>

            {/* Sectional Breakdown Bars */}
            <Card variant="default" className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-text border-b border-border pb-2">
                Sectional Breakdown
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Reasoning Ability</span>
                    <span className="font-bold text-success">
                      {Math.round((reasoningMastery / 100) * 40)} / 40 ({reasoningMastery}%)
                    </span>
                  </div>
                  <ProgressBar value={reasoningMastery} variant="success" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Quantitative Aptitude</span>
                    <span className="font-bold text-text">
                      {Math.round((quantMastery / 100) * 40)} / 40 ({quantMastery}%)
                    </span>
                  </div>
                  <ProgressBar value={quantMastery} variant="accent" />
                </div>
              </div>
            </Card>

            {/* 3 THINGS TO FIX BLOCK (DYNAMIC FROM BACKEND ANALYTICS) */}
            <Card variant="default" className="p-6 border-warning/40 bg-surface space-y-5 shadow-lg">
              <div className="flex items-center gap-2 text-sm font-bold text-text border-b border-border pb-3">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span>3 Things to Fix From This Mock</span>
              </div>

              <div className="space-y-3 text-xs text-text leading-relaxed font-mono">
                <div className="p-3 bg-surface-2 border border-border rounded-btn space-y-1">
                  <strong className="text-text font-bold">
                    1. Weak Topic ({weakestTopics[0] || "PROFIT_LOSS"}):
                  </strong>
                  <p className="text-text-muted">
                    Accuracy decayed on {weakestTopics[0] || "Profit & Loss"} calculations under time pressure.
                  </p>
                </div>

                <div className="p-3 bg-surface-2 border border-border rounded-btn space-y-1">
                  <strong className="text-text font-bold">2. Pace Control ({avgSpeed}s avg):</strong>
                  <p className="text-text-muted">
                    Quant section averaged {avgSpeed}s per question vs 35s target exam pace.
                  </p>
                </div>

                <div className="p-3 bg-surface-2 border border-border rounded-btn space-y-1">
                  <strong className="text-text font-bold">3. Calculation Shortcut Refresh:</strong>
                  <p className="text-text-muted">
                    Revisit Simplification BODMAS shortcuts to save 15 seconds per calculation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link href="/practice?mode=recovery" className="flex-1">
                  <Button variant="primary" size="md" fullWidth>
                    <span>Fix These Now →</span>
                  </Button>
                </Link>
                <Link href="/analysis" className="flex-1">
                  <Button variant="secondary" size="md" fullWidth>
                    Full Breakdown
                  </Button>
                </Link>
              </div>
            </Card>
          </>
        )}
      </div>
    </GlobalShell>
  );
}
