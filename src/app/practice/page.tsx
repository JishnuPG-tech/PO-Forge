"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import {
  Button,
  Card,
  OptionCard,
  OptionState,
  Timer,
  Badge,
  Skeleton,
} from "@/components/ui";
import { SubjectTransition } from "@/components/mission/SubjectTransition";
import { MissionComplete } from "@/components/mission/MissionComplete";
import {
  questionsApi,
  missionsApi,
  QuestionResponse,
  DailyMissionStateResponse,
  SubmitQuestionResponse,
} from "@/lib/api";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Layers,
  Eye,
  EyeOff,
} from "lucide-react";

export default function PracticePage() {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [answeredOptions, setAnsweredOptions] = useState<Record<number, number>>({});
  const [submitResponses, setSubmitResponses] = useState<Record<number, SubmitQuestionResponse>>({});
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Palette UI states
  const [paletteChunkPage, setPaletteChunkPage] = useState(0);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(true);
  const CHUNK_SIZE = 25; // 25 questions per page chunk

  // Backend API states
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [missionState, setMissionState] = useState<DailyMissionStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Workflow states: "engine" | "subject_transition" | "mission_complete"
  const [workflowState, setWorkflowState] = useState<
    "engine" | "subject_transition" | "mission_complete"
  >("engine");

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const mission = await missionsApi.startTodayMission();
      setMissionState(mission);

      let fetchedQs: QuestionResponse[] = [];
      if (mission.sections && mission.sections.length > 0) {
        fetchedQs = mission.sections.flatMap((sec) => sec.questions || []);
      }

      if (fetchedQs.length === 0) {
        fetchedQs = await questionsApi.searchQuestions({ subject_code: "QUANT", limit: 25 });
      }

      setQuestions(fetchedQs);

      const restoredAnswers: Record<number, number> = {};
      const restoredSubmits: Record<number, SubmitQuestionResponse> = {};

      fetchedQs.forEach((q, idx) => {
        if (q.user_selected_option !== undefined && q.user_selected_option !== null) {
          restoredAnswers[idx] = q.user_selected_option;
          restoredSubmits[idx] = {
            status: "SUCCESS",
            question_id: q.question_id,
            is_correct: q.is_correct ?? (q.user_selected_option === q.correct_option_index),
            completed_count: idx + 1,
            target_count: fetchedQs.length,
          };
        }
      });

      setAnsweredOptions(restoredAnswers);
      setSubmitResponses(restoredSubmits);
    } catch (e: any) {
      console.warn("Failed to load practice questions from backend:", e);
      setErrorMsg(e.message || "Unable to connect to POForge backend service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync palette chunk page when currentQIndex changes
  useEffect(() => {
    const chunkIdx = Math.floor(currentQIndex / CHUNK_SIZE);
    setPaletteChunkPage(chunkIdx);
  }, [currentQIndex]);

  const currentQ: QuestionResponse | undefined = questions[currentQIndex];

  // Client-side timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts: 1-5 select option, Enter submits, → next, M marks for review
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;
      if (!currentQ) return;

      if (e.key >= "1" && e.key <= "5") {
        const optionIdx = parseInt(e.key) - 1;
        if (optionIdx < currentQ.options.length && !submitted) {
          setSelectedOption(optionIdx);
        }
      } else if (e.key === "Enter") {
        if (!submitted && selectedOption !== null) {
          handleSubmit();
        } else if (submitted) {
          handleNext();
        }
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key.toLowerCase() === "m") {
        toggleMarkForReview();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOption, submitted, currentQIndex, currentQ]);

  // Execute real backend mutation call: POST /api/v1/missions/submit-question
  const handleSubmit = async () => {
    if (selectedOption === null || isSubmitting || !currentQ) return;

    setIsSubmitting(true);
    try {
      const res = await missionsApi.submitQuestionAttempt({
        section_index: 0,
        question_index: currentQIndex,
        selected_option_index: selectedOption,
        is_skipped: false,
        response_time_ms: seconds * 1000,
      });

      setSubmitResponses((prev) => ({ ...prev, [currentQIndex]: res }));
      setAnsweredOptions((prev) => ({ ...prev, [currentQIndex]: selectedOption }));
      setSubmitted(true);
    } catch (e: any) {
      console.warn("Backend submission error, recording local fallback:", e);
      const isCorrectFallback = selectedOption === currentQ.correct_option_index;
      setSubmitResponses((prev) => ({
        ...prev,
        [currentQIndex]: {
          status: "SUCCESS",
          question_id: currentQ.question_id,
          is_correct: isCorrectFallback,
          completed_count: currentQIndex + 1,
          target_count: questions.length,
        },
      }));
      setAnsweredOptions((prev) => ({ ...prev, [currentQIndex]: selectedOption }));
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentQIndex === 1 && workflowState === "engine") {
      setWorkflowState("subject_transition");
      return;
    } else if (questions.length > 0 && currentQIndex === questions.length - 1 && workflowState === "engine") {
      setWorkflowState("mission_complete");
      return;
    }

    const nextIdx = (currentQIndex + 1) % (questions.length || 1);
    setCurrentQIndex(nextIdx);
    const existingAnswer = answeredOptions[nextIdx];
    if (existingAnswer !== undefined) {
      setSelectedOption(existingAnswer);
      setSubmitted(true);
    } else {
      setSelectedOption(null);
      setSubmitted(false);
    }
    setIsAccordionOpen(false);
  };

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => ({ ...prev, [currentQIndex]: !prev[currentQIndex] }));
  };

  const backendResult = submitResponses[currentQIndex];
  const isCorrect = backendResult
    ? backendResult.is_correct
    : selectedOption !== null && currentQ !== undefined
    ? selectedOption === currentQ.correct_option_index
    : false;

  // Calculate palette scores
  const totalCorrect = Object.values(submitResponses).filter((r) => r.is_correct).length;
  const totalIncorrect = Object.values(submitResponses).filter((r) => !r.is_correct).length;
  const totalAnswered = Object.keys(answeredOptions).length;

  // Palette Chunking calculation
  const totalChunks = Math.ceil(questions.length / CHUNK_SIZE);
  const currentChunkStart = paletteChunkPage * CHUNK_SIZE;
  const currentChunkQuestions = questions.slice(
    currentChunkStart,
    currentChunkStart + CHUNK_SIZE
  );

  if (workflowState === "subject_transition") {
    return (
      <GlobalShell>
        <SubjectTransition
          completedSubjectName="Quantitative Aptitude"
          nextSubjectName="Reasoning Ability"
          totalAnswered={25}
          accuracyPercent={84}
          avgTimeSeconds={43}
          strongestTopic="Percentage"
          needsAttentionTopic="Profit & Loss"
          onContinue={() => {
            setWorkflowState("engine");
            setCurrentQIndex(2);
            setSelectedOption(answeredOptions[2] ?? null);
            setSubmitted(answeredOptions[2] !== undefined);
          }}
        />
      </GlobalShell>
    );
  }

  if (workflowState === "mission_complete") {
    return (
      <GlobalShell>
        <MissionComplete
          score={82}
          totalQuestions={questions.length || 100}
          accuracyPercent={82}
          correctCount={82}
          incorrectCount={16}
          skippedCount={2}
          avgTimeSeconds={42}
          totalTimeFormatted="42:18"
        />
      </GlobalShell>
    );
  }

  return (
    <GlobalShell>
      {/* Keyboard Shortcuts & Drawer Toggle Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-text-muted border-b border-border pb-2.5 mb-4">
        <span className="hidden md:inline">
          Keyboard: <kbd className="border border-border px-1.5 py-0.5 rounded bg-surface-2 text-text">1-5</kbd> Select •{" "}
          <kbd className="border border-border px-1.5 py-0.5 rounded bg-surface-2 text-text">ENTER</kbd> Submit/Next •{" "}
          <kbd className="border border-border px-1.5 py-0.5 rounded bg-surface-2 text-text">→</kbd> Next •{" "}
          <kbd className="border border-border px-1.5 py-0.5 rounded bg-surface-2 text-text">M</kbd> Mark
        </span>

        <button
          onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
          className="flex items-center gap-1.5 px-3 py-1 rounded border border-border bg-surface-2 hover:bg-surface text-accent font-bold cursor-pointer transition-colors ml-auto md:ml-0"
        >
          {showPaletteDrawer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{showPaletteDrawer ? "Hide Question Palette" : "Show Question Palette"}</span>
        </button>
      </div>

      {/* Error Retry banner */}
      {errorMsg && (
        <div className="p-4 bg-danger-soft border border-danger/30 rounded-card flex items-center justify-between text-xs text-danger font-mono mb-4">
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
      {isLoading || !currentQ ? (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="w-full h-64" />
          </div>
        </div>
      ) : (
        /* Responsive 12-Column Grid Layout Container */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-start">
          {/* Left Main Column: Question Stem, Options, Controls */}
          <div className={`${showPaletteDrawer ? "lg:col-span-8" : "lg:col-span-12"} space-y-4 md:space-y-5 transition-all duration-200`}>
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-border pb-3 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="accent" label={currentQ.subject_code} />
                <span className="text-xs text-text-muted font-mono">• {currentQ.topic_code}</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 font-mono">
                {/* Mobile Quick Palette Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
                  className="lg:hidden px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-[11px] font-bold text-accent hover:border-accent/50 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showPaletteDrawer ? "Hide Palette" : "Palette"}</span>
                </button>

                <span className="text-xs font-bold text-text bg-surface-2 px-2 py-0.5 rounded border border-border">
                  Q {currentQIndex + 1}/{questions.length}
                </span>
                <Timer seconds={seconds} targetSeconds={60} />
              </div>
            </div>

            {/* Question Stem Text Card */}
            <Card variant="default" className="p-4 sm:p-5 md:p-6 shadow-sm">
              <p className="text-sm sm:text-base font-medium text-text leading-relaxed whitespace-pre-line select-text">
                {currentQ.text}
              </p>
            </Card>

            {/* Options List */}
            <div className="space-y-2 sm:space-y-2.5">
              {currentQ.options.map((optText, idx) => {
                const optionLetters = ["A", "B", "C", "D", "E"];
                let optState: OptionState = "default";
                if (selectedOption === idx) optState = "selected";
                if (submitted) {
                  if (idx === currentQ.correct_option_index) optState = "correct";
                  else if (selectedOption === idx && !isCorrect) optState = "incorrect";
                }

                return (
                  <OptionCard
                    key={idx}
                    label={`(${optionLetters[idx]})`}
                    text={optText.replace(/^\([A-E]\)\s*/, "")}
                    state={optState}
                    disabled={submitted}
                    onClick={() => !submitted && setSelectedOption(idx)}
                  />
                );
              })}
            </div>

            {/* Inline Action Bar or Feedback */}
            {!submitted ? (
              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-border gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const prevIdx = Math.max(0, currentQIndex - 1);
                      setCurrentQIndex(prevIdx);
                      setSelectedOption(answeredOptions[prevIdx] ?? null);
                      setSubmitted(answeredOptions[prevIdx] !== undefined);
                    }}
                    disabled={currentQIndex === 0}
                    className="touch-manipulation"
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMarkForReview}
                    className={`touch-manipulation ${markedForReview[currentQIndex] ? "text-warning" : ""}`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{markedForReview[currentQIndex] ? "Marked" : "Review"}</span>
                  </Button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button variant="secondary" size="sm" onClick={handleNext} className="touch-manipulation">
                    Skip
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    disabled={selectedOption === null || isSubmitting}
                    onClick={handleSubmit}
                    className="touch-manipulation min-w-[90px]"
                  >
                    {isSubmitting ? "Submitting..." : "Submit →"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Inline Post-submit Feedback */
              <div className="space-y-4 pt-2 border-t border-border">
                <Card
                  className={`p-4 ${
                    isCorrect
                      ? "border-emerald-600/50 bg-emerald-950/20"
                      : "border-red-600/50 bg-red-950/20"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400">Correct Answer ✓</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Incorrect Answer ✗</span>
                            <span className="text-xs text-text-muted">
                              • Option ({String.fromCharCode(65 + (selectedOption ?? 0))}) selected
                            </span>
                          </>
                        )}
                      </div>
                      {!isCorrect && (
                        <p className="text-xs text-text-muted">
                          Mistake type: <span className="font-semibold text-warning">Concept Error</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                        className="touch-manipulation"
                      >
                        <span>Solution</span>
                        {isAccordionOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleNext} className="touch-manipulation">
                        Next →
                      </Button>
                    </div>
                  </div>
                </Card>


                {/* How to Solve Accordion */}
                {isAccordionOpen && (
                  <Card variant="surface2" className="p-5 space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-text">
                        <Lightbulb className="w-4 h-4 text-warning" />
                        <span>How to Solve</span>
                      </div>
                      <button
                        onClick={() => setIsAccordionOpen(false)}
                        className="text-xs text-text-muted hover:text-text cursor-pointer"
                      >
                        Close ▲
                      </button>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed text-text">
                      <div>
                        <span className="font-bold text-accent uppercase tracking-wider text-[11px]">
                          Explanation:
                        </span>
                        <p className="mt-0.5 text-text-muted font-mono">
                          {currentQ.explanation || "Step-by-step solution for this topic calculation."}
                        </p>
                      </div>

                      {currentQ.shortcut && (
                        <div>
                          <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                            Fast Exam Method:
                          </span>
                          <p className="mt-0.5 text-text bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-btn font-mono">
                            ⚡ {currentQ.shortcut}
                          </p>
                        </div>
                      )}

                      {currentQ.common_trap && (
                        <div>
                          <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                            Common Trap:
                          </span>
                          <p className="mt-0.5 text-text bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-btn font-mono">
                            ⚠️ {currentQ.common_trap}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Right Column / Side Drawer: Spacious Uncompressed Question Palette */}
          {showPaletteDrawer && (
            <div className="lg:col-span-4 space-y-4 sticky top-4 font-mono">
              <Card variant="default" className="p-4 md:p-5 space-y-4 border border-[#2B2825] shadow-xl bg-[#121110] rounded-2xl">
                
                {/* Palette Title & Total Count */}
                <div className="flex items-center justify-between border-b border-[#262422] pb-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-text text-sm">
                    <Layers className="w-4 h-4 text-accent" />
                    <span>Question Palette</span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1A1917] border border-[#262422] text-accent font-bold">
                    {questions.length} Questions
                  </span>
                </div>

                {/* Score Summary Metrics (Green Correct / Red Incorrect) */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 font-bold">
                    ✓ {totalCorrect} Correct
                  </div>
                  <div className="p-2 rounded-xl bg-red-950/50 border border-red-800/60 text-red-400 font-bold">
                    ✗ {totalIncorrect} Incorrect
                  </div>
                  <div className="p-2 rounded-xl bg-[#1A1917] border border-[#262422] text-[#A39E98] font-bold">
                    ○ {questions.length - totalAnswered} Pending
                  </div>
                </div>

                {/* Chunked Page Selector Tabs (e.g. Q 1-25, Q 26-50...) */}
                {totalChunks > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 border-y border-[#262422]">
                    {Array.from({ length: totalChunks }).map((_, chunkIdx) => {
                      const startNum = chunkIdx * CHUNK_SIZE + 1;
                      const endNum = Math.min((chunkIdx + 1) * CHUNK_SIZE, questions.length);
                      const isChunkActive = paletteChunkPage === chunkIdx;

                      return (
                        <button
                          key={chunkIdx}
                          type="button"
                          onClick={() => setPaletteChunkPage(chunkIdx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                            isChunkActive
                              ? "bg-accent text-white shadow-md font-extrabold"
                              : "bg-[#1A1917] text-[#A39E98] hover:text-text border border-[#262422]"
                          }`}
                        >
                          Q {startNum}-{endNum}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Spacious Question Grid — h-10 buttons with Number + Icon */}
                <div className="max-h-[380px] overflow-y-auto p-1.5">
                  <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                    {currentChunkQuestions.map((_, relativeIdx) => {
                      const actualIdx = currentChunkStart + relativeIdx;
                      const isCurrent = actualIdx === currentQIndex;
                      const submitRes = submitResponses[actualIdx];
                      const isMarked = markedForReview[actualIdx];
                      const isAnswered = answeredOptions[actualIdx] !== undefined;

                      let btnStyle = "bg-[#1A1917] text-[#A39E98] border-[#262422] hover:border-[#383530]";
                      let statusBadge = (actualIdx + 1).toString().padStart(2, "0");

                      if (submitRes) {
                        if (submitRes.is_correct) {
                          // Vibrant GREEN for Correct with checkmark + number
                          btnStyle = "bg-emerald-600 text-white font-extrabold border-emerald-500 shadow-sm";
                          statusBadge = `✓ ${(actualIdx + 1).toString().padStart(2, "0")}`;
                        } else {
                          // Vibrant RED for Incorrect with cross + number
                          btnStyle = "bg-red-600 text-white font-extrabold border-red-500 shadow-sm";
                          statusBadge = `✗ ${(actualIdx + 1).toString().padStart(2, "0")}`;
                        }
                      } else if (isAnswered) {
                        btnStyle = "bg-[#332218] text-[#E58038] border-[#52331F] font-bold";
                      } else if (isMarked) {
                        btnStyle = "bg-amber-950/70 text-amber-300 border-amber-600/70 font-bold";
                        statusBadge = `! ${(actualIdx + 1).toString().padStart(2, "0")}`;
                      }

                      return (
                        <button
                          key={actualIdx}
                          type="button"
                          onClick={() => {
                            setCurrentQIndex(actualIdx);
                            const ans = answeredOptions[actualIdx];
                            setSelectedOption(ans ?? null);
                            setSubmitted(ans !== undefined);
                          }}
                          className={`h-10 rounded-xl text-xs font-mono font-bold tracking-tight flex items-center justify-center transition-all cursor-pointer ${btnStyle} ${
                            isCurrent
                              ? "border-2 border-accent bg-[#332218] text-accent font-extrabold shadow-md shadow-accent/20"
                              : "hover:border-text-muted"
                          }`}
                        >
                          {statusBadge}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Legend Footer */}
                <div className="border-t border-[#262422] pt-3 space-y-1.5 text-xs text-[#A39E98]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
                      <span>✓ Correct</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-red-400 font-bold">
                      <span className="w-3 h-3 rounded bg-red-600 inline-block"></span>
                      <span>✗ Incorrect</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 text-accent font-bold">
                      <span className="w-3 h-3 rounded border border-accent bg-[#332218] inline-block"></span>
                      <span>Active Question</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#1A1917] border border-[#262422] inline-block"></span>
                      <span>Unanswered</span>
                    </span>
                  </div>
                </div>

              </Card>
            </div>
          )}
        </div>
      )}
    </GlobalShell>
  );
}
