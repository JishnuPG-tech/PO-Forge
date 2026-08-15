"use client";

import React from "react";


export interface StatTileProps {
  label: string;
  value: string | number;
  trend?: {
    direction: "up" | "down" | "flat";
    text: string;
  };
  subtitle?: string;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  trend,
  subtitle,
  className = "",
}) => {
  return (
    <div className={`flex flex-col justify-between p-4 space-y-1 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold font-mono tabular-nums text-text">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.direction === "up"
                ? "text-success"
                : trend.direction === "down"
                ? "text-danger"
                : "text-text-muted"
            }`}
          >
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}{" "}
            {trend.text}
          </span>
        )}
      </div>
      {subtitle && (
        <span className="text-xs text-text-muted truncate">{subtitle}</span>
      )}
    </div>
  );
};

export interface StatRowProps {
  children: React.ReactNode;
  className?: string;
}

export const StatRow: React.FC<StatRowProps> = ({ children, className = "" }) => {
  const childrenArray = React.Children.toArray(children);
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 bg-surface border border-border rounded-2xl divide-border overflow-hidden ${className}`}
    >
      {childrenArray.map((child, idx) => (
        <div
          key={idx}
          className={`${
            idx % 2 === 1 ? "border-l border-border md:border-l-0" : ""
          } ${idx >= 2 ? "border-t border-border md:border-t-0" : ""} ${
            idx > 0 ? "md:border-l md:border-border" : ""
          }`}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

