"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OptionCard, Timer, Skeleton } from "@/components/ui";
import { questionsApi, QuestionResponse } from "@/lib/api";

export default function ExamModePage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<"REASONING" | "QUANT">("REASONING");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(12 * 60 + 4);
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [answeredOptions, setAnsweredOptions] = useState<Record<number, number>>({});

  // Backend questions API state
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true);
      try {
        const data = await questionsApi.searchQuestions({ subject_code: activeSection, limit: 40 });
        setQuestions(data);
      } catch (e) {
        console.warn("Failed to load exam questions from backend:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, [activeSection]);

  const currentQ: QuestionResponse | undefined = questions[currentQIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    setAnsweredOptions((prev) => ({ ...prev, [currentQIndex]: idx }));
  };

  const handleClearResponse = () => {
    setSelectedOption(null);
    const updated = { ...answeredOptions };
    delete updated[currentQIndex];
    setAnsweredOptions(updated);
  };

  const toggleMarkForReview = () => {
    setMarkedForReview((prev) => ({ ...prev, [currentQIndex]: !prev[currentQIndex] }));
  };

  const handleSubmitSection = () => {
    if (activeSection === "REASONING") {
      setActiveSection("QUANT");
      setCurrentQIndex(0);
      setSelectedOption(null);
    } else {
      router.push("/mock/result");
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans selection:bg-text/20">
      {/* Exam Header */}
      <header className="h-12 border-b border-border bg-surface px-6 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="font-bold text-text">IBPS RRB PO PRELIMS (FULL MOCK)</span>
          <span className="text-text-muted">• Clinical Exam Mode</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span>Time Remaining:</span>
            <Timer seconds={seconds} showIcon={false} className="text-text text-base font-bold" />
          </div>
          <button
            onClick={handleSubmitSection}
            className="px-3 py-1 bg-surface-2 border border-border text-text font-bold hover:bg-border/60 rounded-btn cursor-pointer"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Section Tabs Bar */}
      <div className="bg-surface-2 border-b border-border px-6 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span>Sections:</span>
          {(["REASONING", "QUANT"] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-3 py-1 rounded-btn border text-xs font-bold cursor-pointer ${
                activeSection === sec
                  ? "bg-surface text-text border-text"
                  : "bg-surface-2 text-text-muted border-border hover:text-text"
              }`}
            >
              {sec === "REASONING" ? "Reasoning Ability" : "Quantitative Aptitude"}
            </button>
          ))}
        </div>
        <span className="text-text-muted">Sectional timer active</span>
      </div>

      {/* Main Grayscale 70/30 Split Layout */}
      <main className="flex-1 max-w-[1120px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-10 gap-6">
        {isLoading || !currentQ ? (
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-32" />
          </div>
        ) : (
          /* Left 70%: Question Stem & Options */
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono border-b border-border pb-2">
              <span>SECTION: {activeSection}</span>
              <span className="font-bold">
                Q {currentQIndex + 1} / {questions.length}
              </span>
            </div>

            <div className="bg-surface border border-border p-6 rounded-card space-y-4">
              <p className="text-sm font-medium text-text leading-relaxed whitespace-pre-line">
                {currentQ.text}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((optText, idx) => {
                const labels = ["(A)", "(B)", "(C)", "(D)", "(E)"];
                return (
                  <OptionCard
                    key={idx}
                    label={labels[idx]}
                    text={optText.replace(/^\([A-E]\)\s*/, "")}
                    examMode={true}
                    state={selectedOption === idx ? "selected" : "default"}
                    onClick={() => handleSelectOption(idx)}
                  />
                );
              })}
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-border gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="px-3 py-2 bg-surface border border-border text-text hover:bg-surface-2 rounded-btn disabled:opacity-40"
                >
                  ← Previous
                </button>
                <button
                  onClick={toggleMarkForReview}
                  className={`px-3 py-2 border rounded-btn ${
                    markedForReview[currentQIndex]
                      ? "bg-surface-2 border-text text-text font-bold"
                      : "bg-surface border-border text-text-muted hover:text-text"
                  }`}
                >
                  Mark for Review
                </button>
                <button
                  onClick={handleClearResponse}
                  className="px-3 py-2 bg-surface border border-border text-text-muted hover:text-text rounded-btn"
                >
                  Clear Response
                </button>
              </div>

              <button
                onClick={handleSubmitSection}
                className="px-5 py-2 bg-text text-bg font-bold border border-text rounded-btn hover:bg-text-muted cursor-pointer"
              >
                SUBMIT SECTION →
              </button>
            </div>
          </div>
        )}

        {/* Right 30%: Question Palette */}
        <div className="lg:col-span-3">
          <div className="bg-surface border border-border p-4 rounded-card space-y-4">
            <div className="flex items-center justify-between text-xs font-bold font-mono border-b border-border pb-2">
              <span>PALETTE</span>
              <span>{questions.length || 40} Qs</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
              {Array.from({ length: questions.length || 40 }, (_, idx) => {
                const isCurrent = idx === currentQIndex;
                const isAnswered = answeredOptions[idx] !== undefined;
                const isMarked = markedForReview[idx];

                let cellStyle = "bg-surface-2 text-text-muted border-border";
                if (isCurrent) cellStyle = "border-text text-text font-bold bg-surface-2 ring-1 ring-text";
                else if (isAnswered) cellStyle = "bg-text text-bg font-bold border-text";
                else if (isMarked) cellStyle = "border-text-muted text-text font-bold";

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentQIndex(idx);
                      setSelectedOption(answeredOptions[idx] ?? null);
                    }}
                    className={`h-7 rounded-btn border flex items-center justify-center cursor-pointer ${cellStyle}`}
                  >
                    {(idx + 1).toString().padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
