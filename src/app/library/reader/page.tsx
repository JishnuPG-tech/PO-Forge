"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card } from "@/components/ui";
import { Search, ZoomIn, Bot, ArrowLeft } from "lucide-react";

export default function DocumentReaderPage() {
  const [currentPage, setCurrentPage] = useState(3);

  return (
    <GlobalShell>
      {/* Reader Header */}
      <div className="flex items-center justify-between border-b border-border pb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Link href="/library" className="text-text-muted hover:text-text">
            ← Library
          </Link>
          <span className="text-text-muted">•</span>
          <span className="font-bold text-text">Quant Notes.pdf</span>
        </div>
        <span className="text-text-muted">RAG Indexed ✓</span>
      </div>

      {/* Two-Pane Layout (Left: Pages list 01..182 | Right: Document content) */}
      <div className="grid grid-cols-1 md:grid-cols-10 gap-4 h-[550px]">
        {/* Left Pane: Pages list */}
        <div className="md:col-span-2 bg-surface border border-border rounded-card p-3 overflow-y-auto space-y-1 font-mono text-xs">
          <span className="text-text-muted font-bold text-[11px] uppercase tracking-wider block border-b border-border pb-1">
            PAGES
          </span>
          {Array.from({ length: 20 }, (_, idx) => {
            const p = idx + 1;
            const isSelected = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-full text-left px-3 py-1.5 rounded-btn cursor-pointer ${
                  isSelected
                    ? "bg-accent-soft text-accent font-bold border border-accent/40"
                    : "text-text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                Page {p.toString().padStart(2, "0")}
              </button>
            );
          })}
        </div>

        {/* Right Pane: Rendered Document Page Content */}
        <div className="md:col-span-8 bg-surface border border-border rounded-card p-6 overflow-y-auto flex flex-col justify-between space-y-4">
          <div className="space-y-4 text-xs leading-relaxed text-text">
            <h2 className="text-base font-bold font-mono text-text border-b border-border pb-2">
              Chapter 01: Profit & Loss Fundamentals (Page {currentPage})
            </h2>

            <div className="space-y-3 font-mono bg-surface-2 p-4 rounded-btn border border-border">
              <p className="font-semibold text-text">Formula 1.1 — Profit & Loss Percentages:</p>
              <p>Profit % = [(Selling Price - Cost Price) / Cost Price] * 100</p>
              <p>Discount % = [(Marked Price - Selling Price) / Marked Price] * 100</p>
              <p className="text-text-muted pt-2 border-t border-border">
                Note: Discount is always applied on Marked Price (MP), never Cost Price (CP).
              </p>
            </div>
          </div>

          {/* Bottom Bar: Search, Zoom, Page Indicator, [ ASK AI ABOUT THIS PAGE ] */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs font-mono text-text-muted">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 hover:text-text cursor-pointer">
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              <button className="flex items-center gap-1 hover:text-text cursor-pointer">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Zoom</span>
              </button>
              <span>Page {currentPage} / 182</span>
            </div>

            <Link href="/coach">
              <Button variant="primary" size="sm">
                <span>Ask AI About This Page →</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}
