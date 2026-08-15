"use client";

import React from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, ProgressBar } from "@/components/ui";
import { AlertTriangle, ArrowRight, Target, RotateCcw } from "lucide-react";

export default function WeaknessCenterPage() {
  const weaknesses = [
    {
      id: "01",
      topic: "PROFIT & LOSS",
      subject: "Quantitative Aptitude",
      mastery: 58,
      incorrectAttempts: 18,
      recurringMistakes: 6,
      summary: "Discount and marked-price percentage calculations dragged accuracy down.",
      topicCode: "PROFIT_LOSS",
    },
    {
      id: "02",
      topic: "DATA INTERPRETATION",
      subject: "Quantitative Aptitude",
      mastery: 62,
      incorrectAttempts: 14,
      recurringMistakes: 4,
      summary: "Slow interpretation pattern; averaging 82s per DI set question.",
      topicCode: "DI",
    },
    {
      id: "03",
      topic: "ERROR DETECTION",
      subject: "English Language",
      mastery: 66,
      incorrectAttempts: 11,
      recurringMistakes: 3,
      summary: "Subject-verb agreement and proximity rule errors.",
      topicCode: "ERROR_DETECTION",
    },
  ];

  return (
    <GlobalShell>
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Link href="/analysis" className="text-xs text-text-muted hover:text-text">
            ← Analysis
          </Link>
          <span className="text-xs text-text-muted">•</span>
          <span className="text-xs font-bold text-accent font-mono uppercase">Priority Focus</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text">
          Weakness Center
        </h1>
        <p className="text-xs text-text-muted">
          Ranked worst-first. Launch targeted recovery sessions to close knowledge gaps.
        </p>
      </div>

      {/* Ranked Worst-First Cards */}
      <div className="space-y-4">
        {weaknesses.map((w) => (
          <Card key={w.id} variant="default" className="p-6 space-y-4 border-warning/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-warning">{w.id}</span>
                <div>
                  <h3 className="text-base font-bold text-text">{w.topic}</h3>
                  <span className="text-xs text-text-muted">{w.subject}</span>
                </div>
              </div>

              {/* Individual [ FIX THIS → ] Primary Accent CTA per wireframe §14 */}
              <Link href={`/practice?topic=${w.topicCode}`}>
                <Button variant="primary" size="md">
                  <span>FIX THIS →</span>
                </Button>
              </Link>
            </div>

            <p className="text-xs text-text leading-relaxed">{w.summary}</p>

            <div className="grid grid-cols-3 gap-3 p-3 bg-surface-2 rounded-btn border border-border text-xs font-mono">
              <div>
                <span className="text-text-muted">Mastery:</span>{" "}
                <strong className="text-warning">{w.mastery}%</strong>
              </div>
              <div>
                <span className="text-text-muted">Incorrect:</span>{" "}
                <strong className="text-text">{w.incorrectAttempts} Qs</strong>
              </div>
              <div>
                <span className="text-text-muted">Recurring:</span>{" "}
                <strong className="text-danger">{w.recurringMistakes} patterns</strong>
              </div>
            </div>

            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Topic Mastery Progress</span>
                <span className="font-bold text-text">{w.mastery}%</span>
              </div>
              <ProgressBar value={w.mastery} variant="warning" />
            </div>
          </Card>
        ))}
      </div>
    </GlobalShell>
  );
}
