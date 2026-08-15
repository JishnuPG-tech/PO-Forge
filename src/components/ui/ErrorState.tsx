import React from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { AlertTriangle } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}) => {
  return (
    <Card variant="default" className={`p-6 border-danger/30 space-y-4 max-w-md mx-auto ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-btn bg-danger-soft text-danger flex items-center justify-center border border-danger/30 flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-text">{title}</h3>
          <p className="text-xs text-text-muted">{message}</p>
        </div>
      </div>

      {onRetry && (
        <div className="flex justify-end pt-1">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
};
