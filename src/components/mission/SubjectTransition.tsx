import React from "react";
import { Button, Card } from "@/components/ui";
import { Check } from "lucide-react";

export interface SubjectTransitionProps {
  completedSubjectName: string;
  nextSubjectName: string;
  totalAnswered: number;
  accuracyPercent: number;
  avgTimeSeconds: number;
  strongestTopic: string;
  needsAttentionTopic: string;
  onContinue: () => void;
}

export const SubjectTransition: React.FC<SubjectTransitionProps> = ({
  completedSubjectName,
  nextSubjectName,
  totalAnswered,
  accuracyPercent,
  avgTimeSeconds,
  strongestTopic,
  needsAttentionTopic,
  onContinue,
}) => {
  return (
    <Card className="max-w-xl mx-auto p-8 border-accent/40 bg-surface space-y-6 text-center shadow-lg">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-success-soft text-success flex items-center justify-center border border-success/30">
          <Check className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-text uppercase">
          {completedSubjectName} Complete
        </h2>
        <span className="text-xs font-mono text-text-muted">{totalAnswered} / {totalAnswered} answered</span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-surface-2 rounded-card border border-border text-center font-mono">
        <div>
          <span className="text-xs text-text-muted uppercase">Accuracy</span>
          <div className="text-2xl font-bold text-success mt-0.5">{accuracyPercent}%</div>
        </div>
        <div>
          <span className="text-xs text-text-muted uppercase">Avg Time</span>
          <div className="text-2xl font-bold text-text mt-0.5">{avgTimeSeconds} sec</div>
        </div>
      </div>

      <div className="space-y-2 text-xs text-left bg-surface-2 p-4 rounded-card border border-border">
        <div className="flex justify-between">
          <span className="text-text-muted">Strongest topic:</span>
          <span className="font-semibold text-success">{strongestTopic}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Needs attention:</span>
          <span className="font-semibold text-warning">{needsAttentionTopic}</span>
        </div>
      </div>

      <div className="pt-2">
        <Button variant="primary" size="lg" fullWidth onClick={onContinue}>
          <span>Continue to {nextSubjectName} →</span>
        </Button>
      </div>
    </Card>
  );
};
