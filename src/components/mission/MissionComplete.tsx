import React from "react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { Check } from "lucide-react";

export interface MissionCompleteProps {
  score: number;
  totalQuestions: number;
  accuracyPercent: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  avgTimeSeconds: number;
  totalTimeFormatted: string;
}

export const MissionComplete: React.FC<MissionCompleteProps> = ({
  score = 82,
  totalQuestions = 100,
  accuracyPercent = 82,
  correctCount = 82,
  incorrectCount = 16,
  skippedCount = 2,
  avgTimeSeconds = 42,
  totalTimeFormatted = "42:18",
}) => {
  return (
    <Card className="max-w-xl mx-auto p-8 border-accent/40 bg-surface space-y-6 text-center shadow-lg">
      <div className="flex flex-col items-center space-y-3">
        {/* Single quiet 250ms checkmark draw-in animation (no confetti, no sound) */}
        <div className="w-14 h-14 rounded-full bg-success-soft text-success flex items-center justify-center border border-success/40 animate-in zoom-in-75 duration-200">
          <Check className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-text uppercase">
          Mission Complete
        </h2>
        <div className="text-4xl font-extrabold font-mono tabular-nums text-text">
          {score} <span className="text-lg text-text-muted font-normal">/ {totalQuestions}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-surface-2 rounded-card border border-border text-center font-mono">
        <div>
          <span className="text-[11px] text-text-muted uppercase">Accuracy</span>
          <div className="text-lg font-bold text-success mt-0.5">{accuracyPercent}%</div>
        </div>
        <div>
          <span className="text-[11px] text-text-muted uppercase">Correct</span>
          <div className="text-lg font-bold text-text mt-0.5">{correctCount}</div>
        </div>
        <div>
          <span className="text-[11px] text-text-muted uppercase">Incorrect</span>
          <div className="text-lg font-bold text-danger mt-0.5">{incorrectCount}</div>
        </div>
        <div>
          <span className="text-[11px] text-text-muted uppercase">Skipped</span>
          <div className="text-lg font-bold text-text-muted mt-0.5">{skippedCount}</div>
        </div>
      </div>

      <div className="flex items-center justify-around text-xs font-mono text-text-muted bg-surface-2 p-3 rounded-card border border-border">
        <span>Avg Time: <strong className="text-text">{avgTimeSeconds} sec</strong></span>
        <span>Total Time: <strong className="text-text">{totalTimeFormatted}</strong></span>
      </div>

      <div className="pt-2">
        <Link href="/analysis">
          <Button variant="primary" size="lg" fullWidth>
            <span>View Full Analysis →</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
};
