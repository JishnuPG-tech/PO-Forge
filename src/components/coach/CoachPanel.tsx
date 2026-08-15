"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { Bot, Send, Sparkles, BookOpen, Check, PieChart } from "lucide-react";

export type CoachViewMode = "CHAT" | "WORKING" | "TEACHING";

export const CoachPanel: React.FC<{ initialMode?: CoachViewMode }> = ({
  initialMode = "TEACHING",
}) => {
  const [mode, setMode] = useState<CoachViewMode>(initialMode);
  const [teachingOption, setTeachingOption] = useState<number | null>(null);

  const quickActions = [
    "Explain my recent mistakes",
    "Teach Profit & Loss discount concept",
    "Practice Profit & Loss with me",
    "Analyze my IBPS RRB PO performance",
    "Search my notes for Ratio formulas",
    "Plan tomorrow's training target",
  ];

  return (
    <div className="space-y-4">
      {/* View Mode Switcher */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs font-mono text-text-muted">Coach Mode:</span>
        <div className="flex items-center gap-1 font-mono text-xs bg-surface border border-border p-1 rounded-btn">
          {(["CHAT", "WORKING", "TEACHING"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2.5 py-0.5 rounded cursor-pointer ${
                mode === m
                  ? "bg-accent-soft text-accent font-bold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {m === "CHAT" ? "Chat" : m === "WORKING" ? "Working State" : "Teaching Mode"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
        {/* Left Quick Actions Rail */}
        <div className="md:col-span-3 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted font-mono px-1">
            Quick Actions
          </span>
          <div className="space-y-1">
            {quickActions.map((act, i) => (
              <button
                key={i}
                onClick={() => setMode("CHAT")}
                className="w-full text-left p-2 bg-surface hover:bg-surface-2 border border-border rounded-btn text-xs text-text-muted hover:text-text transition-colors cursor-pointer"
              >
                → {act}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-7 space-y-3">
          {mode === "CHAT" && (
            <Card variant="default" className="p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3 text-xs">
                <div className="p-2.5 bg-surface-2 rounded-btn border border-border">
                  <span className="font-bold text-text font-mono">YOU: Why am I weak in Profit & Loss?</span>
                </div>

                <div className="p-3 bg-surface rounded-btn border border-border space-y-2.5">
                  <div className="flex items-center justify-between text-text-muted text-[11px] font-mono border-b border-border pb-1.5">
                    <span className="flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5 text-accent" />
                      <span>Hermes AI Coach</span>
                    </span>
                    <span className="text-accent font-bold">hermes-tutor-v1</span>
                  </div>

                  <p className="text-text leading-relaxed">
                    Your current Profit & Loss mastery is 58%. Across your last 43 attempts, most mistakes came from discount and marked-price percentage calculations.
                  </p>

                  <div className="p-2.5 bg-surface-2 border border-border rounded-btn flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-accent">SOURCE</span>
                      <p className="text-xs text-text">Quantitative Aptitude Notes • Page 42</p>
                    </div>
                    <Link href="/library/reader">
                      <Button variant="secondary" size="sm">
                        Open Source
                      </Button>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-mono text-text-muted">
                    <span>Based on 43 attempts • 58% mastery</span>
                    <Link href="/practice?topic=PROFIT_LOSS">
                      <Button variant="primary" size="sm">
                        Start 10-Q Recovery →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <input
                  type="text"
                  placeholder="Ask Hermes a question..."
                  className="flex-1 bg-surface-2 border border-border rounded-btn px-3 py-1.5 text-xs text-text focus:outline-none"
                />
                <Button variant="primary" size="sm">
                  Send
                </Button>
              </div>
            </Card>
          )}

          {mode === "WORKING" && (
            <Card variant="default" className="p-5 space-y-4 max-w-sm mx-auto border-accent/30">
              <div className="flex items-center gap-2 text-xs font-bold text-text border-b border-border pb-2">
                <Sparkles className="w-4 h-4 text-accent animate-spin" />
                <span>AI Coach is Working</span>
              </div>

              <div className="space-y-2 font-mono text-xs text-text">
                <div className="flex items-center gap-2 text-success">
                  <Check className="w-3.5 h-3.5" />
                  <span>Checking recent attempts</span>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <Check className="w-3.5 h-3.5" />
                  <span>Checking topic mastery</span>
                </div>
                <div className="flex items-center gap-2 text-warning">
                  <PieChart className="w-3.5 h-3.5 animate-pulse" />
                  <span>Searching your notes</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <div className="w-3.5 h-3.5 rounded-full border border-border" />
                  <span>Building recommendation</span>
                </div>
              </div>
            </Card>
          )}

          {mode === "TEACHING" && (
            <Card variant="default" className="p-5 space-y-4 border-accent/30">
              <div className="space-y-0.5 border-b border-border pb-2">
                <span className="text-[11px] font-mono font-bold uppercase text-accent">Interactive Lesson</span>
                <h3 className="text-base font-bold text-text">TEACH: PERCENTAGE</h3>
              </div>

              <div className="space-y-2.5 text-xs text-text leading-relaxed font-mono">
                <div>
                  <strong className="text-accent uppercase text-[11px]">STEP 1: Understand Percentage Increase</strong>
                  <p className="mt-0.5 text-text-muted">
                    To increase a quantity by X%, multiply it by (1 + X/100).
                  </p>
                </div>

                <div className="p-2.5 bg-surface-2 border border-border rounded-btn">
                  <strong className="text-text font-bold">EXAMPLE:</strong>
                  <p className="mt-0.5 text-text-muted">
                    Increase 200 by 15% = 200 * 1.15 = 230.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <strong className="text-warning uppercase text-[11px]">QUICK CHECK:</strong>
                  <p className="text-text font-semibold">What is 20% of 250?</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "A", val: 40 },
                      { label: "B", val: 50 },
                      { label: "C", val: 60 },
                      { label: "D", val: 70 },
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setTeachingOption(i)}
                        className={`p-2 rounded-btn border text-xs font-mono font-bold cursor-pointer ${
                          teachingOption === i
                            ? i === 1
                              ? "bg-success-soft border-success text-success"
                              : "bg-danger-soft border-danger text-danger"
                            : "bg-surface border-border hover:border-text-muted"
                        }`}
                      >
                        {opt.val}
                      </button>
                    ))}
                  </div>
                  {teachingOption === 1 && (
                    <div className="text-success text-[11px] font-bold">✓ Correct! 20% of 250 = 50.</div>
                  )}
                </div>
              </div>

              {/* 4 Secondary/Ghost Buttons (Acceptable exception per wireframe §24) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
                <Button variant="secondary" size="sm">
                  I Understand
                </Button>
                <Button variant="secondary" size="sm">
                  Give Another Example
                </Button>
                <Button variant="secondary" size="sm">
                  Test Me
                </Button>
                <Button variant="ghost" size="sm">
                  Simplify
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
