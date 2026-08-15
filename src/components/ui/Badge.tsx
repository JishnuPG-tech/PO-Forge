import React from "react";
import { Lock, PieChart, Check, RotateCw, CheckCheck, AlertCircle } from "lucide-react";

export type TopicState = "LOCKED" | "LEARNING" | "AVAILABLE" | "NEEDS_REVISION" | "MASTERED";

export interface BadgeProps {
  label?: string;
  topicState?: TopicState;
  variant?: "neutral" | "accent" | "success" | "danger" | "warning";
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  topicState,
  variant = "neutral",
  icon,
  className = "",
}) => {
  // If topicState is provided, derive icon, label, and colors automatically per wireframe spec
  if (topicState) {
    const topicConfigs = {
      LOCKED: {
        icon: <Lock className="w-3 h-3 text-text-muted" />,
        text: "Locked",
        style: "bg-surface-2 text-text-muted border-border",
      },
      LEARNING: {
        icon: <PieChart className="w-3 h-3 text-warning" />,
        text: "Learning",
        style: "bg-warning-soft text-warning border-warning/30",
      },
      AVAILABLE: {
        icon: <Check className="w-3 h-3 text-accent" />,
        text: "Available",
        style: "bg-accent-soft text-accent border-accent/30",
      },
      NEEDS_REVISION: {
        icon: <RotateCw className="w-3 h-3 text-warning" />,
        text: "Needs Revision",
        style: "bg-warning-soft text-warning border-warning/30",
      },
      MASTERED: {
        icon: <CheckCheck className="w-3 h-3 text-success" />,
        text: "Mastered",
        style: "bg-success-soft text-success border-success/30",
      },
    };

    const config = topicConfigs[topicState];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-badge border text-xs font-medium leading-none ${config.style} ${className}`}
      >
        {config.icon}
        <span>{label || config.text}</span>
      </span>
    );
  }

  const variantStyles = {
    neutral: "bg-surface-2 text-text-muted border-border",
    accent: "bg-accent-soft text-accent border-accent/30",
    success: "bg-success-soft text-success border-success/30",
    danger: "bg-danger-soft text-danger border-danger/30",
    warning: "bg-warning-soft text-warning border-warning/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-badge border text-xs font-medium leading-none ${variantStyles[variant]} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
