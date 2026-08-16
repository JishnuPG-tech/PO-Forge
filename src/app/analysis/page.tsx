"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, StatTile, StatRow, Sparkline, Skeleton } from "@/components/ui";
import { analyticsApi, AnalyticsResponse } from "@/lib/api";
import { AlertTriangle, RefreshCw, PieChart as PieIcon, Award, ShieldCheck, Target, TrendingUp } from "lucide-react";

export type TrendPeriod = "7D" | "30D" | "90D" | "ALL";

export interface PieSegment {
  label: string;
  value: number;
  color: string;
  displayVal?: string;
}

const PieDonutChart: React.FC<{
  data: PieSegment[];
  size?: number;
  strokeWidth?: number;
  centerText?: string;
  centerSubtext?: string;
}> = ({ data, size = 180, strokeWidth = 24, centerText, centerSubtext }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let accumulatedPercent = 0;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {data.map((item, idx) => {
          const percent = total > 0 ? item.value / total : 0;
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = -accumulatedPercent * circumference;
          accumulatedPercent += percent;

          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 hover:opacity-90 cursor-pointer"
            />
          );
        })}
      </svg>
      {(centerText || centerSubtext) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
          {centerText && <span className="text-xl font-extrabold text-white">{centerText}</span>}
          {centerSubtext && <span className="text-[10px] text-[#A39E98] uppercase font-bold">{centerSubtext}</span>}
        </div>
      )}
    </div>
  );
};

export default function AnalysisPage() {
  const [period, setPeriod] = useState<TrendPeriod>("30D");

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
      console.warn("Failed to load performance analytics:", e);
      setErrorMsg(e.message || "Unable to connect to POForge backend service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const overallMastery = analytics?.overall_mastery_percentage ?? null;
  const overallAccuracy = analytics?.overall_accuracy_percentage ?? null;
  const avgSpeed = analytics?.average_speed_seconds ?? null;
  const revisionHealth = analytics?.revision_health_percentage ?? null;
  const readinessState = analytics?.readiness_state || "DEVELOPING";

  const quantMastery = analytics?.subject_mastery?.["QUANT"] ?? null;
  const reasoningMastery = analytics?.subject_mastery?.["REASONING"] ?? null;
  const englishMastery = analytics?.subject_mastery?.["ENGLISH"] ?? null;
  const gaMastery = analytics?.subject_mastery?.["GA_BANKING"] ?? null;

  const accuracyTrend = analytics?.historical_trends?.map((t) => t.accuracy) || [];
  const speedTrend = analytics?.historical_trends?.map((t) => t.speed) || [];
  const hasSubjectData = quantMastery != null || reasoningMastery != null || englishMastery != null || gaMastery != null;

  // Subject Mastery Donut Data
  const subjectPieData: PieSegment[] = hasSubjectData
    ? [
        { label: "Quantitative Aptitude", value: quantMastery ?? 0, color: "#FF7A1A", displayVal: `${quantMastery ?? 0}%` },
        { label: "Reasoning Ability", value: reasoningMastery ?? 0, color: "#3FBE73", displayVal: `${reasoningMastery ?? 0}%` },
        { label: "English Language", value: englishMastery ?? 0, color: "#38BDF8", displayVal: `${englishMastery ?? 0}%` },
        { label: "GA & Banking Awareness", value: gaMastery ?? 0, color: "#A855F7", displayVal: `${gaMastery ?? 0}%` },
      ]
    : [
        { label: "No Mastery Data Yet", value: 100, color: "#262422", displayVal: "0%" },
      ];

  // Accuracy Breakdown Donut Data
  const hasAccuracyData = overallAccuracy != null && overallAccuracy > 0;
  const incorrectPct = overallAccuracy != null ? Number(Math.max(0, 100 - overallAccuracy).toFixed(1)) : 0;
  const accuracyPieData: PieSegment[] = hasAccuracyData
    ? [
        { label: "Correct Answers", value: overallAccuracy, color: "#3FBE73", displayVal: `${overallAccuracy}%` },
        { label: "Incorrect Answers", value: incorrectPct, color: "#F25C5C", displayVal: `${incorrectPct}%` },
      ]
    : [
        { label: "No Attempts Logged", value: 100, color: "#262422", displayVal: "0%" },
      ];


  return (
    <GlobalShell>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-4 font-mono">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text font-sans">
            Performance Analysis & Readiness
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Continuously updated from question attempts, daily missions, and mock exams with dynamic Pie & Donut Charts.
          </p>
        </div>

        <Link href="/analysis/weakness">
          <Button variant="primary" size="md" className="font-bold cursor-pointer shadow-md">
            <span>Weakness Diagnostic Center →</span>
          </Button>
        </Link>
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-full h-20" />
          </div>
          <Card variant="default" className="p-6 space-y-4">
            <Skeleton className="w-1/3 h-6" />
            <Skeleton className="w-full h-24" />
          </Card>
        </div>
      ) : (
        <>
          {/* Top StatRow */}
          <StatRow>
            <StatTile label="Mastery" value={`${overallMastery}%`} trend={{ direction: "up", text: "+4%" }} />
            <StatTile label="Accuracy" value={`${overallAccuracy}%`} trend={{ direction: "up", text: "+6%" }} />
            <StatTile label="Speed" value={`${avgSpeed}s`} subtitle="Avg per question" />
            <StatTile label="Retention" value={`${revisionHealth}%`} subtitle="SuperMemo SM-2" />
          </StatRow>

          {/* BEAUTIFUL PIE & DONUT CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
            
            {/* CHART 1: SUBJECT MASTERY DISTRIBUTION DONUT CHART */}
            <Card variant="mission" className="p-6 space-y-5 border border-[#2B2825] bg-[#121110] rounded-3xl shadow-xl">
              <div className="flex items-center justify-between border-b border-[#262422] pb-3">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[#E58038]" />
                  <h3 className="text-sm font-extrabold text-text font-sans">SUBJECT MASTERY DISTRIBUTION</h3>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#332218] border border-[#52331F] text-[#E58038] font-bold">
                  IRT Ability Float
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                {/* SVG Donut Chart */}
                <PieDonutChart
                  data={subjectPieData}
                  size={190}
                  strokeWidth={26}
                  centerText={`${overallMastery}%`}
                  centerSubtext={readinessState}
                />

                {/* Subject Color Legend */}
                <div className="space-y-3 w-full text-xs">
                  {subjectPieData.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-[#161513] border border-[#262422] rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="font-bold text-text">{s.label}</span>
                      </div>
                      <span className="font-extrabold font-mono text-white">{s.displayVal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* CHART 2: ACCURACY & ERROR BREAKDOWN DONUT CHART */}
            <Card variant="default" className="p-6 space-y-5 border border-[#2B2825] bg-[#121110] rounded-3xl shadow-xl">
              <div className="flex items-center justify-between border-b border-[#262422] pb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-text font-sans">ACCURACY & ERROR BREAKDOWN</h3>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 font-bold">
                  Exam Accuracy
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                {/* SVG Donut Chart */}
                <PieDonutChart
                  data={accuracyPieData}
                  size={190}
                  strokeWidth={26}
                  centerText={`${overallAccuracy}%`}
                  centerSubtext="Accuracy"
                />

                {/* Accuracy Breakdown Legend */}
                <div className="space-y-3 w-full text-xs">
                  {accuracyPieData.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-[#161513] border border-[#262422] rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                        <span className="font-bold text-text">{a.label}</span>
                      </div>
                      <span className="font-extrabold font-mono text-white">{a.displayVal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* SUBJECT PERFORMANCE TABLE */}
          <Card variant="default" className="p-0 overflow-hidden font-mono border border-[#2B2825] bg-[#121110] rounded-3xl">
            <div className="p-4 border-b border-[#262422] font-bold text-sm text-text font-sans flex items-center justify-between">
              <span>Subject Performance Metrics</span>
              <span className="text-xs text-[#A39E98]">SuperMemo SM-2 & IRT</span>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-[#161513] border-b border-[#262422] text-[#A39E98]">
                <tr>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Mastery Level</th>
                  <th className="p-3.5 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262422]">
                {[
                  { name: "Quantitative Aptitude", score: `${quantMastery}%`, trend: "up" },
                  { name: "Reasoning Ability", score: `${reasoningMastery}%`, trend: "up" },
                  { name: "English Language", score: `${englishMastery}%`, trend: "flat" },
                  { name: "General & Banking Awareness", score: `${gaMastery}%`, trend: "up" },
                ].map((sub, i) => (
                  <tr key={i} className="hover:bg-surface-2/40">
                    <td className="p-3.5 font-sans font-medium text-text">{sub.name}</td>
                    <td className="p-3.5 text-text font-bold">{sub.score}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">
                      {sub.trend === "up" ? "↑" : "→"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* PERFORMANCE TREND SPARKLINES */}
          <Card variant="default" className="p-6 space-y-4 border border-[#2B2825] bg-[#121110] rounded-3xl font-mono">
            <div className="flex items-center justify-between border-b border-[#262422] pb-3">
              <h3 className="text-sm font-extrabold text-text font-sans">PERFORMANCE TRENDS</h3>
              <div className="flex gap-1.5 text-xs">
                {(["7D", "30D", "90D", "ALL"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-xl cursor-pointer font-bold transition-all ${
                      period === p ? "bg-[#332218] border border-[#52331F] text-[#E58038]" : "text-[#A39E98] hover:text-text"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
              <div className="p-3.5 bg-[#161513] rounded-2xl border border-[#262422] space-y-2">
                <span className="text-[11px] text-[#A39E98]">Accuracy Trend</span>
                <div className="text-lg font-extrabold text-text">
                  {overallAccuracy != null ? `${overallAccuracy}%` : "--"}
                </div>
                {accuracyTrend.length >= 2 ? (
                  <Sparkline data={accuracyTrend} width={130} height={30} />
                ) : (
                  <div className="text-[10px] text-text-muted font-mono">No trend data</div>
                )}
              </div>

              <div className="p-3.5 bg-[#161513] rounded-2xl border border-[#262422] space-y-2">
                <span className="text-[11px] text-[#A39E98]">Speed Trend</span>
                <div className="text-lg font-extrabold text-text">
                  {avgSpeed != null ? `${avgSpeed}s` : "--"}
                </div>
                {speedTrend.length >= 2 ? (
                  <Sparkline data={speedTrend} width={130} height={30} />
                ) : (
                  <div className="text-[10px] text-text-muted font-mono">No timing data</div>
                )}
              </div>

              <div className="p-3.5 bg-[#161513] rounded-2xl border border-[#262422] space-y-2">
                <span className="text-[11px] text-[#A39E98]">Total Attempted</span>
                <div className="text-lg font-extrabold text-text">
                  {analytics?.total_attempts_count != null ? `${analytics.total_attempts_count} Qs` : "--"}
                </div>
                <div className="text-[10px] text-text-muted font-mono">Lifetime questions solved</div>
              </div>

              <div className="p-3.5 bg-[#161513] rounded-2xl border border-[#262422] space-y-2">
                <span className="text-[11px] text-[#A39E98]">Revision Health</span>
                <div className="text-lg font-extrabold text-text">
                  {revisionHealth != null ? `${revisionHealth}%` : "--"}
                </div>
                <div className="text-[10px] text-text-muted font-mono">SM-2 memory retention</div>
              </div>
            </div>

          </Card>
        </>
      )}
    </GlobalShell>
  );
}
