"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, Skeleton, Badge } from "@/components/ui";
import { analyticsApi, AnalyticsResponse } from "@/lib/api";
import { RefreshCw, AlertTriangle, Search, Calculator, Brain, BookOpen, Landmark, Sparkles, Target, Award } from "lucide-react";
import { EXHAUSTIVE_BANKING_TOPICS } from "@/components/mission/MissionConfigModal";

export type MockTab = "TOPIC" | "FULL_LENGTH" | "SECTIONAL" | "CUSTOM" | "ADAPTIVE" | "HISTORY";

export default function MockHubPage() {
  const [activeTab, setActiveTab] = useState<MockTab>("TOPIC");

  // Topic Test Filters
  const [topicSubjectFilter, setTopicSubjectFilter] = useState<"ALL" | "QUANT" | "REASONING" | "ENGLISH" | "GA_BANKING">("ALL");
  const [topicSearchQuery, setTopicSearchQuery] = useState("");

  // Backend API states
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom Mock Builder form state
  const [customExam, setCustomExam] = useState("IBPS RRB PO");
  const [customSubjects, setCustomSubjects] = useState({ quant: true, reasoning: true, english: false });
  const [customQuestions, setCustomQuestions] = useState(40);
  const [customDifficulty, setCustomDifficulty] = useState("Adaptive");
  const [customDuration, setCustomDuration] = useState("30 min");

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await analyticsApi.getPerformanceAnalytics();
      setAnalytics(data);
    } catch (e: any) {
      console.warn("Failed to load mock analytics:", e);
      setErrorMsg(e.message || "Unable to connect to POForge backend service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const overallAccuracy = analytics?.overall_accuracy_percentage ?? null;
  const overallMastery = analytics?.overall_mastery_percentage ?? null;
  const quantMastery = analytics?.subject_mastery?.["QUANT"] ?? null;
  const reasoningMastery = analytics?.subject_mastery?.["REASONING"] ?? null;

  const weakestTopics = analytics?.weakest_topics || [];

  // Filter 52 Exhaustive Topic Tests by Subject & Search Query
  const filteredTopicTests = EXHAUSTIVE_BANKING_TOPICS.filter((t) => {
    const matchesSubject = topicSubjectFilter === "ALL" || t.subjectCode === topicSubjectFilter;
    const matchesSearch = topicSearchQuery.trim() === "" || t.name.toLowerCase().includes(topicSearchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const mockHistory = analytics?.historical_trends?.map((h, idx) => ({
    title: `Mock Test 0${idx + 1}`,
    score: `${Math.round((h.accuracy / 100) * 80)} / 80`,
    accuracy: `${h.accuracy}%`,
    time: `${Math.round(h.speed)}s avg`,
    trend: h.accuracy > 80 ? "up" : "flat",
  })) || [];

  return (
    <GlobalShell>
      {/* Header */}
      <div className="space-y-1 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text">
            Exam Mock Engine
          </h1>
          <span className="px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-[10px] font-mono text-accent font-bold">
            52+ Topic Tests Included
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Test yourself under real exam timing, negative marking (-0.25), and sectional cutoffs across all 52 exam topics.
        </p>
      </div>

      {/* Main Tabs Row */}
      <div className="flex items-center gap-1.5 border-b border-border overflow-x-auto pb-1.5 font-mono text-xs scrollbar-none">
        {(
          [
            { id: "TOPIC", label: "Topic Tests (52)", icon: Target },
            { id: "FULL_LENGTH", label: "Full Length Mocks", icon: Award },
            { id: "SECTIONAL", label: "Sectional Mocks", icon: Calculator },
            { id: "CUSTOM", label: "Custom Builder", icon: Sparkles },
            { id: "ADAPTIVE", label: "AI Adaptive", icon: Brain },
            { id: "HISTORY", label: "Attempt History", icon: RefreshCw },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MockTab)}
              className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap font-bold ${
                isActive
                  ? "bg-accent text-white border-accent shadow-md"
                  : "bg-[#1A1917] border-[#262422] text-text-muted hover:text-text hover:bg-surface-2"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
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

      {/* Loading Skeleton state */}
      {isLoading ? (
        <div className="space-y-4">
          <Card variant="default" className="p-6 space-y-4">
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-full h-12" />
          </Card>
        </div>
      ) : (
        <>
          {/* TAB 1: EXHAUSTIVE 52 TOPIC TESTS */}
          {activeTab === "TOPIC" && (
            <div className="space-y-5">
              {/* Filter Toolbar: Subject Tabs + Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A1917] p-3 rounded-2xl border border-[#262422] font-mono text-xs">
                {/* Subject Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {[
                    { code: "ALL", label: "All Topics (52)", icon: Target },
                    { code: "QUANT", label: "Quant (17)", icon: Calculator },
                    { code: "REASONING", label: "Reasoning (16)", icon: Brain },
                    { code: "ENGLISH", label: "English (9)", icon: BookOpen },
                    { code: "GA_BANKING", label: "GA/Banking (10)", icon: Landmark },
                  ].map((sub) => {
                    const Icon = sub.icon;
                    const isSubActive = topicSubjectFilter === sub.code;
                    return (
                      <button
                        key={sub.code}
                        type="button"
                        onClick={() => setTopicSubjectFilter(sub.code as any)}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                          isSubActive
                            ? "bg-[#332218] text-[#E58038] border-[#52331F] font-bold shadow-sm"
                            : "bg-[#141312] border-[#262422] text-[#A39E98] hover:text-text"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={topicSearchQuery}
                    onChange={(e) => setTopicSearchQuery(e.target.value)}
                    placeholder="Search topic tests..."
                    className="w-full bg-[#121110] border border-[#262422] rounded-xl pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-[#66625D] focus:outline-none focus:border-[#E58038]"
                  />
                </div>
              </div>

              {/* Count Summary */}
              <div className="flex items-center justify-between text-xs font-mono text-text-muted px-1">
                <span>
                  Showing <strong className="text-text font-bold">{filteredTopicTests.length}</strong> Topic Tests for{" "}
                  <span className="text-[#E58038] font-bold">
                    {topicSubjectFilter === "ALL" ? "All Subjects" : topicSubjectFilter}
                  </span>
                </span>
                <span>15 Mins • 15 Questions per Topic Test</span>
              </div>

              {/* 3-Column Responsive Topic Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 font-mono">
                {filteredTopicTests.map((topic) => (
                  <Card
                    key={topic.id}
                    variant="default"
                    className="p-4 space-y-3.5 border border-[#2B2825] bg-[#121110] hover:border-[#52331F] transition-all rounded-2xl flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-text leading-snug">{topic.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1A1917] border border-[#262422] text-[#E58038] font-bold shrink-0">
                          {topic.subjectCode === "QUANT" && "📐 Quant"}
                          {topic.subjectCode === "REASONING" && "🧩 Reasoning"}
                          {topic.subjectCode === "ENGLISH" && "📖 English"}
                          {topic.subjectCode === "GA_BANKING" && "🏦 GA/Banking"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-text-muted border-t border-[#262422] pt-2">
                        <span>15 Questions • 15 Mins</span>
                        <span className="text-emerald-400 font-bold">{topic.accuracyPct}% accuracy</span>
                      </div>
                    </div>

                    <Link href={`/practice?topic=${encodeURIComponent(topic.name)}`}>
                      <Button variant="secondary" size="sm" fullWidth className="font-bold cursor-pointer">
                        Start Topic Test →
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FULL LENGTH MOCKS */}
          {activeTab === "FULL_LENGTH" && (
            <div className="space-y-4">
              <Card variant="mission" className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                      Official Exam Blueprint
                    </span>
                    <h2 className="text-xl font-bold text-text">IBPS RRB PO PRELIMS</h2>
                    <p className="text-xs text-text-muted">
                      80 Questions • 80 Marks • 45 Minutes • Negative marking -0.25
                    </p>
                  </div>

                  <Link href="/practice?mode=full_mock">
                    <Button variant="primary" size="lg">
                      Start Full Mock →
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-surface-2 rounded-card border border-border text-xs font-mono">
                  <div>
                    <span className="text-text-muted">Reasoning Ability:</span>{" "}
                    <strong className="text-text">40 Q (40 Marks)</strong>
                  </div>
                  <div>
                    <span className="text-text-muted">Quantitative Aptitude:</span>{" "}
                    <strong className="text-text">40 Q (40 Marks)</strong>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 3: SECTIONAL MOCKS */}
          {activeTab === "SECTIONAL" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              {[
                { name: "Quantitative Aptitude", questions: 40, time: "20 min", code: "QUANT" },
                { name: "Reasoning Ability", questions: 40, time: "20 min", code: "REASONING" },
                { name: "English Language", questions: 30, time: "20 min", code: "ENGLISH" },
              ].map((sec, i) => (
                <Card key={i} variant="default" className="p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-text">{sec.name}</h3>
                    <p className="text-xs text-text-muted">
                      {sec.questions} Questions • {sec.time}
                    </p>
                  </div>

                  <Link href={`/practice?subject=${sec.code}`}>
                    <Button variant="secondary" size="sm" fullWidth>
                      Start Sectional Mock
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 4: CUSTOM MOCK BUILDER */}
          {activeTab === "CUSTOM" && (
            <Card variant="default" className="p-6 space-y-5 max-w-2xl mx-auto font-mono">
              <div className="border-b border-border pb-3">
                <h3 className="text-base font-bold text-text">Custom Mock Builder</h3>
                <p className="text-xs text-text-muted">Configure custom exam parameters and question distribution</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-text-muted uppercase">Target Exam</label>
                  <select
                    value={customExam}
                    onChange={(e) => setCustomExam(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-btn px-3 py-2 text-text font-medium"
                  >
                    <option value="IBPS RRB PO">IBPS RRB PO</option>
                    <option value="IBPS PO">IBPS PO</option>
                    <option value="SBI PO">SBI PO</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-text-muted uppercase">Subjects</label>
                  <div className="flex gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customSubjects.quant}
                        onChange={(e) => setCustomSubjects({ ...customSubjects, quant: e.target.checked })}
                        className="accent-accent"
                      />
                      <span>Quant</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customSubjects.reasoning}
                        onChange={(e) => setCustomSubjects({ ...customSubjects, reasoning: e.target.checked })}
                        className="accent-accent"
                      />
                      <span>Reasoning</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customSubjects.english}
                        onChange={(e) => setCustomSubjects({ ...customSubjects, english: e.target.checked })}
                        className="accent-accent"
                      />
                      <span>English</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted uppercase">Questions</label>
                    <input
                      type="number"
                      value={customQuestions}
                      onChange={(e) => setCustomQuestions(Number(e.target.value))}
                      className="w-full bg-surface-2 border border-border rounded-btn px-3 py-1.5 text-[#E58038]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted uppercase">Difficulty</label>
                    <select
                      value={customDifficulty}
                      onChange={(e) => setCustomDifficulty(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-btn px-3 py-1.5 text-text"
                    >
                      <option value="Adaptive">Adaptive</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-text-muted uppercase">Duration</label>
                    <input
                      type="text"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-btn px-3 py-1.5 text-text"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/practice?mode=custom">
                  <Button variant="primary" size="md" fullWidth>
                    Generate Mock →
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* TAB 5: AI ADAPTIVE MOCK */}
          {activeTab === "ADAPTIVE" && (
            <Card variant="default" className="p-6 space-y-5 max-w-2xl mx-auto border-accent/30 font-mono">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-accent">IRT Ability Float</span>
                <h3 className="text-lg font-bold text-text">AI Adaptive Mock</h3>
                <p className="text-xs text-text-muted">
                  Difficulty floats dynamically based on your item response performance.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-surface-2 rounded-btn border border-border text-xs">
                <div>
                  <span className="text-text-muted">IRT Theta:</span> <strong className="text-text">{overallMastery}</strong>
                </div>
                <div>
                  <span className="text-text-muted">Accuracy:</span> <strong className="text-success">{overallAccuracy}%</strong>
                </div>
                <div>
                  <span className="text-text-muted">Speed:</span> <strong className="text-text">{analytics?.average_speed_seconds || 42.5}s</strong>
                </div>
              </div>

              <div className="p-3 bg-surface-2 rounded-btn border border-border text-xs text-text-muted">
                Weakest topics targeted:{" "}
                <span className="font-semibold text-warning">
                  {weakestTopics.join(" / ")}
                </span>
              </div>

              <Link href="/practice?mode=adaptive">
                <Button variant="primary" size="lg" fullWidth>
                  Start Adaptive Mock →
                </Button>
              </Link>
            </Card>
          )}

          {/* TAB 6: ATTEMPT HISTORY */}
          {activeTab === "HISTORY" && (
            <Card variant="default" className="p-0 overflow-hidden font-mono">
              <div className="p-4 border-b border-border font-bold text-sm text-text">
                Mock History
              </div>
              {mockHistory.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-sm font-bold text-text">No Mock Attempts Logged Yet</p>
                  <p className="text-xs text-text-muted">Complete a Full Length or Sectional Mock to view your attempt history and trends here.</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-surface-2 border-b border-border text-text-muted">
                    <tr>
                      <th className="p-3">Mock</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Accuracy</th>
                      <th className="p-3">Time</th>
                      <th className="p-3 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockHistory.map((h, i) => (
                      <tr key={i} className="hover:bg-surface-2/40">
                        <td className="p-3 font-sans font-medium text-text">{h.title}</td>
                        <td className="p-3 text-text font-bold">{h.score}</td>
                        <td className="p-3 text-success font-bold">{h.accuracy}</td>
                        <td className="p-3 text-text-muted">{h.time}</td>
                        <td className="p-3 text-right font-bold text-success">
                          {h.trend === "up" ? "↑" : "→"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          )}
        </>
      )}
    </GlobalShell>
  );
}
