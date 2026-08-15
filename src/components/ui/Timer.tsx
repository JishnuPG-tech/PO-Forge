"use client";

import React from "react";

import { Clock } from "lucide-react";

export interface TimerProps {
  seconds: number;
  targetSeconds?: number;
  showIcon?: boolean;
  className?: string;
}

export const Timer: React.FC<TimerProps> = ({
  seconds,
  targetSeconds,
  showIcon = true,
  className = "",
}) => {
  const isOvertime = targetSeconds ? seconds > targetSeconds : false;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono tabular-nums text-sm font-semibold transition-colors duration-150 ${
        isOvertime ? "text-warning" : "text-text"
      } ${className}`}
    >
      {showIcon && <Clock className={`w-4 h-4 ${isOvertime ? "text-warning" : "text-text-muted"}`} />}
      <span>{formatTime(seconds)}</span>
    </div>
  );
};
