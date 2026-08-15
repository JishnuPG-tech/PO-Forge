import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface2" | "mission" | "outline";
  children: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", children, className = "", ...props }, ref) => {
    const baseStyles = "rounded-card border transition-all duration-150 ease-out";

    const variantStyles = {
      default: "bg-surface border-border",
      surface2: "bg-surface-2 border-border",
      mission: "bg-surface border-accent/40 shadow-subtle",
      outline: "bg-transparent border-border",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
