"use client";

import React, { useState, useEffect } from "react";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { missionsApi } from "@/lib/api";
import {
  Check,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  // Candidate Profile States
  const [candidateName, setCandidateName] = useState("Jishnu PG");
  const [candidateBio, setCandidateBio] = useState("Aiming for Top 1% Rank in SBI PO / IBPS RRB PO 2026");

  // Exam Target States
  const [targetExam, setTargetExam] = useState("IBPS RRB PO");
  const [examDate, setExamDate] = useState("2026-09-27");
  const [dailyTarget, setDailyTarget] = useState(90);
  const [targetAccuracy, setTargetAccuracy] = useState(85);

  // Practice Rules States
  const [difficultyLevel, setDifficultyLevel] = useState("Adaptive");
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [timerMode, setTimerMode] = useState<"COUNTDOWN" | "COUNTUP">("COUNTDOWN");

  // AI Preferences States
  const [aiEngine, setAiEngine] = useState("gemini-3.6-flash");
  const [aiContextNotes, setAiContextNotes] = useState("Focus heavily on DI Puzzles and Syllogisms.");

  // Appearance & Theme States
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">("dark");

  // Notifications States
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    revisionDue: true,
    mockReminders: true,
    weakSpotAlerts: true,
  });
  const [reminderTime, setReminderTime] = useState("08:00");

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("poforge_candidate_name");
    const savedBio = localStorage.getItem("poforge_candidate_bio");
    const savedExam = localStorage.getItem("poforge_target_exam");
    const savedDate = localStorage.getItem("poforge_exam_date");
    const savedTarget = localStorage.getItem("poforge_daily_target_num");
    const savedAcc = localStorage.getItem("poforge_target_accuracy");
    const savedDiff = localStorage.getItem("poforge_difficulty_level");
    const savedNeg = localStorage.getItem("poforge_negative_marking");
    const savedTimer = localStorage.getItem("poforge_timer_mode");
    const savedAiEng = localStorage.getItem("poforge_ai_engine");
    const savedAiNotes = localStorage.getItem("poforge_ai_notes");
    const savedTheme = (localStorage.getItem("poforge_theme") as "light" | "dark" | "system") || "dark";
    const savedNotifs = localStorage.getItem("poforge_notifications");
    const savedRemTime = localStorage.getItem("poforge_reminder_time");

    if (savedName) setCandidateName(savedName);
    if (savedBio) setCandidateBio(savedBio);
    if (savedExam) setTargetExam(savedExam);
    if (savedDate) setExamDate(savedDate);
    if (savedTarget) setDailyTarget(Number(savedTarget));
    if (savedAcc) setTargetAccuracy(Number(savedAcc));
    if (savedDiff) setDifficultyLevel(savedDiff);
    if (savedNeg !== null) setNegativeMarking(savedNeg === "true");
    if (savedTimer) setTimerMode(savedTimer as any);
    if (savedAiEng) setAiEngine(savedAiEng);
    if (savedAiNotes) setAiContextNotes(savedAiNotes);
    if (savedTheme) setThemeMode(savedTheme);
    if (savedRemTime) setReminderTime(savedRemTime);

    if (savedNotifs) {
      try {
        setNotifications(JSON.parse(savedNotifs));
      } catch (e) {}
    }
  }, []);

  const applyTheme = (mode: "light" | "dark" | "system") => {
    setThemeMode(mode);
    if (mode === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("poforge_theme", "light");
    } else if (mode === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("poforge_theme", "dark");
    } else {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(isSystemDark ? "dark" : "light");
      localStorage.setItem("poforge_theme", "system");
    }
  };

  const calculateDaysRemaining = (targetDateStr: string) => {
    const today = new Date();
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining(examDate);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await missionsApi.updateMissionConfig({
        subject_code: "QUANT",
        target_count: Math.round(dailyTarget / 2),
      });

      localStorage.setItem("poforge_candidate_name", candidateName);
      localStorage.setItem("poforge_candidate_bio", candidateBio);
      localStorage.setItem("poforge_target_exam", targetExam);
      localStorage.setItem("poforge_exam_date", examDate);
      localStorage.setItem("poforge_daily_target_num", dailyTarget.toString());
      localStorage.setItem("poforge_daily_target", `${dailyTarget} questions`);
      localStorage.setItem("poforge_target_accuracy", targetAccuracy.toString());
      localStorage.setItem("poforge_difficulty_level", difficultyLevel);
      localStorage.setItem("poforge_negative_marking", negativeMarking.toString());
      localStorage.setItem("poforge_timer_mode", timerMode);
      localStorage.setItem("poforge_ai_engine", aiEngine);
      localStorage.setItem("poforge_ai_notes", aiContextNotes);
      localStorage.setItem("poforge_theme", themeMode);
      localStorage.setItem("poforge_notifications", JSON.stringify(notifications));
      localStorage.setItem("poforge_reminder_time", reminderTime);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("poforge_profile_updated", {
            detail: {
              target_exam: targetExam,
              exam_date: examDate,
              days_remaining: daysRemaining,
              candidate_name: candidateName,
            },
          })
        );
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      console.warn("Failed to save to backend DB, persisting local storage:", e);
      localStorage.setItem("poforge_candidate_name", candidateName);
      localStorage.setItem("poforge_candidate_bio", candidateBio);
      localStorage.setItem("poforge_target_exam", targetExam);
      localStorage.setItem("poforge_exam_date", examDate);
      localStorage.setItem("poforge_daily_target_num", dailyTarget.toString());
      localStorage.setItem("poforge_daily_target", `${dailyTarget} questions`);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GlobalShell>
      <div className="w-full font-sans pb-12">
        {/* Sleek Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">
              Settings
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Configure candidate execution, exam parameters, AI model preferences, and theme.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-accent hover:opacity-90 text-white font-semibold text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-white" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </>
            )}
          </button>
        </div>

        {saveSuccess && (
          <div className="mb-6 px-4 py-2.5 bg-success/20 border border-success/40 rounded-xl text-xs font-mono text-success flex items-center justify-between">
            <span>✓ Settings saved successfully! ({daysRemaining} days remaining for {targetExam}).</span>
          </div>
        )}

        {/* FULL-WIDTH CONTINUOUS SETTINGS SECTIONS */}
        <div className="space-y-8">
          
          {/* SECTION 1: EXECUTION & CANDIDATE IDENTITY */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Execution & Candidate Identity
            </div>

            <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
              
              {/* Row 1: Full Candidate Name */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">Candidate Name</div>
                  <div className="text-[11px] text-text-muted">Display name for greetings and profile cards</div>
                </div>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full sm:w-64 h-9 bg-surface-2 border border-border rounded-lg px-3 text-xs text-text font-semibold focus:outline-none focus:border-accent"
                />
              </div>

              {/* Row 2: Target Goal Tagline */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">Target Goal Tagline</div>
                  <div className="text-[11px] text-text-muted">Motivational focus prompt for mission control</div>
                </div>
                <input
                  type="text"
                  value={candidateBio}
                  onChange={(e) => setCandidateBio(e.target.value)}
                  className="w-full sm:w-80 h-9 bg-surface-2 border border-border rounded-lg px-3 text-xs text-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: TARGET EXAM PARAMETERS */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Target Exam Parameters
            </div>

            <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
              
              {/* Target Exam Dropdown */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">Target Exam</div>
                  <div className="text-[11px] text-text-muted">Selected syllabus and IRT difficulty benchmarks</div>
                </div>
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full sm:w-64 h-9 bg-surface-2 border border-border rounded-lg px-3 text-xs text-text font-semibold focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="IBPS RRB PO">IBPS RRB PO (Officer Scale 1)</option>
                  <option value="IBPS PO">IBPS PO (Probationary Officer)</option>
                  <option value="SBI PO">SBI PO (State Bank of India)</option>
                  <option value="SBI Clerk">SBI Clerk (Junior Associate)</option>
                  <option value="RBI Grade B">RBI Grade B Officer</option>
                  <option value="LIC AAO">LIC AAO</option>
                </select>
              </div>

              {/* Interactive Date Picker & Countdown */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">Exam Date & Live Countdown</div>
                  <div className="text-[11px] text-text-muted">Calculates live D-Day countdown ({daysRemaining} days remaining)</div>
                </div>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full sm:w-48 h-9 bg-surface-2 border border-border rounded-lg px-3 text-xs text-text font-semibold focus:outline-none focus:border-accent cursor-pointer"
                />
              </div>

              {/* Daily Target Slider */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-text">Daily Question Target</div>
                    <div className="text-[11px] text-text-muted">Required questions per day to meet exam readiness</div>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-2 border border-border text-accent text-xs font-bold font-mono rounded-lg">
                    {dailyTarget} Qs / day
                  </span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={200}
                  step={10}
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg accent-accent cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: TEST EXECUTION & PRACTICE RULES */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Test Execution & Practice Rules
            </div>

            <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
              
              {/* Difficulty Segment Pill */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">Difficulty Preset</div>
                  <div className="text-[11px] text-text-muted">IRT item difficulty response curve</div>
                </div>
                <div className="flex bg-surface-2 border border-border p-1 rounded-xl gap-1">
                  {["Adaptive", "Prelims", "Mains"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficultyLevel(d)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        difficultyLevel === d ? "bg-accent text-white" : "text-text-muted hover:text-text"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Negative Marking Toggle */}
              <div className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">Negative Penalty (-0.25)</div>
                  <div className="text-[11px] text-text-muted">Deduct 0.25 marks for wrong answers</div>
                </div>
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: HERMES AI MODEL CONFIGURATION */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Hermes AI Model Configuration
            </div>

            <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
              
              {/* AI Model Dropdown */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">AI Model Engine</div>
                  <div className="text-[11px] text-text-muted">LLM model pipeline for solution generation</div>
                </div>
                <select
                  value={aiEngine}
                  onChange={(e) => setAiEngine(e.target.value)}
                  className="w-full sm:w-64 h-9 bg-surface-2 border border-border rounded-lg px-3 text-xs text-text font-semibold focus:outline-none focus:border-accent"
                >
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast Streaming)</option>
                  <option value="gemini-3.6-pro">Gemini 3.6 Pro (Deep Reasoning)</option>
                </select>
              </div>

              {/* Weakness Focus Notes */}
              <div className="p-4 space-y-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">AI Study Focus Notes</div>
                  <div className="text-[11px] text-text-muted">Provide specific instructions for Hermes AI coach</div>
                </div>
                <textarea
                  rows={3}
                  value={aiContextNotes}
                  onChange={(e) => setAiContextNotes(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl p-3 text-xs text-text focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: THEME APPEARANCE */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Theme Appearance
            </div>

            <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-text">Application Theme</div>
                <div className="text-[11px] text-text-muted font-normal">Select dark mode, light mode, or system default</div>
              </div>
              <div className="flex bg-surface-2 border border-border p-1 rounded-xl gap-1">
                {[
                  { mode: "dark", label: "Dark Mode" },
                  { mode: "light", label: "Light Mode (Pure Black Text)" },
                  { mode: "system", label: "System Default" },
                ].map((t) => (
                  <button
                    key={t.mode}
                    onClick={() => applyTheme(t.mode as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      themeMode === t.mode ? "bg-accent text-white" : "text-text-muted hover:text-text"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 6: NOTIFICATION SCHEDULE */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Notification Schedule
            </div>

            <div className="bg-surface border border-border rounded-2xl divide-y divide-border overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">Daily Mission Reminder</div>
                  <div className="text-[11px] text-text-muted">Send daily practice target notification</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailyReminder}
                  onChange={(e) => setNotifications({ ...notifications, dailyReminder: e.target.checked })}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-text">Reminder Time</div>
                  <div className="text-[11px] text-text-muted">Preferred time for daily warmup alert</div>
                </div>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-36 h-9 bg-surface-2 border border-border rounded-lg px-3 text-xs text-text font-semibold focus:outline-none focus:border-accent cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </GlobalShell>
  );
}
