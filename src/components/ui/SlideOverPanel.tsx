import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface SlideOverPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  widthClass?: string;
}

export const SlideOverPanel: React.FC<SlideOverPanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  widthClass = "max-w-lg",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-150"
        onClick={onClose}
      />

      {/* Slide Panel */}
      <div
        className={`relative w-full ${widthClass} bg-surface border-l border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200 ease-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-text">{title}</h3>
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text hover:bg-surface-2 rounded-btn transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};
