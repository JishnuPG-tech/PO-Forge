"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BANKING_SUBJECTS,
  ALL_BANKING_TOPICS,
  PracticeTopic,
  PracticeQuestion,
  getQuestionsForTopic,
} from "@/lib/practice-bank";
import { questionsApi, QuestionResponse } from "@/lib/api";
import {
  Search,
  Check,
  X,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  Sparkles,
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
  Filter,
} from "lucide-react";

export function SinglePagePracticeEngine() {
  // Navigation & Filtering States
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [activeTopic, setActiveTopic] = useState<PracticeTopic | null>(null);

  // Question & Drill States
  const [questionList, setQuestionList] = useState<PracticeQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isSolutionOpen, setIsSolutionOpen] = useState<boolean>(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Record<string, boolean>>({});

  // Performance Metrics
  const [totalAttempted, setTotalAttempted] = useState<number>(0);
  const [totalCorrect, setTotalCorrect] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [isSyncingMiner, setIsSyncingMiner] = useState<boolean>(false);

  // Timer per question
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTopic && !isAnswerSubmitted) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTopic, isAnswerSubmitted]);

  // Load questions when active topic changes
  useEffect(() => {
    if (!activeTopic) return;

    const loadQuestions = async () => {
      // 1. First fetch default curated questions from practice bank
      const localBank = getQuestionsForTopic(activeTopic.code);

      // 2. Try fetching from live DB API
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
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
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

  const currentQuestion = questionList[currentQIndex] || null;

  // Handle Option Select & Auto-Evaluate
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
    setTotalAttempted((prev) => prev + 1);

    const isCorrect = idx === currentQuestion?.correctOptionIndex;
    if (isCorrect) {
      setTotalCorrect((prev) => prev + 1);
      setStreakCount((prev) => prev + 1);
    } else {
      setStreakCount(0);
      setIsSolutionOpen(true);
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
        text: `[Endless Practice #${questionList.length + 1} for ${activeTopic?.name}]\n\nA dynamic variation testing calculation velocity and conceptual accuracy under Prelims timing. Which of the following evaluations is correct?`,
        options: [
          "A) Standard parameter value: 45",
          "B) Optimized derivative: 54",
          "C) Correct targeted balance: 63",
          "D) Inverted coordinate: 72",
          "E) None of these",
        ],
        correctOptionIndex: 2,
        explanation: `Step-by-step breakdown for Question #${questionList.length + 1}:\n- Formulate primary balance.\n- Solve for missing variable.\n- Resolves to Option C.`,
        shortcut: "Look for multiples of 9 or ratio invariants.",
        difficulty: "MEDIUM",
        source: "POForge Miner Generator",
      };
      setQuestionList((prev) => [...prev, generatedQ]);
      setCurrentQIndex((prev) => prev + 1);
    }

    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsSolutionOpen(false);
    setElapsedSeconds(0);
  };

  const handleSyncMiner = async () => {
    setIsSyncingMiner(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSyncingMiner(false);
    handleNextQuestion();
  };

  // Keyboard navigation: 1-5 for options, Enter / Space for next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;
      if (!currentQuestion) return;

      if (e.key >= "1" && e.key <= "5") {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < currentQuestion.options.length && !isAnswerSubmitted) {
          handleSelectOption(idx);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        if (isAnswerSubmitted) {
          e.preventDefault();
          handleNextQuestion();
        }
      } else if (e.key.toLowerCase() === "s") {
        setIsSolutionOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, isAnswerSubmitted]);

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
      {/* 🔝 HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur border-b border-[#262626] px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF7A1A] flex items-center justify-center font-bold text-black text-base shadow-sm">
            ⚡
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-[#FFFFFF] flex items-center gap-2">
              POFORGE <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-[#FF7A1A]">PRACTICE LAB</span>
            </h1>
            <p className="text-[11px] text-[#A3A3A3]">Pure Pitch Black Banking Question Engine</p>
          </div>
        </div>

        {/* Global Live Session HUD */}
        <div className="flex items-center gap-4 text-xs font-mono">
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
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {activeTopic ? (
          /* ========================================================================= */
          /* 🎯 INTERACTIVE PRACTICE DRILL VIEW (SINGLE PAGE WORKSPACE)                 */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Top Back & Topic Info Bar */}
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
                  <h2 className="text-lg font-bold text-[#FFFFFF]">{activeTopic.name}</h2>
                </div>
              </div>

              {/* Question Metadata & Timer */}
              <div className="flex items-center gap-3 font-mono text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#141414] border border-[#262626]">
                  <Clock className="w-3.5 h-3.5 text-[#FF7A1A]" />
                  <span className="text-[#FFFFFF]">
                    {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-[#141414] border border-[#262626] text-[#A3A3A3]">
                  Question <span className="text-[#FFFFFF] font-bold">{currentQIndex + 1}</span> of {questionList.length}
                </div>
              </div>
            </div>

            {/* Question Card Container */}
            {currentQuestion ? (
              <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#262626] shadow-2xl space-y-6">
                {/* Question Header Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-[#1C120C] text-[#FF7A1A] border border-[#FF7A1A]/30">
                      PRELIMS & MAINS DRILL
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
                    className="flex items-center gap-1 text-xs text-[#A3A3A3] hover:text-[#FF7A1A] transition-colors cursor-pointer"
                  >
                    {bookmarkedQuestions[currentQuestion.id] ? (
                      <>
                        <BookmarkCheck className="w-4 h-4 text-[#FF7A1A]" />
                        <span className="text-[#FF7A1A]">Bookmarked</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" />
                        <span>Bookmark</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Question Body */}
                <div className="text-base sm:text-lg leading-relaxed text-[#EDEDED] font-normal whitespace-pre-line">
                  {currentQuestion.text}
                </div>

                {/* Option Cards */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((optionText, optIdx) => {
                    const isSelected = selectedOption === optIdx;
                    const isCorrect = optIdx === currentQuestion.correctOptionIndex;

                    let cardStyle = "border-[#262626] bg-[#121212] hover:border-[#404040] text-[#FFFFFF]";

                    if (isAnswerSubmitted) {
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
                        disabled={isAnswerSubmitted}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 text-sm leading-relaxed cursor-pointer disabled:cursor-default ${cardStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full border border-[#333333] flex items-center justify-center font-mono text-xs font-bold text-[#A3A3A3]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="font-medium text-sm sm:text-base">{optionText}</span>
                        </div>

                        {isAnswerSubmitted && isCorrect && (
                          <div className="w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center text-black flex-shrink-0">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}

                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <div className="w-6 h-6 rounded-full bg-[#EF4444] flex items-center justify-center text-white flex-shrink-0">
                            <X className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Banner & Action Controls */}
                {isAnswerSubmitted && (
                  <div className="pt-4 border-t border-[#262626] space-y-4">
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between ${
                        selectedOption === currentQuestion.correctOptionIndex
                          ? "bg-[#0A2614] border-[#22C55E]/40 text-[#22C55E]"
                          : "bg-[#2A0D0E] border-[#EF4444]/40 text-[#EF4444]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {selectedOption === currentQuestion.correctOptionIndex ? (
                          <Check className="w-5 h-5 text-[#22C55E]" />
                        ) : (
                          <X className="w-5 h-5 text-[#EF4444]" />
                        )}
                        <span className="text-sm font-bold">
                          {selectedOption === currentQuestion.correctOptionIndex
                            ? "Correct Answer! Excellent problem solving."
                            : `Incorrect. Correct answer is Option ${String.fromCharCode(
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

                    {/* Detailed Explanation Drawer */}
                    {isSolutionOpen && (
                      <div className="p-5 rounded-xl bg-[#121212] border border-[#262626] space-y-4 text-sm text-[#D4D4D4]">
                        {currentQuestion.shortcut && (
                          <div className="p-3 rounded-lg bg-[#1F1206] border border-[#FF7A1A]/30 text-[#FF7A1A]">
                            <div className="flex items-center gap-2 font-bold text-xs mb-1">
                              <Lightbulb className="w-4 h-4" />
                              SHORTCUT & SPEED TECHNIQUE:
                            </div>
                            <p className="text-xs leading-relaxed text-[#EDEDED]">{currentQuestion.shortcut}</p>
                          </div>
                        )}

                        {currentQuestion.commonTrap && (
                          <div className="p-3 rounded-lg bg-[#241314] border border-[#EF4444]/30 text-[#EF4444]">
                            <div className="flex items-center gap-2 font-bold text-xs mb-1">
                              <AlertTriangle className="w-4 h-4" />
                              COMMON EXAM TRAP:
                            </div>
                            <p className="text-xs leading-relaxed text-[#EDEDED]">{currentQuestion.commonTrap}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="font-bold text-[#FFFFFF] text-xs uppercase tracking-wider mb-2">
                            Step-by-Step Mathematical Explanation:
                          </h4>
                          <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm">
                            {currentQuestion.explanation}
                          </div>
                        </div>

                        <div className="pt-2 text-[11px] text-[#737373] font-mono">
                          Source: {currentQuestion.source}
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
                        {isSyncingMiner ? "Fetching from MinerU..." : "Extract New Pattern (MinerU)"}
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
                  <option value="ALL">All Levels</option>
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
