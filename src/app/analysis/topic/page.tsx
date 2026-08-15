"use client";

import React from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, StatTile, StatRow, ProgressBar, Sparkline } from "@/components/ui";
import { ArrowLeft, BookOpen, CheckCircle, Target, Award } from "lucide-react";

export default function TopicDetailPage() {
  const trendData = [52, 55, 56, 58];

  return (
    <GlobalShell>
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/analysis" className="hover:text-text">
            ← Analysis
          </Link>
          <span>•</span>
          <span>Topic Detail</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text">
          PROFIT & LOSS
        </h1>
        <p className="text-xs text-text-muted">
          Quantitative Aptitude • High Weightage Topic in IBPS RRB PO
        </p>
      </div>

      {/* StatRow Reused Primitives */}
      <StatRow>
        <StatTile label="Mastery" value="58%" trend={{ direction: "up", text: "+6%" }} />
        <StatTile label="Accuracy" value="61%" />
        <StatTile label="Speed" value="49%" subtitle="Avg 68s / Q" />
        <StatTile label="Retention" value="64%" subtitle="SuperMemo SM-2" />
      </StatRow>

      {/* 7-DAY TREND (Sparkline Primitive) */}
      <Card variant="default" className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            7-Day Accuracy Trend
          </span>
          <div className="text-sm font-bold font-mono text-text">52% → 55% → 56% → 58%</div>
        </div>
        <Sparkline data={trendData} width={140} height={36} />
      </Card>

      {/* MISTAKE BREAKDOWN HORIZONTAL BARS */}
      <Card variant="default" className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-text border-b border-border pb-2">
          Mistake Breakdown
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Concept Errors</span>
              <span className="font-bold text-danger">12 attempts</span>
            </div>
            <ProgressBar value={66} variant="danger" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Calculation Errors</span>
              <span className="font-bold text-warning">4 attempts</span>
            </div>
            <ProgressBar value={22} variant="warning" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Careless Errors</span>
              <span className="font-bold text-text-muted">2 attempts</span>
            </div>
            <ProgressBar value={12} variant="accent" />
          </div>
        </div>
      </Card>

      {/* RECOMMENDED & ACTIONS */}
      <Card variant="default" className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-text border-b border-border pb-2">
          Recommended Action Plan
        </h3>

        <ul className="text-xs text-text-muted space-y-1.5 list-disc list-inside font-mono">
          <li>10 medium-difficulty practice questions focused on discount logic</li>
          <li>5 previous mistakes to retry in Mistake Book</li>
          <li>Review marked price vs cost price concept note</li>
        </ul>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link href="/practice?topic=PROFIT_LOSS" className="w-full sm:w-auto flex-1">
            <Button variant="primary" size="md" fullWidth>
              Practice Topic →
            </Button>
          </Link>
          <Link href="/coach" className="w-full sm:w-auto flex-1">
            <Button variant="secondary" size="md" fullWidth>
              Review Concept
            </Button>
          </Link>
          <Link href="/mock?topic=PROFIT_LOSS" className="w-full sm:w-auto flex-1">
            <Button variant="ghost" size="md" fullWidth>
              Take Topic Mock
            </Button>
          </Link>
        </div>
      </Card>
    </GlobalShell>
  );
}
