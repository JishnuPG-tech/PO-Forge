"use client";

import React from "react";
import Link from "next/link";
import { GlobalShell } from "@/components/shell/GlobalShell";
import { Button, Card, StatTile, StatRow } from "@/components/ui";

export default function ProfilePage() {
  return (
    <GlobalShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card variant="mission" className="p-6 space-y-3 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-soft text-accent text-2xl font-bold font-mono mx-auto flex items-center justify-center border border-accent/40">
            J
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Jishnu</h1>
            <p className="text-xs font-mono text-text-muted mt-0.5">
              Target exam: <strong className="text-text">IBPS RRB PO</strong> • Phase: <strong className="text-accent uppercase">COMPETITIVE</strong>
            </p>
          </div>
        </Card>

        {/* StatRow Reused Primitives */}
        <StatRow>
          <StatTile label="Questions Solved" value="4,812" />
          <StatTile label="Mocks Completed" value="14" />
          <StatTile label="Current Streak" value="12 days" />
          <StatTile label="Mastery" value="76%" />
        </StatRow>

        {/* Action Buttons (All Secondary/Ghost per §26 - NO ACCENT NEEDED!) */}
        <Card variant="default" className="p-5 space-y-3">
          <h3 className="text-xs font-bold font-mono uppercase text-text-muted border-b border-border pb-2">
            Account & Preferences
          </h3>

          <div className="space-y-2">
            <Button variant="secondary" size="md" fullWidth>
              Edit Profile
            </Button>
            <Link href="/settings">
              <Button variant="secondary" size="md" fullWidth>
                Exam Configuration
              </Button>
            </Link>
            <Button variant="ghost" size="md" fullWidth>
              Training Preferences
            </Button>
          </div>
        </Card>
      </div>
    </GlobalShell>
  );
}
