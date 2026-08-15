import React, { useState, useEffect } from "react";
import { Search, ArrowRight, BookOpen, HelpCircle, Bot, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const navCommands = [
    { label: "Practice · Quantitative Aptitude", path: "/practice?subject=QUANT", type: "JUMP" },
    { label: "Analysis · Weakness Center", path: "/analysis", type: "JUMP" },
    { label: "Mock Hub · IBPS RRB PO", path: "/mock", type: "JUMP" },
    { label: "Revision Center · Spaced Repetition", path: "/revision", type: "JUMP" },
    { label: "Mistake Book · Concept Errors", path: "/mistakes", type: "JUMP" },
    { label: "AI Coach · Slide-over", path: "/coach", type: "ACTION" },
  ];

  const filteredCommands = navCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-surface border border-border rounded-card shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-3">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions, topics, notes, or jump to page... (⌘K)"
            className="w-full bg-transparent text-sm text-text placeholder-text-muted focus:outline-none"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono text-text-muted bg-surface-2 border border-border rounded-btn">
            ESC
          </kbd>
        </div>

        {/* Command Groups */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Navigation & Actions
          </div>
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-xs text-text-muted text-center">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, i) => (
              <button
                key={i}
                onClick={() => handleNavigate(cmd.path)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-text hover:bg-surface-2 rounded-btn transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent" />
                  <span>{cmd.label}</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted uppercase">
                  {cmd.type}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-surface-2 flex items-center justify-between text-[11px] text-text-muted font-mono">
          <span>↑↓ to navigate</span>
          <span>ENTER to select</span>
        </div>
      </div>
    </div>
  );
};
