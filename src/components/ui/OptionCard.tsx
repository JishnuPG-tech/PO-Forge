"use client";

import React from "react";

import { Check, X } from "lucide-react";

export type OptionState = "default" | "hover" | "selected" | "correct" | "incorrect";

export interface OptionCardProps {
  label: string; // e.g. "A", "B", "C", "D", "E"
  text: string;
  state?: OptionState;
  onClick?: () => void;
  disabled?: boolean;
  examMode?: boolean; // If true, strips accent colors for clinical grayscale exam mode
  className?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  label,
  text,
  state = "default",
  onClick,
  disabled = false,
  examMode = false,
  className = "",
}) => {
  const getStyles = () => {
    if (examMode) {
      // Plain clinical grayscale styling for full exam mode
      switch (state) {
        case "selected":
          return "border-text bg-surface-2 text-text font-bold";
        case "hover":
          return "border-text-muted bg-surface text-text";
        default:
          return "border-border bg-surface text-text hover:border-text-muted";
      }
    }

    switch (state) {
      case "selected":
        return "border-accent bg-accent-soft text-text font-medium";
      case "correct":
        return "border-success bg-success-soft text-text font-medium";
      case "incorrect":
        return "border-danger bg-danger-soft text-text font-medium";
      case "hover":
        return "border-accent/60 bg-surface text-text";
      default:
        return "border-border bg-surface text-text hover:border-accent/40";
    }
  };

  const renderIndicator = () => {
    if (!examMode && state === "correct") {
      return (
        <div className="w-5 h-5 rounded-full bg-success text-surface flex items-center justify-center flex-shrink-0">
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      );
    }
    if (!examMode && state === "incorrect") {
      return (
        <div className="w-5 h-5 rounded-full bg-danger text-surface flex items-center justify-center flex-shrink-0">
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      );
    }
    if (state === "selected") {
      return (
        <div
          className={`w-5 h-5 rounded-full border-2 ${
            examMode ? "border-text bg-text" : "border-accent bg-accent"
          } flex items-center justify-center flex-shrink-0`}
        >
          <div className="w-2 h-2 rounded-full bg-surface" />
        </div>
      );
    }
    return (
      <div className="w-5 h-5 rounded-full border border-border flex-shrink-0 group-hover:border-text-muted" />
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group w-full text-left p-4 rounded-card border transition-all duration-150 ease-out flex items-start justify-between gap-3 text-sm leading-relaxed select-none cursor-pointer disabled:cursor-default ${getStyles()} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="font-mono text-text-muted font-semibold">{label}.</span>
        <span className="text-text">{text}</span>
      </div>
      {renderIndicator()}
    </button>
  );
};
