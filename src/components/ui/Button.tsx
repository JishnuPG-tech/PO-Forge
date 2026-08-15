import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      children,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-btn transition-colors duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-5 py-2.5 text-base gap-2.5",
    };

    const variantStyles = {
      primary: "bg-accent text-white hover:bg-accent-hover active:scale-[0.99]",
      secondary: "bg-surface-2 text-text border border-border hover:bg-border/60 hover:text-text",
      ghost: "bg-transparent text-text-muted hover:text-text hover:bg-surface-2",
      danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
