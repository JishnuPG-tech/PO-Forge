"use client";

export interface UserStudyData {
  streak: number;
  masteryPercent: number;
  questionsSolved: number;
  mocksCompleted: number;
  targetExam: string;
  missionStatus: "not_started" | "in_progress" | "complete";
  missionProgress: number; // e.g. 22 / 90
  missionScore: number;    // e.g. 82
  lastStudiedDate: string;
}

const STORAGE_KEY = "poforge_user_data_v1";

const DEFAULT_DATA: UserStudyData = {
  streak: 12,
  masteryPercent: 76,
  questionsSolved: 4812,
  mocksCompleted: 14,
  targetExam: "IBPS RRB PO",
  missionStatus: "in_progress",
  missionProgress: 22,
  missionScore: 82,
  lastStudiedDate: new Date().toISOString().split("T")[0],
};

export const getStoredStudyData = (): UserStudyData => {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load study data", e);
    return DEFAULT_DATA;
  }
};

export const saveStudyData = (updates: Partial<UserStudyData>): UserStudyData => {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const current = getStoredStudyData();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save study data", e);
    return DEFAULT_DATA;
  }
};
