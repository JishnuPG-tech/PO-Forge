"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, OptionCard, OptionState } from "@/components/ui";
import { CheckCircle2, ArrowRight, BookOpen } from "lucide-react";

export default function CAQuestionPage() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const question = {
    text: "Which institution released the Financial Stability Report (FSR)?",
    options: [
      { label: "A", text: "RBI (Reserve Bank of India)" },
      { label: "B", text: "SEBI" },
      { label: "C", text: "NABARD" },
      { label: "D", text: "IMF" },
    ],
    correctIndex: 0, // A: RBI
    explanation: "The Reserve Bank of India (RBI) publishes the Financial Stability Report (FSR) bi-annually, presenting the collective assessment of the Sub-Committee of the Financial Stability and Development Council (FSDC) on risks to financial stability.",
    source: "RBI Press Release • August 2026",
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setSubmitted(true);
  };

  return (
    <GlobalShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between text-xs text-text-muted border-b border-border pb-2 font-mono">
          <Link href="/current-affairs" className="hover:text-text">
            ← Current Affairs
          </Link>
          <span>Banking & Economy • Q 1/10</span>
        </div>

        {/* Question Stem */}
        <Card variant="default" className="p-6">
          <p className="text-base font-semibold text-text leading-relaxed">
            {question.text}
          </p>
        </Card>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((opt, idx) => {
            let optState: OptionState = "default";
            if (selectedOption === idx) optState = "selected";
            if (submitted) {
              if (idx === question.correctIndex) optState = "correct";
              else if (selectedOption === idx) optState = "incorrect";
            }

            return (
              <OptionCard
                key={idx}
                label={opt.label}
                text={opt.text}
                state={optState}
                disabled={submitted}
                onClick={() => !submitted && setSelectedOption(idx)}
              />
            );
          })}
        </div>

        {/* Submit or Inline Feedback */}
        {!submitted ? (
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={selectedOption === null}
              onClick={handleSubmit}
            >
              Submit Answer
            </Button>
          </div>
        ) : (
          <Card variant="default" className="p-5 border-success/40 bg-success-soft space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-sm font-bold text-success border-b border-border pb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Correct — RBI</span>
            </div>

            <p className="text-xs text-text leading-relaxed font-mono">
              {question.explanation}
            </p>

            <div className="text-[11px] font-mono text-text-muted">
              Source: {question.source}
            </div>

            <div className="pt-2">
              <Link href="/current-affairs">
                <Button variant="primary" size="md" fullWidth>
                  Next Question →
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </GlobalShell>
  );
}
