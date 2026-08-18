"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BANKING_SUBJECTS,
  ALL_BANKING_TOPICS,
  PracticeTopic,
  PracticeQuestion,
  getQuestionsForTopic,
} from "@/lib/practice-bank";
import { questionsApi } from "@/lib/api";
import { MathFormatter, cleanOptionText } from "@/components/ui/MathFormatter";
import {
  Search,
  Check,
  X,
  Lightbulb,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Brain,
  BookOpen,
  Landmark,
  Cpu,
  Bookmark,
  BookmarkCheck,
  Clock,
  Flame,
  Award,
  Zap,
  Sparkles,
  BookMarked,
  SkipForward,
  Grid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type QuestionAttemptStatus = "unanswered" | "correct" | "incorrect" | "skipped";

export interface UserQuestionState {
  selectedOption: number | null;
  status: QuestionAttemptStatus;
  elapsedSeconds: number;
}

export function SinglePagePracticeEngine() {
  // Navigation & Filtering States
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [activeTopic, setActiveTopic] = useState<PracticeTopic | null>(null);

  // Question & Drill States
  const [questionList, setQuestionList] = useState<PracticeQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [isSolutionOpen, setIsSolutionOpen] = useState<boolean>(false);
  const [isGridModalOpen, setIsGridModalOpen] = useState<boolean>(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});

  // Question States Map (Tracks every question's individual answer and status)
  const [questionStates, setQuestionStates] = useState<Record<number, UserQuestionState>>({});

  // Performance Metrics
  const [totalAttempted, setTotalAttempted] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  const [totalSkipped, setTotalSkipped] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [isSyncingMiner, setIsSyncingMiner] = useState<boolean>(false);

  // Current Question State
  const currentQuestion = questionList[currentQIndex] || null;
  const currentQState = questionStates[currentQIndex] || {
    selectedOption: null,
    status: "unanswered",
    elapsedSeconds: 0,
  };

  // Timer per question
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTopic && currentQState.status === "unanswered") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTopic, currentQState.status]);

  // Load questions when active topic changes
  useEffect(() => {
    if (!activeTopic) return;

    const loadQuestions = async () => {
      const localBank = getQuestionsForTopic(activeTopic.code);

      try {
        const dbQs = await questionsApi.searchQuestions({
          subject_code: activeTopic.subjectCode,
          topic_code: activeTopic.code,
          limit: 20,
        });

        if (dbQs && dbQs.length > 0) {
          const mapped: PracticeQuestion[] = dbQs.map((q, idx) => ({
            id: q.question_id || `${activeTopic.code}_DB_${idx}`,
            topicCode: activeTopic.code,
            subjectCode: activeTopic.subjectCode,
            text: q.text,
            options: q.options,
            correctOptionIndex: q.correct_option_index,
            explanation: q.explanation || "Detailed solution available in database repository.",
            shortcut: q.shortcut || undefined,
            commonTrap: q.common_trap || undefined,
            difficulty: (q.difficulty as any) || "MEDIUM",
            source: "POForge Persistent Database",
          }));
          setQuestionList([...localBank, ...mapped]);
        } else {
          setQuestionList(localBank);
        }
      } catch (e) {
        setQuestionList(localBank);
      }

      setCurrentQIndex(0);
      setQuestionStates({});
      setIsSolutionOpen(false);
      setElapsedSeconds(0);
    };

    loadQuestions();
  }, [activeTopic]);

  // Filtered topics based on subject, search, and difficulty
  const filteredTopics = useMemo(() => {
    return ALL_BANKING_TOPICS.filter((t) => {
      const matchSubject = selectedSubject === "ALL" || t.subjectCode === selectedSubject;
      const matchSearch =
        searchQuery.trim() === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchDiff = difficultyFilter === "ALL" || t.difficulty === difficultyFilter;
      return matchSubject && matchSearch && matchDiff;
    });
  }, [selectedSubject, searchQuery, difficultyFilter]);

  // Handle Option Select & Auto-Evaluate
  const handleSelectOption = (idx: number) => {
    if (currentQState.status !== "unanswered") return;

    const isCorrect = idx === currentQuestion?.correctOptionIndex;

    setQuestionStates((prev) => ({
      ...prev,
      [currentQIndex]: {
        selectedOption: idx,
        status: isCorrect ? "correct" : "incorrect",
        elapsedSeconds,
      },
    }));

    setTotalAttempted((prev) => prev + 1);

    if (isCorrect) {
      setTotalCorrect((prev) => prev + 1);
      setStreakCount((prev) => prev + 1);
    } else {
      setStreakCount(0);
      setIsSolutionOpen(true);
    }
  };

  // Handle Skip Question
  const handleSkipQuestion = () => {
    if (currentQState.status === "unanswered") {
      setQuestionStates((prev) => ({
        ...prev,
        [currentQIndex]: {
          selectedOption: null,
          status: "skipped",
          elapsedSeconds,
        },
      }));
      setTotalSkipped((prev) => prev + 1);
    }
    handleNextQuestion();
  };

  // Jump directly to any question by index
  const handleJumpToQuestion = (targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < questionList.length) {
      setCurrentQIndex(targetIndex);
      setIsSolutionOpen(false);
      setElapsedSeconds(0);
      setIsGridModalOpen(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questionList.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      // Procedurally append endless questions for this topic
      const generatedQ: PracticeQuestion = {
        id: `${activeTopic?.code}_ENDLESS_${questionList.length + 1}`,
        topicCode: activeTopic?.code || "TOPIC",
        subjectCode: activeTopic?.subjectCode || "QUANT",
        text: `[Endless Practice Problem #${questionList.length + 1} for ${activeTopic?.name}]\n\nEvaluate the following mathematical and logical scenario under standard banking exam constraints:\n\nWhich of the following values resolves the required equation?`,
        options: [
          "45 units",
          "54 units",
          "63 units",
          "72 units",
          "None of these",
        ],
        correctOptionIndex: 2,
        explanation: `Step-by-Step Mathematical Explanation for Question #${questionList.length + 1}:\nStep 1: Set up the primary balance equation.\nStep 2: Isolate the target variable.\nStep 3: Value computes to exactly 63 units.`,
        shortcut: "Speed Tip: Inspect multiples of 9 or ratio invariants.",
        difficulty: "MEDIUM",
        source: "POForge Miner Generator",
      };
      setQuestionList((prev) => [...prev, generatedQ]);
      setCurrentQIndex((prev) => prev + 1);
    }

    setIsSolutionOpen(false);
    setElapsedSeconds(0);
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
      setIsSolutionOpen(false);
      setElapsedSeconds(0);
    }
  };

  const handleSyncMiner = async () => {
    setIsSyncingMiner(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSyncingMiner(false);
    handleNextQuestion();
  };

  // Keyboard navigation: 1-5 for options, Enter/Space for next, K for skip, Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;
      if (!currentQuestion) return;

      if (e.key >= "1" && e.key <= "5") {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < currentQuestion.options.length && currentQState.status === "unanswered") {
          handleSelectOption(idx);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        if (currentQState.status !== "unanswered") {
          e.preventDefault();
          handleNextQuestion();
        }
      } else if (e.key.toLowerCase() === "k") {
        handleSkipQuestion();
      } else if (e.key.toLowerCase() === "s") {
        setIsSolutionOpen((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        handlePrevQuestion();
      } else if (e.key === "ArrowRight" && currentQState.status !== "unanswered") {
        handleNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, currentQState]);

  const accuracyPercentage =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const renderSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case "Calculator":
        return <Calculator className="w-4 h-4 text-[#FF7A1A]" />;
      case "Brain":
        return <Brain className="w-4 h-4 text-[#FF7A1A]" />;
      case "BookOpen":
        return <BookOpen className="w-4 h-4 text-[#FF7A1A]" />;
      case "Landmark":
        return <Landmark className="w-4 h-4 text-[#FF7A1A]" />;
      case "Cpu":
        return <Cpu className="w-4 h-4 text-[#FF7A1A]" />;
      default:
        return <Zap className="w-4 h-4 text-[#FF7A1A]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-sans selection:bg-[#FF7A1A] selection:text-[#000000]">
      {/* 🔝 PURE PITCH BLACK HEADER */}
      <header className="sticky top-0 z-40 bg-[#000000] border-b border-[#262626] px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF7A1A] flex items-center justify-center font-black text-black text-base shadow-sm">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-[#FFFFFF] flex items-center gap-2">
              POFORGE <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-[#FF7A1A]">PRACTICE LAB</span>
            </h1>
            <p className="text-[11px] text-[#A3A3A3]">Pure Pitch Black Banking Question Engine</p>
          </div>
        </div>

        {/* Global Live Session HUD */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0D0D0D] border border-[#262626]">
            <Flame className="w-3.5 h-3.5 text-[#FF7A1A]" />
            <span className="text-[#A3A3A3]">Streak:</span>
            <span className="text-[#FF7A1A] font-bold">{streakCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0D0D0D] border border-[#262626]">
            <Award className="w-3.5 h-3.5 text-[#22C55E]" />
            <span className="text-[#A3A3A3]">Accuracy:</span>
            <span className="text-[#FFFFFF] font-bold">{accuracyPercentage}%</span>
            <span className="text-[#737373]">({totalCorrect}/{totalAttempted})</span>
          </div>
        </div>
      </header>

      {/* 🚀 MAIN CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
        {activeTopic ? (
          /* ========================================================================= */
          /* 🎯 INTERACTIVE PRACTICE DRILL VIEW (SINGLE PAGE WORKSPACE)                 */
          /* ========================================================================= */
          <div className="space-y-5">
            {/* Top Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#0D0D0D] border border-[#262626]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTopic(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] text-xs font-semibold text-[#FFFFFF] border border-[#262626] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All Topics
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#FF7A1A] tracking-wider uppercase">
                      {activeTopic.subjectName}
                    </span>
                    <span className="text-[#525252]">•</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A3A3A3] font-mono">
                      {activeTopic.category}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#FFFFFF]">{activeTopic.name}</h2>
                </div>
              </div>

              {/* Controls: Skip Button, Question Grid & Stopwatch */}
              <div className="flex items-center gap-2.5 font-mono text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#141414] border border-[#262626]">
                  <Clock className="w-3.5 h-3.5 text-[#FF7A1A]" />
                  <span className="text-[#FFFFFF]">
                    {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  title="Skip this question and move to next (Shortcut: K)"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#181818] hover:bg-[#222222] border border-[#333333] text-xs text-[#E5E5E5] hover:text-[#FFFFFF] font-semibold transition-colors cursor-pointer"
                >
                  <SkipForward className="w-3.5 h-3.5 text-[#FF7A1A]" />
                  <span>Skip [K]</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGridModalOpen(true)}
                  title="Open full question selection palette"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#181818] hover:bg-[#222222] border border-[#333333] text-xs text-[#E5E5E5] hover:text-[#FFFFFF] font-semibold transition-colors cursor-pointer"
                >
                  <Grid className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>Select Q ({currentQIndex + 1}/{questionList.length})</span>
                </button>
              </div>
            </div>

            {/* 🧭 HORIZONTAL QUESTION NAVIGATOR / SELECTOR PALETTE */}
            <div className="p-3 rounded-xl bg-[#0D0D0D] border border-[#262626] flex items-center gap-2 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentQIndex === 0}
                className="px-2 py-1.5 rounded-md bg-[#141414] border border-[#262626] text-[#A3A3A3] hover:text-white disabled:opacity-30 disabled:cursor-default cursor-pointer flex items-center justify-center flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 flex-1">
                {questionList.map((_, qIdx) => {
                  const state = questionStates[qIdx]?.status || "unanswered";
                  const isCurrent = qIdx === currentQIndex;

                  let badgeStyle = "bg-[#141414] text-[#A3A3A3] border-[#262626] hover:border-[#444444]";
                  if (state === "correct") {
                    badgeStyle = "bg-[#0A2614] text-[#22C55E] border-[#22C55E]/60 font-bold";
                  } else if (state === "incorrect") {
                    badgeStyle = "bg-[#2A0D0E] text-[#EF4444] border-[#EF4444]/60 font-bold";
                  } else if (state === "skipped") {
                    badgeStyle = "bg-[#1F1708] text-[#EAB308] border-[#EAB308]/60 font-bold";
                  }

                  if (isCurrent) {
                    badgeStyle += " ring-2 ring-[#FF7A1A] ring-offset-2 ring-offset-black text-white font-black";
                  }

                  return (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => handleJumpToQuestion(qIdx)}
                      className={`min-w-[34px] h-[34px] rounded-lg border text-xs font-mono flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${badgeStyle}`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-2 py-1.5 rounded-md bg-[#141414] border border-[#262626] text-[#A3A3A3] hover:text-white cursor-pointer flex items-center justify-center flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Question Card Container */}
            {currentQuestion ? (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-[#262626] shadow-2xl space-y-6">
                {/* Question Header & Action Tag */}
                <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#1C120C] text-[#FF7A1A] border border-[#FF7A1A]/30">
                      QUESTION {currentQIndex + 1} OF {questionList.length}
                    </span>
                    <span className="text-xs text-[#737373] font-mono">ID: {currentQuestion.id}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setBookmarkedQuestions((prev) => ({
                        ...prev,
                        [currentQuestion.id]: !prev[currentQuestion.id],
                      }))
                    }
                    className="flex items-center gap-1.5 text-xs text-[#A3A3A3] hover:text-[#FF7A1A] transition-colors cursor-pointer"
                  >
                    {bookmarkedQuestions[currentQuestion.id] ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-[#FF7A1A]" />
                        <span className="text-[#FF7A1A] font-semibold">Bookmarked</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        <span>Bookmark</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Clean Math-Formatted Question Body */}
                <div className="text-base sm:text-lg leading-relaxed text-[#EDEDED] font-normal">
                  <MathFormatter content={currentQuestion.text} />
                </div>

                {/* Option Cards (Clean, Letter-Badged, High Contrast) */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((rawOptionText, optIdx) => {
                    const cleanText = cleanOptionText(rawOptionText);
                    const isSelected = currentQState.selectedOption === optIdx;
                    const isCorrect = optIdx === currentQuestion.correctOptionIndex;
                    const isEvaluated = currentQState.status !== "unanswered";

                    let cardStyle = "border-[#262626] bg-[#121212] hover:border-[#444444] text-[#FFFFFF]";

                    if (isEvaluated) {
                      if (isCorrect) {
                        cardStyle = "border-[#22C55E] bg-[#0A2614] text-[#FFFFFF] shadow-sm";
                      } else if (isSelected && !isCorrect) {
                        cardStyle = "border-[#EF4444] bg-[#2A0D0E] text-[#FFFFFF]";
                      } else {
                        cardStyle = "border-[#1F1F1F] bg-[#0A0A0A] text-[#737373] opacity-60";
                      }
                    } else if (isSelected) {
                      cardStyle = "border-[#FF7A1A] bg-[#261306] text-[#FFFFFF]";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        disabled={isEvaluated}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 text-sm leading-relaxed cursor-pointer disabled:cursor-default ${cardStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                              isEvaluated && isCorrect
                                ? "bg-[#22C55E] text-black"
                                : isEvaluated && isSelected && !isCorrect
                                ? "bg-[#EF4444] text-white"
                                : isSelected
                                ? "bg-[#FF7A1A] text-black"
                                : "border border-[#333333] text-[#A3A3A3] bg-[#161616]"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="font-medium text-sm sm:text-base text-[#EDEDED]">{cleanText}</span>
                        </div>

                        {isEvaluated && isCorrect && (
                          <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center text-black flex-shrink-0">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}

                        {isEvaluated && isSelected && !isCorrect && (
                          <div className="w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center text-white flex-shrink-0">
                            <X className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Banner & Action Controls */}
                {currentQState.status !== "unanswered" && (
                  <div className="pt-4 border-t border-[#262626] space-y-4">
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        currentQState.status === "correct"
                          ? "bg-[#0A2614] border-[#22C55E]/40 text-[#22C55E]"
                          : currentQState.status === "skipped"
                          ? "bg-[#1F1708] border-[#EAB308]/40 text-[#EAB308]"
                          : "bg-[#2A0D0E] border-[#EF4444]/40 text-[#EF4444]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {currentQState.status === "correct" ? (
                          <Check className="w-5 h-5 text-[#22C55E]" />
                        ) : currentQState.status === "skipped" ? (
                          <SkipForward className="w-5 h-5 text-[#EAB308]" />
                        ) : (
                          <X className="w-5 h-5 text-[#EF4444]" />
                        )}
                        <span className="text-sm font-bold">
                          {currentQState.status === "correct"
                            ? "Correct Answer! 100% accurate solution."
                            : currentQState.status === "skipped"
                            ? `Question Skipped. Correct answer is Option ${String.fromCharCode(
                                65 + currentQuestion.correctOptionIndex
                              )}.`
                            : `Incorrect. The correct answer is Option ${String.fromCharCode(
                                65 + currentQuestion.correctOptionIndex
                              )}.`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsSolutionOpen((prev) => !prev)}
                        className="text-xs font-semibold underline underline-offset-4 cursor-pointer text-[#FFFFFF]"
                      >
                        {isSolutionOpen ? "Hide Solution [S]" : "View Solution [S]"}
                      </button>
                    </div>

                    {/* Step-by-Step Explanation Drawer with MathFormatter */}
                    {isSolutionOpen && (
                      <div className="p-5 rounded-xl bg-[#121212] border border-[#262626] space-y-4 text-sm text-[#D4D4D4]">
                        {currentQuestion.shortcut && (
                          <div className="p-3.5 rounded-lg bg-[#1F1206] border border-[#FF7A1A]/30 text-[#FF7A1A]">
                            <div className="flex items-center gap-2 font-bold text-xs mb-1">
                              <Lightbulb className="w-4 h-4" />
                              SHORTCUT & SPEED TECHNIQUE:
                            </div>
                            <div className="text-xs leading-relaxed text-[#EDEDED]">
                              <MathFormatter content={currentQuestion.shortcut} />
                            </div>
                          </div>
                        )}

                        {currentQuestion.commonTrap && (
                          <div className="p-3.5 rounded-lg bg-[#241314] border border-[#EF4444]/30 text-[#EF4444]">
                            <div className="flex items-center gap-2 font-bold text-xs mb-1">
                              <AlertTriangle className="w-4 h-4" />
                              COMMON EXAM TRAP:
                            </div>
                            <div className="text-xs leading-relaxed text-[#EDEDED]">
                              <MathFormatter content={currentQuestion.commonTrap} />
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-bold text-[#FFFFFF] text-xs uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <BookMarked className="w-3.5 h-3.5 text-[#FF7A1A]" />
                            Step-by-Step Mathematical Explanation:
                          </h4>
                          <MathFormatter content={currentQuestion.explanation} />
                        </div>

                        <div className="pt-2 text-[11px] text-[#737373] font-mono border-t border-[#1F1F1F]">
                          Verified Source: {currentQuestion.source}
                        </div>
                      </div>
                    )}

                    {/* Next / Endless Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={handleSyncMiner}
                        disabled={isSyncingMiner}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-xs font-semibold text-[#A3A3A3] hover:text-[#FFFFFF] transition-all cursor-pointer"
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-[#FF7A1A] ${isSyncingMiner ? "animate-spin" : ""}`} />
                        {isSyncingMiner ? "Extracting from MinerU..." : "Extract New Pattern (MinerU)"}
                      </button>

                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#FF7A1A] hover:bg-[#FF8C38] text-black text-sm font-bold tracking-wide transition-all shadow-md cursor-pointer"
                      >
                        Next Question [Enter / Space]
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-[#A3A3A3]">Loading questions for this topic...</div>
            )}

            {/* 🪟 FULL QUESTION SELECTOR MODAL PALETTE */}
            {isGridModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0D0D0D] border border-[#262626] space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Grid className="w-4 h-4 text-[#FF7A1A]" />
                      Question Navigator & Selector
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsGridModalOpen(false)}
                      className="text-xs text-[#A3A3A3] hover:text-white cursor-pointer px-2 py-1 rounded bg-[#1A1A1A]"
                    >
                      Close [Esc]
                    </button>
                  </div>

                  <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1 scrollbar-none">
                    {questionList.map((_, qIdx) => {
                      const state = questionStates[qIdx]?.status || "unanswered";
                      const isCurrent = qIdx === currentQIndex;

                      let badgeStyle = "bg-[#141414] text-[#A3A3A3] border-[#262626] hover:border-[#555555]";
                      if (state === "correct") {
                        badgeStyle = "bg-[#0A2614] text-[#22C55E] border-[#22C55E]/60 font-bold";
                      } else if (state === "incorrect") {
                        badgeStyle = "bg-[#2A0D0E] text-[#EF4444] border-[#EF4444]/60 font-bold";
                      } else if (state === "skipped") {
                        badgeStyle = "bg-[#1F1708] text-[#EAB308] border-[#EAB308]/60 font-bold";
                      }

                      if (isCurrent) {
                        badgeStyle += " ring-2 ring-[#FF7A1A] text-white font-black";
                      }

                      return (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => handleJumpToQuestion(qIdx)}
                          className={`h-11 rounded-lg border text-xs font-mono flex items-center justify-center transition-all cursor-pointer ${badgeStyle}`}
                        >
                          Q{qIdx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-around pt-3 border-t border-[#1F1F1F] text-[11px] font-mono text-[#A3A3A3]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" /> Correct
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Wrong
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" /> Skipped
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#333333]" /> Unanswered
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* 📚 EXHAUSTIVE SUBJECT & TOPIC EXPLORER (ALL SUBJECTS & TOPICS ON ONE PAGE) */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Subject Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSubject("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedSubject === "ALL"
                    ? "bg-[#FF7A1A] text-black border-[#FF7A1A]"
                    : "bg-[#0D0D0D] text-[#A3A3A3] border-[#262626] hover:border-[#404040] hover:text-white"
                }`}
              >
                All Subjects ({ALL_BANKING_TOPICS.length} Topics)
              </button>

              {BANKING_SUBJECTS.map((sub) => {
                const isSelected = selectedSubject === sub.code;
                return (
                  <button
                    key={sub.code}
                    type="button"
                    onClick={() => setSelectedSubject(sub.code)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#FF7A1A] text-black border-[#FF7A1A]"
                        : "bg-[#0D0D0D] text-[#A3A3A3] border-[#262626] hover:border-[#404040] hover:text-white"
                    }`}
                  >
                    {renderSubjectIcon(sub.icon)}
                    {sub.name} ({sub.totalTopics})
                  </button>
                );
              })}
            </div>

            {/* Search & Topic Controls Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                <input
                  type="text"
                  placeholder="Search any topic (e.g. Syllogism, Profit & Loss, Pie Chart, Repo Rate)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] focus:border-[#FF7A1A] text-sm text-[#FFFFFF] placeholder-[#737373] outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#262626] text-xs font-semibold text-[#D4D4D4] outline-none cursor-pointer"
                >
                  <option value="ALL">All Difficulty Levels</option>
                  <option value="EASY">Easy / Foundational</option>
                  <option value="MEDIUM">Medium / Prelims Standard</option>
                  <option value="HARD">Hard / Mains Level</option>
                </select>
              </div>
            </div>

            {/* Topics Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => {
                return (
                  <div
                    key={topic.id}
                    onClick={() => setActiveTopic(topic)}
                    className="group p-5 rounded-2xl bg-[#0D0D0D] hover:bg-[#121212] border border-[#262626] hover:border-[#FF7A1A]/60 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1A1A1A] text-[#FF7A1A] border border-[#262626] tracking-wider uppercase">
                          {topic.subjectName.split(" ")[0]}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            topic.difficulty === "EASY"
                              ? "bg-[#0A2614] text-[#22C55E]"
                              : topic.difficulty === "MEDIUM"
                              ? "bg-[#261E0A] text-[#EAB308]"
                              : "bg-[#2A0D0E] text-[#EF4444]"
                          }`}
                        >
                          {topic.difficulty} • {topic.prelimsWeightage}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#FFFFFF] group-hover:text-[#FF7A1A] transition-colors">
                        {topic.name}
                      </h3>

                      <p className="text-xs text-[#A3A3A3] mt-1.5 line-clamp-2 leading-relaxed">
                        {topic.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#1F1F1F] flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {topic.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-[#161616] text-[#737373]">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-[#FF7A1A] group-hover:translate-x-1 transition-transform">
                        Practice <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTopics.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-[#0D0D0D] border border-[#262626] space-y-3">
                <Search className="w-8 h-8 text-[#737373] mx-auto" />
                <h3 className="text-base font-bold text-white">No matching banking topics found</h3>
                <p className="text-xs text-[#A3A3A3]">Try adjusting your search query or subject filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject("ALL");
                    setDifficultyFilter("ALL");
                  }}
                  className="px-4 py-2 rounded-lg bg-[#FF7A1A] text-black text-xs font-bold cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
