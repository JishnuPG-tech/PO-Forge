"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, StatTile, StatRow, ProgressBar, Sparkline, Skeleton } from "@/components/ui";
import { MissionConfigModal } from "@/components/mission/MissionConfigModal";
import { analyticsApi, missionsApi, AnalyticsResponse, DailyMissionStateResponse } from "@/lib/api";
import {
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Sliders,
  AlertTriangle,
  RefreshCw,
  Play,
  FileText,
  Zap,
  ArrowRight,
  Target,
  Award,
} from "lucide-react";
import { getSavedGoogleAccount } from "@/lib/googleAuth";

export type MissionState = "not_started" | "in_progress" | "complete";

export default function Home() {
  const [missionState, setMissionState] = useState<MissionState>("in_progress");
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Dynamic Settings States from Candidate Settings & localStorage
  const [candidateName, setCandidateName] = useState("Jishnu");
  const [targetExam, setTargetExam] = useState("IBPS RRB PO");
  const [examDate, setExamDate] = useState("2026-09-27");
  const [daysRemaining, setDaysRemaining] = useState(43);
  const [dailyTargetNum, setDailyTargetNum] = useState(90);

  // Backend API data states
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [missionData, setMissionData] = useState<DailyMissionStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [quantTarget, setQuantTarget] = useState<number>(25);

  const calculateDaysRemaining = (targetDateStr: string) => {
    if (!targetDateStr) return 43;
    const today = new Date();
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const syncSettingsState = () => {
    const savedName = localStorage.getItem("poforge_candidate_name");
    const savedExam = localStorage.getItem("poforge_target_exam");
    const savedDate = localStorage.getItem("poforge_exam_date");
    const savedTargetNum = localStorage.getItem("poforge_daily_target_num");
    const googleUser = getSavedGoogleAccount();

    if (googleUser?.name) {
      setCandidateName(googleUser.name);
    } else if (savedName) {
      setCandidateName(savedName);
    }

    if (savedExam) setTargetExam(savedExam);
    if (savedDate) {
      setExamDate(savedDate);
      setDaysRemaining(calculateDaysRemaining(savedDate));
    }
    if (savedTargetNum) setDailyTargetNum(Number(savedTargetNum));

    const storedQuant = localStorage.getItem("poforge_quant_target");
    if (storedQuant) setQuantTarget(parseInt(storedQuant, 10));
  };

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [perfData, mission] = await Promise.all([
        analyticsApi.getPerformanceAnalytics(),
        missionsApi.startTodayMission(),
      ]);
      setAnalytics(perfData);
      setMissionData(mission);
      if (mission.status) {
        setMissionState(mission.status as MissionState);
      }
    } catch (e: any) {
      console.warn("Failed to load Today page backend data:", e);
      setErrorMsg(e.message || "Unable to connect to POForge backend service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncSettingsState();
    loadData();

    const handleProfileUpdate = () => {
      syncSettingsState();
    };

    window.addEventListener("storage", syncSettingsState);
    window.addEventListener("poforge_profile_updated", handleProfileUpdate);
    window.addEventListener("poforge_google_auth_changed", syncSettingsState);

    return () => {
      window.removeEventListener("storage", syncSettingsState);
      window.removeEventListener("poforge_profile_updated", handleProfileUpdate);
      window.removeEventListener("poforge_google_auth_changed", syncSettingsState);
    };
  }, []);

  const handleConfigSave = (config: any) => {
    setMissionState("in_progress");
    syncSettingsState();
  };

  const streakDays = analytics?.streak_days ?? 12;
  const masteryPct = analytics?.overall_mastery_percentage ?? 76;
  const accuracyPct = analytics?.overall_accuracy_percentage ?? 84;
  const speedSec = analytics?.average_speed_seconds ?? 42.5;

  const quantCompleted = missionData?.sections.find((s) => s.subject_code === "QUANT")?.completed_count ?? 8;
  const reasoningCompleted = missionData?.sections.find((s) => s.subject_code === "REASONING")?.completed_count ?? 14;
  const englishCompleted = missionData?.sections.find((s) => s.subject_code === "ENGLISH")?.completed_count ?? 0;
  const gaCompleted = missionData?.sections.find((s) => s.subject_code === "GA_BANKING")?.completed_count ?? 0;

  const totalCompleted = missionData?.completed_question_count ?? (quantCompleted + reasoningCompleted + englishCompleted + gaCompleted);
  // Total target dynamically calculated from user's Daily Target Setting
  const totalTarget = dailyTargetNum || missionData?.target_question_count || 90;
  const progressPct = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 24;

  const accuracyData = analytics?.historical_trends?.map((t) => t.accuracy) || [74, 76, 78, 80, 82, 83, 84];
  const speedData = analytics?.historical_trends?.map((t) => t.speed) || [52, 49, 47, 46, 44, 43, 42.5];

  return (
    <GlobalShell>
      {/* Header Bar — Dynamically Hydrated from Candidate Settings */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text font-sans">
            Good morning, {candidateName.split(" ")[0]}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Your daily target is set to <strong className="text-[#E58038] font-bold">{dailyTargetNum} questions</strong> for <strong className="text-text font-bold">{targetExam}</strong> ({daysRemaining} days remaining).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-mono">
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-surface-2 border border-border text-xs">
            <Flame className="w-4 h-4 text-warning fill-warning/20" />
            <span className="font-bold text-text">{streakDays}-day streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#332218] border border-[#52331F] text-xs text-[#E58038]">
            <Clock className="w-4 h-4 text-[#E58038]" />
            <span className="font-bold">{targetExam} • {daysRemaining}d left</span>
          </div>
        </div>
      </div>

      {/* Error Retry Banner */}
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
        <div className="space-y-6">
          <Card variant="default" className="p-6 space-y-4">
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-full h-16" />
          </Card>
        </div>
      ) : (
        <>
          {/* DAILY MISSION HERO CARD */}
          <Card variant="mission" className="p-4 sm:p-6 space-y-4 sm:space-y-5 border border-[#2B2825] bg-[#121110] rounded-2xl sm:rounded-3xl shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E58038] flex items-center gap-1">
                    <Target className="w-4 h-4 text-[#E58038]" />
                    <span>DAILY MISSION • {targetExam}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#332218] border border-[#52331F] text-[#E58038] font-mono font-bold">
                    Target: {dailyTargetNum} Qs
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text font-sans">
                  {missionState === "complete" ? "Today's Mission Completed! 🎉" : `Solve ${dailyTargetNum} Daily Target Questions`}
                </h2>
                <p className="text-xs text-text-muted font-mono">
                  Personalized problem set covering Quantitative Aptitude, Reasoning, English & Banking Awareness.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsConfigOpen(true)}
                  className="flex items-center justify-center gap-1.5 font-bold cursor-pointer touch-manipulation"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customize Syllabus</span>
                </Button>

                <Link href="/practice" className="w-full sm:w-auto">
                  <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-1.5 font-bold cursor-pointer shadow-lg touch-manipulation">
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Practice →</span>
                  </Button>
                </Link>
              </div>
            </div>


            {/* Dynamic Master Progress Tracker */}
            <div className="space-y-3 font-mono p-4 bg-[#161513] border border-[#2A2724] rounded-2xl shadow-inner">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A39E98] flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#E58038]" />
                    <span>MISSION PROGRESS</span>
                  </span>
                  <span className="text-sm font-extrabold text-white">
                    {totalCompleted} / {totalTarget} Questions Solved ({progressPct}%)
                  </span>
                </div>

                <span className="px-3 py-1 bg-[#332218] border border-[#52331F] text-[#E58038] font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0">
                  <Zap className="w-3.5 h-3.5 text-[#E58038]" />
                  <span>{totalTarget - totalCompleted} Qs Remaining Today</span>
                </span>
              </div>

              {/* Glowing Gradient Progress Bar */}
              <div className="h-3.5 bg-[#100F0E] border border-[#2A2724] rounded-full p-0.5 shadow-inner relative overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF7A1A] via-[#E58038] to-[#FF9E4D] shadow-md shadow-[#E58038]/40 transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                />
              </div>
            </div>

            {/* Sectional Breakdown Cards with Individual Progress Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 font-mono text-xs">
              {[
                { name: "📐 Quant", count: quantCompleted, target: Math.round(totalTarget * 0.4) },
                { name: "🧩 Reasoning", count: reasoningCompleted, target: Math.round(totalTarget * 0.4) },
                { name: "📖 English", count: englishCompleted, target: Math.round(totalTarget * 0.1) },
                { name: "🏦 GA/Banking", count: gaCompleted, target: Math.round(totalTarget * 0.1) },
              ].map((sec, idx) => {
                const secPct = sec.target > 0 ? Math.min(100, Math.round((sec.count / sec.target) * 100)) : 0;
                return (
                  <div key={idx} className="p-3.5 bg-[#161513] border border-[#262422] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#A39E98] font-bold">
                      <span>{sec.name}</span>
                      <span className="text-text font-mono">{secPct}%</span>
                    </div>
                    <div className="text-sm font-extrabold text-text">
                      {sec.count} / {sec.target} <span className="text-[10px] font-normal text-text-muted">Qs</span>
                    </div>
                    <div className="h-1.5 bg-[#100F0E] border border-[#262422] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E58038] rounded-full transition-all duration-500" style={{ width: `${secPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* STATS TILES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="default" className="p-5 space-y-3 border border-[#2B2825] bg-[#121110] rounded-2xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#A39E98] font-bold">OVERALL MASTERY</span>
                <span className="text-emerald-400 font-bold">IRT Level {masteryPct}%</span>
              </div>
              <div className="text-2xl font-extrabold text-text font-mono">{masteryPct}%</div>
              <div className="h-2 bg-[#100F0E] border border-[#262422] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm transition-all duration-500"
                  style={{ width: `${masteryPct}%` }}
                />
              </div>
            </Card>

            <Card variant="default" className="p-5 space-y-3 border border-[#2B2825] bg-[#121110] rounded-2xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted">ACCURACY TREND</span>
                <span className="text-success font-bold">↑ 84%</span>
              </div>
              <div className="text-2xl font-extrabold text-text font-mono">{accuracyPct}%</div>
              <Sparkline data={accuracyData} height={28} />
            </Card>

            <Card variant="default" className="p-5 space-y-3 border border-[#2B2825] bg-[#121110] rounded-2xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted font-bold">AVG SPEED PER ITEM</span>
                <span className="text-[#E58038] font-bold">{speedSec}s</span>
              </div>
              <div className="text-2xl font-extrabold text-text font-mono">{speedSec}s</div>
              <Sparkline data={speedData} height={28} color="#E58038" />
            </Card>
          </div>
        </>
      )}

      {/* Syllabus Config Modal */}
      {isConfigOpen && (
        <MissionConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} onSave={handleConfigSave} />
      )}
    </GlobalShell>
  );
}
