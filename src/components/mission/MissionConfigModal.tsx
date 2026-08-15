"use client";

import React, { useState } from "react";
import { Button, Card } from "@/components/ui";
import { X, Check, Lock, Unlock, Sparkles, BookOpen, Brain, Calculator, Landmark, Search, Filter } from "lucide-react";
import { missionsApi } from "@/lib/api";

export interface MissionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (config: any) => void;
}

export interface TopicItem {
  id: string;
  name: string;
  subjectCode: "QUANT" | "REASONING" | "ENGLISH" | "GA_BANKING";
  enabled: boolean;
  isLocked: boolean;
  targetCount: number;
  accuracyPct: number;
  decayDays: number;
}

export const EXHAUSTIVE_BANKING_TOPICS: TopicItem[] = [
  // 📐 QUANTITATIVE APTITUDE (17 Topics)
  { id: "q1", name: "Simplification & Approximation", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 10, accuracyPct: 88, decayDays: 1 },
  { id: "q2", name: "Quadratic Equations & Polynomials", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 84, decayDays: 2 },
  { id: "q3", name: "Missing Number Series", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 79, decayDays: 3 },
  { id: "q4", name: "Wrong Number Series", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 71, decayDays: 4 },
  { id: "q5", name: "Data Interpretation — Bar Graph", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 65, decayDays: 4 },
  { id: "q6", name: "Data Interpretation — Pie Chart", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 62, decayDays: 3 },
  { id: "q7", name: "Data Interpretation — Table Chart", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 70, decayDays: 2 },
  { id: "q8", name: "Data Interpretation — Caselet & Radar", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 58, decayDays: 5 },
  { id: "q9", name: "Profit, Loss & Discount", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 8, accuracyPct: 58, decayDays: 5 },
  { id: "q10", name: "Simple & Compound Interest", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 72, decayDays: 2 },
  { id: "q11", name: "Time, Speed & Distance / Trains & Boats", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 68, decayDays: 3 },
  { id: "q12", name: "Work & Time / Pipes & Cisterns", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 75, decayDays: 2 },
  { id: "q13", name: "Ages & Averages", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 82, decayDays: 1 },
  { id: "q14", name: "Ratio & Proportion / Partnership", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 76, decayDays: 2 },
  { id: "q15", name: "Mixture & Alligation", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 64, decayDays: 4 },
  { id: "q16", name: "Permutation, Combination & Probability", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 60, decayDays: 5 },
  { id: "q17", name: "Mensuration 2D & 3D", subjectCode: "QUANT", enabled: true, isLocked: false, targetCount: 4, accuracyPct: 74, decayDays: 3 },

  // 🧩 REASONING ABILITY (16 Topics)
  { id: "r1", name: "Syllogism (Only/A few, Possibility)", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 90, decayDays: 1 },
  { id: "r2", name: "Inequality (Direct & Coded)", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 92, decayDays: 1 },
  { id: "r3", name: "Circular Seating Arrangement (In/Out)", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 70, decayDays: 3 },
  { id: "r4", name: "Linear Seating Arrangement (Parallel Rows)", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 72, decayDays: 2 },
  { id: "r5", name: "Square/Rectangular Seating Arrangement", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 68, decayDays: 3 },
  { id: "r6", name: "Floor & Flat Puzzles", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 65, decayDays: 4 },
  { id: "r7", name: "Month & Date Puzzles", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 67, decayDays: 3 },
  { id: "r8", name: "Box & Matrix Puzzles", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 62, decayDays: 5 },
  { id: "r9", name: "Scheduling & Day Puzzles", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 75, decayDays: 2 },
  { id: "r10", name: "Blood Relations (Family Tree)", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 86, decayDays: 2 },
  { id: "r11", name: "Direction & Distance", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 4, accuracyPct: 88, decayDays: 1 },
  { id: "r12", name: "Coding-Decoding (Chinese/New Pattern)", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 80, decayDays: 2 },
  { id: "r13", name: "Input-Output (Machine Arrangement)", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 64, decayDays: 4 },
  { id: "r14", name: "Order & Ranking / Alphabet Test", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 4, accuracyPct: 84, decayDays: 1 },
  { id: "r15", name: "Logical / Critical Reasoning", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 60, decayDays: 5 },
  { id: "r16", name: "Data Sufficiency (Reasoning)", subjectCode: "REASONING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 74, decayDays: 3 },

  // 📖 ENGLISH LANGUAGE (9 Topics)
  { id: "e1", name: "Reading Comprehension (Passage & Vocab)", subjectCode: "ENGLISH", enabled: true, isLocked: false, targetCount: 8, accuracyPct: 78, decayDays: 2 },
  { id: "e2", name: "Cloze Test", subjectCode: "ENGLISH", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 82, decayDays: 2 },
  { id: "e3", name: "Error Spotting & Sentence Correction", subjectCode: "ENGLISH", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 71, decayDays: 3 },
  { id: "e4", name: "Para Jumbles & Sentence Rearrangement", subjectCode: "ENGLISH", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 69, decayDays: 4 },
  { id: "e5", name: "Fillers (Single, Double & Column)", subjectCode: "ENGLISH", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 80, decayDays: 2 },
  { id: "e6", name: "Phrase Replacement & Idioms", subjectCode: "ENGLISH", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 83, decayDays: 1 },
  { id: "e7", name: "Word Swap & Word Usage", subjectCode: "ENGLISH", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 86, decayDays: 1 },
  { id: "e8", name: "Match the Column", subjectCode: "ENGLISH", enabled: true, isLocked: false, targetCount: 4, accuracyPct: 76, decayDays: 2 },
  { id: "e9", name: "Sentence Improvement", subjectCode: "ENGLISH", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 79, decayDays: 2 },

  // 🏦 GENERAL & BANKING AWARENESS (10 Topics)
  { id: "g1", name: "Banking & Financial Terms (Repo, CRR, SLR)", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 6, accuracyPct: 80, decayDays: 2 },
  { id: "g2", name: "RBI Policy, Circulars & Notifications", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 76, decayDays: 3 },
  { id: "g3", name: "Current Affairs (National & International)", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 8, accuracyPct: 88, decayDays: 1 },
  { id: "g4", name: "Union Budget, Economic Survey & GST", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 4, accuracyPct: 65, decayDays: 5 },
  { id: "g5", name: "Government Schemes & Financial Sector", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 74, decayDays: 3 },
  { id: "g6", name: "Capital Market & Stock Exchange", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 4, accuracyPct: 72, decayDays: 4 },
  { id: "g7", name: "International Organizations & HQs", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 4, accuracyPct: 82, decayDays: 2 },
  { id: "g8", name: "Important Days, Summits & Awards", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 5, accuracyPct: 86, decayDays: 1 },
  { id: "g9", name: "Static GK (Parks, Sanctuaries, Dams)", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 4, accuracyPct: 84, decayDays: 2 },
  { id: "g10", name: "Financial & Insurance Awareness", subjectCode: "GA_BANKING", enabled: true, isLocked: false, targetCount: 4, accuracyPct: 78, decayDays: 3 },
];

export const MissionConfigModal: React.FC<MissionConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"QUANT" | "REASONING" | "ENGLISH" | "GA_BANKING">("QUANT");

  const [enabledSubjects, setEnabledSubjects] = useState<Record<string, boolean>>({
    QUANT: true,
    REASONING: true,
    ENGLISH: true,
    GA_BANKING: true,
  });

  const [topicsList, setTopicsList] = useState<TopicItem[]>(EXHAUSTIVE_BANKING_TOPICS);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllTopicsView, setShowAllTopicsView] = useState(false);
  const [isAiOptimized, setIsAiOptimized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleSubjectActive = (subjectCode: string) => {
    setEnabledSubjects((prev) => ({ ...prev, [subjectCode]: !prev[subjectCode] }));
  };

  const toggleTopicEnabled = (topicId: string) => {
    setTopicsList((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const toggleTopicLock = (topicId: string) => {
    setTopicsList((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, isLocked: !t.isLocked } : t))
    );
  };

  const updateTargetCount = (topicId: string, count: number) => {
    setTopicsList((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, targetCount: Math.max(0, count) } : t))
    );
  };

  const handleAiAutoOptimize = () => {
    setIsAiOptimized(true);
    setTopicsList((prev) =>
      prev.map((t) => {
        if (!enabledSubjects[t.subjectCode]) return t;
        if (t.accuracyPct < 70) {
          return { ...t, enabled: true, isLocked: false, targetCount: Math.max(t.targetCount, 8) };
        }
        if (t.accuracyPct >= 90) {
          return { ...t, enabled: false, isLocked: true, targetCount: 3 };
        }
        return { ...t, enabled: true, isLocked: false };
      })
    );

    setTimeout(() => setIsAiOptimized(false), 4000);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const totalQuant = topicsList
        .filter((t) => t.subjectCode === "QUANT" && enabledSubjects["QUANT"] && t.enabled && !t.isLocked)
        .reduce((sum, t) => sum + t.targetCount, 0);

      await missionsApi.updateMissionConfig({
        subject_code: "QUANT",
        target_count: totalQuant || 40,
      });

      localStorage.setItem("poforge_quant_target", totalQuant.toString());
      localStorage.setItem("poforge_enabled_subjects", JSON.stringify(enabledSubjects));
      localStorage.setItem("poforge_topics_config", JSON.stringify(topicsList));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }

      if (onSave) onSave({ topicsList, enabledSubjects, totalQuant });
      onClose();
    } catch (e) {
      console.warn("Failed to save mission config:", e);
      if (onSave) onSave({ topicsList, enabledSubjects });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const subjectTabs = [
    { code: "QUANT", label: "Quantitative Aptitude", icon: Calculator, count: 17 },
    { code: "REASONING", label: "Reasoning Ability", icon: Brain, count: 16 },
    { code: "ENGLISH", label: "English Language", icon: BookOpen, count: 9 },
    { code: "GA_BANKING", label: "General & Banking", icon: Landmark, count: 10 },
  ] as const;

  const currentTabTopics = topicsList.filter(
    (t) =>
      t.subjectCode === activeTab &&
      (searchQuery.trim() === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalActiveTargetQuestions = topicsList
    .filter((t) => enabledSubjects[t.subjectCode] && t.enabled && !t.isLocked)
    .reduce((sum, t) => sum + t.targetCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container — MAXIMIZED SPACE FOR TOPIC CARDS (h-[92vh]) */}
      <Card className="relative w-full max-w-5xl bg-[#121110] border border-[#2B2825] rounded-2xl p-4 md:p-5 space-y-3.5 z-10 shadow-2xl overflow-hidden h-[92vh] flex flex-col font-sans">
        
        {/* COMPACT LINE 1: Header Title & Close Button */}
        <div className="flex items-center justify-between border-b border-[#262422] pb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-bold text-text tracking-tight">
              CUSTOMIZE TODAY'S PREPARATION SYLLABUS
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#332218] border border-[#52331F] text-[10px] font-mono text-[#E58038] font-bold">
              52 Exam Topics Included
            </span>
          </div>

          <button onClick={onClose} className="p-1 text-text-muted hover:text-text rounded-btn cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COMPACT LINE 2: Subject Selector Badges & Hermes AI Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#1A1917] p-2.5 rounded-xl border border-[#262422]">
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-text-muted font-bold text-[11px] uppercase mr-1">Active Subjects:</span>
            {subjectTabs.map((sub) => {
              const isSubEnabled = enabledSubjects[sub.code];
              const Icon = sub.icon;
              return (
                <button
                  key={sub.code}
                  type="button"
                  onClick={() => toggleSubjectActive(sub.code)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSubEnabled
                      ? "bg-[#332218] text-[#E58038] border-[#52331F]"
                      : "bg-[#141312] text-text-muted border-[#262422] opacity-40 line-through"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label.split(" ")[0]}</span>
                  {isSubEnabled && <Check className="w-3 h-3 text-[#E58038]" />}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAiAutoOptimize}
            className="px-3 py-1 bg-[#262422] hover:bg-[#302D2A] border border-[#383530] rounded-lg text-xs font-bold text-[#E58038] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiOptimized ? "Optimized ✓" : "Hermes AI Auto-Optimize"}</span>
          </button>
        </div>

        {/* COMPACT LINE 3: Subject Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262422] pb-2 text-xs font-mono">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {subjectTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.code;
              const isSubEnabled = enabledSubjects[tab.code];

              return (
                <button
                  key={tab.code}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.code as any);
                    setShowAllTopicsView(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive && !showAllTopicsView
                      ? "bg-[#E58038] text-white border-[#E58038] font-bold"
                      : "bg-[#1A1917] border-[#262422] text-[#A39E98] hover:text-text"
                  } ${!isSubEnabled ? "opacity-50" : ""}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label.split(" ")[0]} ({tab.count})</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowAllTopicsView(!showAllTopicsView)}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                showAllTopicsView
                  ? "bg-[#E58038] text-white border-[#E58038]"
                  : "bg-[#1A1917] border-[#262422] text-[#E58038] hover:bg-[#262422]"
              }`}
            >
              {showAllTopicsView ? "Viewing All 52 Topics" : "Show All 52 Topics"}
            </button>
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full bg-[#1A1917] border border-[#262422] rounded-lg pl-7 pr-2 py-1 text-xs text-text placeholder:text-[#66625D] focus:outline-none focus:border-[#E58038]"
            />
          </div>
        </div>

        {/* 80% HEIGHT CONTAINER FOR TOPICS GRID */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-sans">
          {(showAllTopicsView ? ["QUANT", "REASONING", "ENGLISH", "GA_BANKING"] as const : [activeTab]).map(
            (subCode) => {
              const subTopics = topicsList.filter(
                (t) =>
                  t.subjectCode === subCode &&
                  (searchQuery.trim() === "" || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
              );

              if (subTopics.length === 0) return null;

              const isSubActive = enabledSubjects[subCode];

              return (
                <div key={subCode} className="space-y-2">
                  {/* Subject Section Header Banner */}
                  <div className="flex items-center justify-between bg-[#1A1917] px-3 py-1.5 rounded-lg border border-[#262422] text-xs font-mono">
                    <span className="font-bold text-[#E58038] flex items-center gap-2">
                      <span>
                        {subCode === "QUANT" && "📐 QUANTITATIVE APTITUDE"}
                        {subCode === "REASONING" && "🧩 REASONING ABILITY"}
                        {subCode === "ENGLISH" && "📖 ENGLISH LANGUAGE"}
                        {subCode === "GA_BANKING" && "🏦 GENERAL & BANKING AWARENESS"}
                      </span>
                      <span className="text-text-muted font-normal">({subTopics.length} Topics)</span>
                    </span>
                    {!isSubActive && (
                      <span className="text-red-400 text-[11px] font-bold">⚠️ Subject Disabled for Today</span>
                    )}
                  </div>

                  {/* Spacious 2-Column Responsive Card Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono">
                    {subTopics.map((top) => {
                      const isSelected = isSubActive && top.enabled && !top.isLocked;

                      return (
                        <div
                          key={top.id}
                          className={`p-3 rounded-xl border transition-all space-y-2.5 ${
                            top.isLocked
                              ? "bg-[#181715]/40 border-[#262422] opacity-50"
                              : isSelected
                              ? "bg-[#251A12] border-[#52331F] text-text shadow-md"
                              : "bg-[#1A1917] border-[#262422] text-[#A39E98] hover:border-[#383530]"
                          }`}
                        >
                          {/* Row 1: Checkbox + Topic Name + Lock Toggle */}
                          <div className="flex items-start justify-between gap-2">
                            <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={!isSubActive || top.isLocked}
                                onChange={() => toggleTopicEnabled(top.id)}
                                className="rounded border-[#383530] accent-[#E58038] w-4 h-4 mt-0.5 cursor-pointer disabled:opacity-30 shrink-0"
                              />
                              <div>
                                <div className="font-bold text-text text-xs leading-snug">{top.name}</div>
                              </div>
                            </label>

                            <button
                              type="button"
                              onClick={() => toggleTopicLock(top.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 ${
                                top.isLocked
                                  ? "bg-red-950/50 border border-red-800/60 text-red-400"
                                  : "bg-[#262422] border border-[#383530] text-[#A39E98] hover:text-text"
                              }`}
                            >
                              {top.isLocked ? (
                                <>
                                  <Lock className="w-3 h-3 text-red-400" />
                                  <span>LOCKED</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3 text-emerald-400" />
                                  <span>UNLOCKED</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Row 2: Accuracy Pill & Target Question Stepper */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#262422] text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                  top.accuracyPct < 70
                                    ? "bg-red-950/40 border-red-800/40 text-red-400"
                                    : top.accuracyPct >= 85
                                    ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                                    : "bg-amber-950/40 border-amber-800/40 text-amber-400"
                                }`}
                              >
                                {top.accuracyPct}% accuracy
                              </span>
                              <span className="text-[10px] text-text-muted">({top.decayDays}d decay)</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={!isSelected || top.targetCount <= 0}
                                onClick={() => updateTargetCount(top.id, top.targetCount - 1)}
                                className="w-6 h-6 rounded bg-[#262422] border border-[#383530] text-text hover:bg-[#302D2A] flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
                              >
                                -
                              </button>

                              <span className="w-7 text-center font-bold text-[#E58038] text-xs">
                                {top.targetCount}
                              </span>

                              <button
                                type="button"
                                disabled={!isSelected}
                                onClick={() => updateTargetCount(top.id, top.targetCount + 1)}
                                className="w-6 h-6 rounded bg-[#262422] border border-[#383530] text-text hover:bg-[#302D2A] flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
                              >
                                +
                              </button>
                              <span className="text-[10px] text-text-muted">Qs</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* BOTTOM STICKY ACTION BAR */}
        <div className="flex items-center justify-between border-t border-[#262422] pt-3 font-mono">
          <div className="text-xs text-text-muted">
            Total Target Questions:{" "}
            <strong className="text-[#E58038] font-bold text-sm">
              {totalActiveTargetQuestions} Questions
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              disabled={isSaving}
              onClick={handleSaveConfig}
              className="px-6 font-bold"
            >
              {isSaving ? "Saving Config..." : "Save Today's Syllabus →"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
