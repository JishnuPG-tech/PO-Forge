"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, Skeleton, Badge } from "@/components/ui";
import { analyticsApi, AnalyticsResponse } from "@/lib/api";
import { RefreshCw, AlertTriangle, RotateCw, CheckCircle2, Flame, Brain, Sparkles, Layers, Volume2 } from "lucide-react";

export type RevisionTab = "FLASHCARDS" | "DUE_TODAY" | "UPCOMING" | "RECOVERED";

interface FlashcardItem {
  id: string;
  subject: "QUANT" | "REASONING" | "ENGLISH" | "GA_BANKING";
  topicName: string;
  frontQuestion: string;
  backFormula: string;
  examTrick: string;
  intervalDays: number;
  decayDays: number;
}

const FORMULA_FLASHCARDS_DECK: FlashcardItem[] = [
  {
    id: "f1",
    subject: "QUANT",
    topicName: "Profit, Loss & Discount",
    frontQuestion: "What is the formula for Equivalent Discount rate of two successive discounts d₁% and d₂%?",
    backFormula: "Equivalent Discount % = ( d₁ + d₂ - (d₁ × d₂ / 100) ) %",
    examTrick: "Don't just add percentages! e.g. Successive discounts of 20% and 10% = 28% total discount, not 30%.",
    intervalDays: 1,
    decayDays: 2,
  },
  {
    id: "f2",
    subject: "QUANT",
    topicName: "Simple & Compound Interest",
    frontQuestion: "What is the direct shortcut formula for the difference between CI and SI for 2 years?",
    backFormula: "Difference (CI - SI) = P × ( R / 100 )²",
    examTrick: "For 3 years: Difference = P × (R/100)² × (300 + R) / 100.",
    intervalDays: 2,
    decayDays: 3,
  },
  {
    id: "f3",
    subject: "QUANT",
    topicName: "Time, Speed & Distance",
    frontQuestion: "How do you calculate Average Speed for a journey of equal distance traveled at speed X and speed Y?",
    backFormula: "Average Speed = ( 2 × X × Y ) / ( X + Y )",
    examTrick: "Average speed is NOT the simple arithmetic average (X + Y) / 2 unless time spent is identical!",
    intervalDays: 1,
    decayDays: 1,
  },
  {
    id: "f4",
    subject: "QUANT",
    topicName: "Boats & Streams",
    frontQuestion: "If Downstream speed = D and Upstream speed = U, what is Boat Speed in Still Water (B) and Stream Speed (S)?",
    backFormula: "Boat Speed (B) = (D + U) / 2  |  Stream Speed (S) = (D - U) / 2",
    examTrick: "Downstream speed is always greater than Upstream speed (D = B + S, U = B - S).",
    intervalDays: 3,
    decayDays: 4,
  },
  {
    id: "f5",
    subject: "QUANT",
    topicName: "Mensuration 2D & 3D",
    frontQuestion: "What is the Total Surface Area (TSA) and Volume of a Right Circular Cylinder with radius r and height h?",
    backFormula: "TSA = 2πr(h + r)  |  Volume = πr²h",
    examTrick: "Curved Surface Area (CSA) is 2πrh. TSA = CSA + 2 × Circular Base Area (2πr²).",
    intervalDays: 2,
    decayDays: 2,
  },
  {
    id: "f6",
    subject: "REASONING",
    topicName: "Syllogism (Only a few)",
    frontQuestion: "What does the statement 'Only a few A are B' mean in modern Syllogism?",
    backFormula: "It means BOTH 'Some A are B' AND 'Some A are NOT B' simultaneously!",
    examTrick: "'All A can be B' is ALWAYS FALSE! However, 'All B can be A' is POSSIBLE unless restricted.",
    intervalDays: 1,
    decayDays: 1,
  },
  {
    id: "f7",
    subject: "REASONING",
    topicName: "Blood Relations",
    frontQuestion: "How should you decode Coded Blood Relations like 'A + B means A is father of B'?",
    backFormula: "Draw a 3-generation family tree: Use (+) for male, (-) for female, (=) for married couples, (|) for child.",
    examTrick: "Always check gender of the subject first before evaluating full options to eliminate 50% choices instantly.",
    intervalDays: 3,
    decayDays: 3,
  },
  {
    id: "f8",
    subject: "GA_BANKING",
    topicName: "RBI Policies & Monetary Terms",
    frontQuestion: "What is the difference between Repo Rate and Reverse Repo Rate?",
    backFormula: "Repo Rate = Rate at which RBI lends money to commercial banks. Reverse Repo Rate = Rate at which RBI borrows from banks.",
    examTrick: "Repo Rate is always HIGHER than Reverse Repo Rate!",
    intervalDays: 2,
    decayDays: 2,
  },
];

export default function RevisionPage() {
  const [activeTab, setActiveTab] = useState<RevisionTab>("FLASHCARDS");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [warmupSeconds, setWarmupSeconds] = useState(300); // 5-minute warmup timer
  const [reviewedCount, setReviewedCount] = useState(0);

  // Backend API states
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
      console.warn("Failed to load revision analytics:", e);
      setErrorMsg(e.message || "Unable to connect to POForge backend service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Warmup timer
  useEffect(() => {
    const timer = setInterval(() => {
      setWarmupSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: Space to flip card, ArrowRight to next card
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === "ArrowRight") {
        handleNextCard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCardIndex]);

  const currentCard = FORMULA_FLASHCARDS_DECK[currentCardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setReviewedCount((prev) => prev + 1);
    setCurrentCardIndex((prev) => (prev + 1) % FORMULA_FLASHCARDS_DECK.length);
  };

  const handleRating = (difficulty: "AGAIN" | "HARD" | "GOOD" | "EASY") => {
    handleNextCard();
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <GlobalShell>
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text">
            Revision Center & Rapid Formula Deck
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-[10px] font-mono text-accent font-bold">
            SuperMemo SM-2 Engine
          </span>
        </div>
        <p className="text-xs text-text-muted">
          5-Minute 3D Rapid Flip-Card warmups. Reviewing formulas & shortcuts prevents memory decay before mock exams.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-1.5 border-b border-border overflow-x-auto pb-1.5 font-mono text-xs scrollbar-none">
        {[
          { id: "FLASHCARDS", label: "⚡ 5-Min Rapid Formula Deck", icon: Flame },
          { id: "DUE_TODAY", label: "Due Today (12)", icon: Layers },
          { id: "UPCOMING", label: "Upcoming Queue", icon: Brain },
          { id: "RECOVERED", label: "Mastered Formulas", icon: CheckCircle2 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as RevisionTab)}
              className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap font-bold ${
                isActive
                  ? "bg-accent text-white border-accent shadow-md"
                  : "bg-[#1A1917] border-[#262422] text-text-muted hover:text-text hover:bg-surface-2"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

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

      {/* Loading Skeleton */}
      {isLoading ? (
        <Card variant="default" className="p-6 space-y-4 max-w-xl mx-auto">
          <Skeleton className="w-1/3 h-6" />
          <Skeleton className="w-full h-24" />
        </Card>
      ) : (
        <>
          {/* TAB 1: 5-MINUTE RAPID 3D FLIP-CARD FORMULA DECK */}
          {activeTab === "FLASHCARDS" && (
            <div className="space-y-5 max-w-3xl mx-auto font-mono">
              {/* Warmup Header Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1A1917] p-3.5 rounded-2xl border border-[#262422]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text">5-Minute Pre-Mock Formula Warmup</div>
                    <div className="text-[11px] text-text-muted">
                      Card {currentCardIndex + 1} of {FORMULA_FLASHCARDS_DECK.length} • Reviewed {reviewedCount} Cards
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="px-3 py-1 bg-[#121110] border border-[#262422] rounded-xl text-xs font-bold text-[#E58038] flex items-center gap-1.5">
                    <span>⏱️ Warmup Timer:</span>
                    <span className="font-mono text-sm">{formatTimer(warmupSeconds)}</span>
                  </div>
                </div>
              </div>

              {/* 3D FLIP-CARD CONTAINER */}
              <div className="perspective-[1200px] cursor-pointer touch-manipulation" onClick={() => setIsFlipped(!isFlipped)}>
                <div
                  className={`relative w-full min-h-[300px] sm:min-h-[320px] transition-transform duration-500 transform-style-3d rounded-2xl border ${
                    isFlipped
                      ? "rotate-y-180 bg-[#161f18] border-emerald-800/60 shadow-emerald-950/40"
                      : "bg-[#181715] border-[#383530] shadow-xl hover:border-[#E58038]"
                  } p-4 sm:p-6 md:p-8 flex flex-col justify-between shadow-2xl`}
                >
                  {/* Card Front Side */}
                  {!isFlipped ? (
                    <div className="space-y-4 sm:space-y-6 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between border-b border-[#262422] pb-3 gap-2">
                        <span className="text-xs font-bold text-[#E58038] uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                          <span>
                            {currentCard.subject === "QUANT" && "📐 Quantitative Aptitude"}
                            {currentCard.subject === "REASONING" && "🧩 Reasoning Ability"}
                            {currentCard.subject === "GA_BANKING" && "🏦 GA / Banking"}
                          </span>
                          <span>• {currentCard.topicName}</span>
                        </span>


                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A1917] border border-[#262422] text-text-muted font-mono">
                          Press SPACE or Click to Flip
                        </span>
                      </div>

                      <div className="space-y-3 my-auto py-4">
                        <span className="text-xs text-text-muted uppercase tracking-wider font-bold">
                          FORMULA CHALLENGE PROMPT:
                        </span>
                        <h2 className="text-base md:text-xl font-bold text-text leading-relaxed font-sans">
                          {currentCard.frontQuestion}
                        </h2>
                      </div>

                      <div className="flex items-center justify-between border-t border-[#262422] pt-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1 text-[#E58038]">
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Tap anywhere to flip card & view formula remedy</span>
                        </span>
                        <span>SM-2 Interval: {currentCard.intervalDays}d</span>
                      </div>
                    </div>
                  ) : (
                    /* Card Back Side */
                    <div className="space-y-5 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Formula Solution & Exam Remedy</span>
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-mono">
                          Back Side Verified ✓
                        </span>
                      </div>

                      <div className="space-y-4 my-auto py-2">
                        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            ⚡ EXACT EXAM FORMULA / SHORTCUT:
                          </span>
                          <div className="text-sm md:text-base font-extrabold text-emerald-300 font-mono leading-relaxed">
                            {currentCard.backFormula}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                            ⚠️ EXAM TRICK / COMMON TRAP:
                          </span>
                          <div className="text-xs text-amber-200 font-sans leading-relaxed">
                            {currentCard.examTrick}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-emerald-800/40 pt-3 text-xs text-emerald-400">
                        <span>Rate your recollection accuracy below to schedule next SM-2 interval:</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SM-2 RECOLLECTION RATING BUTTONS */}
              <div className="p-4 bg-[#1A1917] border border-[#262422] rounded-2xl space-y-3">
                <div className="text-xs font-bold text-text-muted text-center uppercase tracking-wider">
                  How easily did you recall this formula? (SM-2 Interval Rating):
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleRating("AGAIN")}
                    className="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-400 font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  >
                    <span>🔴 Again</span>
                    <span className="text-[10px] font-normal text-red-300/70">1d interval</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRating("HARD")}
                    className="p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-amber-400 font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  >
                    <span>🟠 Hard</span>
                    <span className="text-[10px] font-normal text-amber-300/70">3d interval</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRating("GOOD")}
                    className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-400 font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  >
                    <span>🟢 Good</span>
                    <span className="text-[10px] font-normal text-emerald-300/70">6d interval</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRating("EASY")}
                    className="p-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 text-blue-400 font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5"
                  >
                    <span>🔵 Easy</span>
                    <span className="text-[10px] font-normal text-blue-300/70">14d interval</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DUE TODAY QUEUE */}
          {activeTab === "DUE_TODAY" && (
            <Card variant="mission" className="p-6 space-y-5 max-w-xl mx-auto font-mono">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  SuperMemo SM-2 Due Queue
                </span>
                <span className="text-xs text-text-muted">12 Questions Total</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { topic: "Ratio & Proportion", count: 4 },
                  { topic: "Profit & Loss", count: 5 },
                  { topic: "Error Detection", count: 3 },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-surface-2 rounded-btn border border-border"
                  >
                    <span className="font-medium text-text">{item.topic}</span>
                    <span className="text-text-muted font-bold">{item.count} questions</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link href="/practice?mode=revision">
                  <Button variant="primary" size="lg" fullWidth className="font-bold">
                    <span>Start Due Queue Session →</span>
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* TAB 3: UPCOMING QUEUE */}
          {activeTab === "UPCOMING" && (
            <Card variant="default" className="p-6 space-y-4 max-w-xl mx-auto font-mono">
              <h3 className="text-sm font-bold text-text border-b border-border pb-2">
                Upcoming Revisions
              </h3>
              <div className="space-y-2 text-xs text-text-muted">
                {[
                  { topic: "Syllogisms", status: "Due Tomorrow (5 Qs)" },
                  { topic: "Simplification", status: "Due in 3 days (8 Qs)" },
                ].map((u, i) => (
                  <div key={i} className="flex justify-between p-2.5 bg-surface-2 rounded-btn border border-border">
                    <span className="text-text font-medium">{u.topic}</span>
                    <span>{u.status}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 4: MASTERED FORMULAS */}
          {activeTab === "RECOVERED" && (
            <Card variant="default" className="p-6 space-y-4 max-w-xl mx-auto font-mono">
              <h3 className="text-sm font-bold text-text border-b border-border pb-2">
                Mastered Concepts (SM-2 Retention &gt; 21 Days)
              </h3>
              <p className="text-xs text-text-muted font-mono">
                Topics with high memory retention and zero decay risk.
              </p>
            </Card>
          )}
        </>
      )}
    </GlobalShell>
  );
}
