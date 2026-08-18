"use client";

import React from "react";

interface MathFormatterProps {
  content: string;
  className?: string;
}

/**
 * Strips OCR artifacts, broken HTML tags (like <sup>?</sup>),
 * and standardizes mathematical symbols and typography.
 */
export function sanitizeQuestionText(text: string): string {
  if (!text) return "";

  let cleaned = text
    // Strip HTML super/subscript tags
    .replace(/<sup[^>]*>(.*?)<\/sup>/gi, "$1")
    .replace(/<sub[^>]*>(.*?)<\/sub>/gi, "$1")
    .replace(/<[^>]+>/g, "")
    // Replace smart quotes and broken dashes
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—−]/g, "-")
    // Remove OCR metadata noise like "TTA : 66 Seconds"
    .replace(/TTA\s*:\s*\d+\s*(Seconds|Secs|s)\b/gi, "")
    // Clean question marks with duplicate quotes: '?' -> ?
    .replace(/'\?'/g, "?")
    .replace(/\s*\?\s*\?/g, "?")
    // Fix broken decimal equation splits like "28.314 - 3" ... "427 + 113.928" -> "28.314 - 31.427 + 113.928"
    .replace(/28\.314\s*-\s*3\s*\n\s*A\s*\n\s*427/gi, "28.314 - 31.427")
    .trim();

  return cleaned;
}

/**
 * Transforms raw LaTeX tokens and mathematical notations into clean,
 * beautifully readable typography with Unicode symbols and structured blocks.
 */
export function cleanMathText(text: string): string {
  if (!text) return "";

  const sanitized = sanitizeQuestionText(text);

  return sanitized
    // Clean LaTeX square root
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\sqrt\s*([0-9a-zA-Z]+)/g, "√$1")
    // Clean LaTeX fractions
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
    // Clean LaTeX operators and symbols
    .replace(/\\times/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\pm/g, "±")
    .replace(/\\approx/g, "≈")
    .replace(/\\le(q)?\b/g, "≤")
    .replace(/\\ge(q)?\b/g, "≥")
    .replace(/\\ne(q)?\b/g, "≠")
    .replace(/\\implies/g, " ⇒ ")
    .replace(/\\rightarrow/g, " → ")
    .replace(/\\leftarrow/g, " ← ")
    .replace(/\\leftrightarrow/g, " ↔ ")
    .replace(/\\in\b/g, " ∈ ")
    .replace(/\\notin\b/g, " ∉ ")
    .replace(/\\subset\b/g, " ⊂ ")
    .replace(/\\cup\b/g, " ∪ ")
    .replace(/\\cap\b/g, " ∩ ")
    .replace(/\\pi\b/g, "π")
    .replace(/\\theta\b/g, "θ")
    .replace(/\\alpha\b/g, "α")
    .replace(/\\beta\b/g, "β")
    .replace(/\\infty\b/g, "∞")
    .replace(/\\%/g, "%")
    .replace(/\\text\{([^}]+)\}/g, "$1")
    // Superscripts
    .replace(/\^2\b/g, "²")
    .replace(/\^3\b/g, "³")
    .replace(/\^([0-9]+)/g, "^$1")
    // Strip standalone $ or $$ LaTeX delimiters
    .replace(/\$\$/g, "")
    .replace(/\$/g, "");
}

/**
 * Strips duplicate option prefixes like "A) ", "B. ", "(C) ", "D - "
 * AND trailing OCR letter artifacts like "81.711 B" or "71.711 D".
 */
export function cleanOptionText(text: string): string {
  if (!text) return "";
  let cleaned = cleanMathText(text);

  // Strip leading option letters: "A) ", "(A) ", "A - "
  cleaned = cleaned.replace(/^([A-Ea-e][\)\.\:\-]\s*|\([A-Ea-e]\)\s*)/, "").trim();

  // Strip trailing duplicate option labels: "81.711 B" -> "81.711", "71.711 D" -> "71.711"
  cleaned = cleaned.replace(/\s+[A-Ea-e]$/, "").trim();

  return cleaned;
}

export const MathFormatter: React.FC<MathFormatterProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Split content by lines to detect equations, steps, statements, conclusions
  const lines = content.split("\n");

  return (
    <div className={`space-y-2 text-inherit ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Display Equation Block ($$...$$ or centered equations with operators)
        if (
          line.includes("$$") ||
          (trimmed.includes(" = ") &&
            (trimmed.includes("√") ||
              trimmed.includes("×") ||
              trimmed.includes("²") ||
              trimmed.includes("%") ||
              trimmed.includes("+") ||
              trimmed.includes("-") ||
              trimmed.includes("?")) &&
            !trimmed.startsWith("Step") &&
            !trimmed.startsWith("•") &&
            !trimmed.startsWith("-"))
        ) {
          const cleanedEq = cleanMathText(trimmed);
          return (
            <div
              key={idx}
              className="my-3 px-4 py-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-[#FFFFFF] font-mono text-sm sm:text-base font-bold tracking-wide flex items-center justify-center text-center shadow-inner overflow-x-auto"
            >
              {cleanedEq}
            </div>
          );
        }

        // Step-by-Step line styling: "Step 1:", "Step 2:"
        if (/^Step\s*\d+\s*:/i.test(trimmed)) {
          const stepMatch = trimmed.match(/^(Step\s*\d+)\s*:\s*(.*)$/i);
          if (stepMatch) {
            const stepNum = stepMatch[1];
            const stepBody = cleanMathText(stepMatch[2]);
            return (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed py-1">
                <span className="px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#333333] text-[#FF7A1A] font-mono font-bold text-[11px] flex-shrink-0">
                  {stepNum}
                </span>
                <span className="text-[#EDEDED] font-normal">{stepBody}</span>
              </div>
            );
          }
        }

        // Statements or Conclusions headers
        if (
          trimmed.startsWith("**Statements:**") ||
          trimmed.startsWith("Statements:") ||
          trimmed.startsWith("**Conclusions:**") ||
          trimmed.startsWith("Conclusions:") ||
          trimmed.startsWith("**Equation I:**") ||
          trimmed.startsWith("Equation I:") ||
          trimmed.startsWith("**Equation II:**") ||
          trimmed.startsWith("Equation II:")
        ) {
          const headerClean = cleanMathText(trimmed.replace(/\*\*/g, ""));
          return (
            <div
              key={idx}
              className="pt-2 font-bold text-xs sm:text-sm text-[#FF7A1A] tracking-wide uppercase flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A1A]" />
              {headerClean}
            </div>
          );
        }

        // Bullet point items (- or • or I. or II.)
        if (/^(\-|\•|I\.|II\.|III\.|IV\.|V\.)\s+/i.test(trimmed)) {
          const cleanedBullet = cleanMathText(trimmed.replace(/^(\-|\•)\s+/, ""));
          return (
            <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm leading-relaxed pl-2 text-[#D4D4D4]">
              <span className="text-[#FF7A1A] font-bold mt-0.5">•</span>
              <span>{cleanedBullet}</span>
            </div>
          );
        }

        // Regular paragraph with cleaned math tokens
        const cleanedLine = cleanMathText(trimmed);
        return (
          <p key={idx} className="text-xs sm:text-sm leading-relaxed text-[#EDEDED] font-normal">
            {cleanedLine}
          </p>
        );
      })}
    </div>
  );
};
