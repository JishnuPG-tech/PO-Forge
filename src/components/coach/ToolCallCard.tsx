"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, X, ArrowRight, Loader2, RefreshCw, Undo2, Wrench } from "lucide-react";

export type ToolExecutionState = "pending_confirmation" | "running" | "applied" | "failed";

export interface ToolCallCardProps {
  toolName: string;
  description: string;
  diff: {
    label: string;
    before: string | number;
    after: string | number;
  };
  onConfirm: () => Promise<void>;
  onUndo?: () => Promise<void>;
  viewLink?: string;
  viewLinkLabel?: string;
}

export const ToolCallCard: React.FC<ToolCallCardProps> = ({
  toolName,
  description,
  diff,
  onConfirm,
  onUndo,
  viewLink = "/",
  viewLinkLabel = "View Today Page",
}) => {
  const [state, setState] = useState<ToolExecutionState>("pending_confirmation");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    setState("running");
    setErrorMessage(null);
    try {
      await onConfirm();
      setState("applied");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to execute mutation");
      setState("failed");
    }
  };

  const handleUndo = async () => {
    if (!onUndo) return;
    setState("running");
    try {
      await onUndo();
      setState("pending_confirmation");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to undo mutation");
      setState("failed");
    }
  };

  return (
    <div className="my-3 p-3.5 bg-surface rounded-btn border border-border space-y-3 font-mono text-xs text-text shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Wrench className="w-3.5 h-3.5 text-accent" />
          <span className="font-bold text-accent uppercase tracking-wider">{toolName}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-surface-2 border border-border text-text-muted">
          {state === "pending_confirmation" && "CONFIRMATION REQUIRED"}
          {state === "running" && "EXECUTING..."}
          {state === "applied" && "APPLIED"}
          {state === "failed" && "MUTATION FAILED"}
        </span>
      </div>

      {/* Description */}
      <p className="text-text-muted font-sans text-xs">{description}</p>

      {/* Before / After Diff */}
      <div className="p-2.5 bg-surface-2 rounded border border-border flex items-center justify-between text-xs">
        <span className="text-text-muted">{diff.label}:</span>
        <div className="flex items-center gap-2 font-bold font-mono">
          <span className="line-through text-text-muted">{diff.before}</span>
          <ArrowRight className="w-3 h-3 text-accent" />
          <span className="text-accent">{diff.after}</span>
        </div>
      </div>

      {/* Error Output if Failed */}
      {state === "failed" && errorMessage && (
        <div className="p-2 bg-danger-soft border border-danger/40 rounded text-danger text-[11px]">
          {errorMessage}
        </div>
      )}

      {/* Actions per State */}
      <div className="pt-1 flex items-center justify-between border-t border-border">
        {state === "pending_confirmation" && (
          <div className="flex items-center gap-2 w-full justify-end">
            <button
              onClick={() => setState("failed")}
              className="px-3 py-1 rounded border border-border text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-3 py-1 rounded bg-accent text-white font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Confirm & Apply</span>
            </button>
          </div>
        )}

        {state === "running" && (
          <div className="flex items-center gap-2 text-accent font-bold">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating backend state...</span>
          </div>
        )}

        {state === "applied" && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-success font-bold">
              <Check className="w-4 h-4" />
              <span>State updated successfully</span>
            </div>
            <div className="flex items-center gap-2">
              {onUndo && (
                <button
                  onClick={handleUndo}
                  className="px-2.5 py-1 rounded border border-border text-text-muted hover:text-text flex items-center gap-1 cursor-pointer"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>Undo</span>
                </button>
              )}
              <Link
                href={viewLink}
                className="px-3 py-1 rounded bg-surface-2 border border-border text-accent font-bold hover:bg-surface transition-colors flex items-center gap-1"
              >
                <span>{viewLinkLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {state === "failed" && (
          <div className="flex items-center justify-between w-full">
            <span className="text-danger font-bold">Mutation failed</span>
            <button
              onClick={handleConfirm}
              className="px-3 py-1 rounded bg-danger text-white font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
