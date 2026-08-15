"use client";

import React from "react";


export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string; // CSS color string or var
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 140,
  height = 36,
  color = "var(--accent)",
  className = "",
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const padding = 4;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  const points = data
    .map((val, i) => {
      const x = padding + (i / (data.length - 1)) * usableWidth;
      const y = height - padding - ((val - min) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
