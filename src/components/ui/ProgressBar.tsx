import React from "react";

export interface ProgressBarProps {
  value: number; // 0 to 100
  variant?: "accent" | "success" | "warning" | "danger";
  height?: "sm" | "md" | "lg";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = "accent",
  height = "md",
  className = "",
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const fillStyles = {
    accent: "bg-accent",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div
      className={`w-full bg-surface-2 rounded-full overflow-hidden border border-border/40 ${heightStyles[height]} ${className}`}
    >
      <div
        className={`h-full ${fillStyles[variant]} transition-all duration-300 ease-out`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
};
