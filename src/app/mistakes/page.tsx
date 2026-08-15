"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, ProgressBar, Badge } from "@/components/ui";
import { AlertCircle, ChevronDown, ChevronUp, Check, RotateCcw, Lightbulb } from "lucide-react";

export interface MistakeItem {
  id: string;
  topic: string;
  type: string;
  userAnswer: string;
  correctAnswer: string;
  previousSimilar: number;
  why: string;
  steps: string[];
  remember: string;
}

export default function MistakeBookPage() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>("QNT-001284");

  const mistakeDistribution = [
    { type: "Concept Error", count: 92, percent: 37, color: "danger" },
    { type: "Calculation Error", count: 54, percent: 22, color: "warning" },
    { type: "Careless Error", count: 43, percent: 17, color: "accent" },
    { type: "Time Pressure", count: 31, percent: 13, color: "accent" },
    { type: "Misread", count: 18, percent: 7, color: "neutral" },
    { type: "Guess", count: 9, percent: 4, color: "neutral" },
  ];

  const mistakes: MistakeItem[] = [
    {
      id: "QNT-001284",
      topic: "Profit & Loss",
      type: "Concept Error",
      userAnswer: "B (18%)",
      correctAnswer: "D (21%)",
      previousSimilar: 4,
      why: "You treated marked price as cost price when applying the 15% discount.",
      steps: [
        "Step 1: Let Cost Price (CP) = ₹100",
        "Step 2: Marked Price (MP) = 40% above CP = ₹140",
        "Step 3: Selling Price (SP) = 140 - 15% of 140 = ₹119",
        "Step 4: Profit % = 119 - 100 = 19%",
      ],
      remember: "Discount is always calculated on Marked Price (MP), not Cost Price.",
    },
    {
      id: "QNT-000942",
      topic: "Ratio & Proportion",
      type: "Careless Error",
      userAnswer: "A (₹2,000)",
      correctAnswer: "B (₹3,000)",
      previousSimilar: 2,
      why: "Calculated share A instead of the difference between shares A and B.",
      steps: [
        "Difference in ratio parts = 5 - 3 = 2 parts",
        "Total ratio parts = 5 + 3 = 8 parts",
        "Difference = (2/8) * 12000 = ₹3,000",
      ],
      remember: "Re-read question stem to verify if asking for individual share or share difference.",
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <GlobalShell>
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text">
          Mistake Book
        </h1>
        <div className="flex items-center gap-4 text-xs font-mono text-text-muted">
          <span>Total: <strong className="text-text">247</strong></span>
          <span>Unresolved: <strong className="text-warning">61</strong></span>
          <span>Recovered: <strong className="text-success">186</strong></span>
        </div>
      </div>

      {/* Mistake Type Distribution Horizontal Bars */}
      <Card variant="default" className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-text border-b border-border pb-2">
          Mistake Category Breakdown
        </h3>

        <div className="space-y-2.5 font-mono text-xs">
          {mistakeDistribution.map((m) => (
            <div key={m.type} className="space-y-1">
              <div className="flex justify-between">
                <span>{m.type}</span>
                <span className="font-bold text-text">{m.count} ({m.percent}%)</span>
              </div>
              <ProgressBar
                value={m.percent}
                variant={
                  m.color === "danger"
                    ? "danger"
                    : m.color === "warning"
                    ? "warning"
                    : "accent"
                }
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs scrollbar-none">
        {["ALL", "Concept", "Calculation", "Careless"].map((flt) => (
          <button
            key={flt}
            onClick={() => setActiveFilter(flt)}
            className={`px-3 py-1.5 rounded-btn border transition-colors cursor-pointer ${
              activeFilter === flt
                ? "bg-accent-soft text-accent font-bold border-accent/40"
                : "bg-surface text-text-muted border-border hover:text-text"
            }`}
          >
            {flt}
          </button>
        ))}
      </div>

      {/* Mistake List with INLINE ACCORDION EXPANSION (§17) */}
      <div className="space-y-3">
        {mistakes.map((m) => {
          const isExpanded = expandedId === m.id;
          return (
            <Card key={m.id} variant="default" className="p-4 space-y-3">
              <div
                onClick={() => toggleExpand(m.id)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-text">{m.id}</span>
                  <span className="text-xs text-text-muted">• {m.topic}</span>
                  <Badge
                    variant={m.type === "Concept Error" ? "danger" : "warning"}
                    label={m.type}
                  />
                </div>

                <Button variant="ghost" size="sm">
                  <span>{isExpanded ? "Hide ▲" : "View ▾"}</span>
                </Button>
              </div>

              {/* Expanded Inline Accordion (§17 - same screen, NO route change!) */}
              {isExpanded && (
                <div className="pt-3 border-t border-border space-y-4 text-xs animate-in fade-in duration-150">
                  <div className="grid grid-cols-3 gap-2 font-mono p-3 bg-surface-2 rounded-btn border border-border">
                    <div>
                      Your answer: <strong className="text-danger">{m.userAnswer}</strong>
                    </div>
                    <div>
                      Correct: <strong className="text-success">{m.correctAnswer}</strong>
                    </div>
                    <div>
                      Previous similar: <strong className="text-text">{m.previousSimilar}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-bold uppercase font-mono text-danger text-[11px]">
                        WHY:
                      </span>
                      <p className="mt-0.5 text-text leading-relaxed">{m.why}</p>
                    </div>

                    <div>
                      <span className="font-bold uppercase font-mono text-accent text-[11px]">
                        HOW TO SOLVE:
                      </span>
                      <div className="mt-1 space-y-1 font-mono bg-surface-2 border border-border p-3 rounded-btn text-text">
                        {m.steps.map((s, idx) => (
                          <div key={idx}>{s}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold uppercase font-mono text-warning text-[11px]">
                        REMEMBER:
                      </span>
                      <p className="mt-0.5 text-text bg-warning-soft border border-warning/20 p-2.5 rounded-btn">
                        💡 {m.remember}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                    <Link href={`/practice?q=${m.id}`}>
                      <Button variant="primary" size="sm">
                        Retry
                      </Button>
                    </Link>
                    <Link href="/coach">
                      <Button variant="secondary" size="sm">
                        Review Concept
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => alert("Marked Recovered")}>
                      Mark Recovered
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </GlobalShell>
  );
}
