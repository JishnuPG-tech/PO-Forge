"use client";

import React from "react";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Card, Badge } from "@/components/ui";
import { Bot, RotateCcw, Award, Flame } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      icon: <Bot className="w-4 h-4 text-accent" />,
      title: "AI Coach Ready",
      text: "Hermes AI Coach is initialized and ready for interactive guidance and problem diagnostics.",
      time: "Just now",
    },
    {
      icon: <RotateCcw className="w-4 h-4 text-warning" />,
      title: "Daily Mission Ready",
      text: "A fresh personalized problem set is ready in your Practice queue.",
      time: "Today",
    },
  ];

  return (
    <GlobalShell>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="space-y-1 border-b border-border pb-4">
          <h1 className="text-xl font-bold text-text">Notifications</h1>
          <p className="text-xs text-text-muted">System insights, coach recommendations, and study reminders.</p>
        </div>

        {/* Flat List */}
        <div className="space-y-2.5">
          {notifications.map((n, i) => (
            <Card key={i} variant="default" className="p-4 flex items-start gap-3">
              <div className="p-2 bg-surface-2 rounded-btn border border-border flex-shrink-0">
                {n.icon}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">{n.title}</span>
                  <span className="text-[11px] font-mono text-text-muted">{n.time}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{n.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </GlobalShell>
  );
}
