"use client";

import React from "react";


export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", ...props }) => {
  return (
    <div
      className={`bg-surface-2 animate-pulse rounded-card ${className}`}
      {...props}
    />
  );
};
