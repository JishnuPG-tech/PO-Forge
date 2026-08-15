import React from "react";
import Link from "next/link";
import { Button } from "./Button";
import { Card } from "./Card";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}) => {
  return (
    <Card variant="default" className={`p-8 text-center space-y-4 max-w-md mx-auto ${className}`}>
      <div className="space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-text font-mono">
          {title}
        </h3>
        <p className="text-xs text-text-muted leading-relaxed">{description}</p>
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="secondary" size="sm">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
