import { apiFetch } from "./client";
import { DailyMissionStateResponse, SubmitQuestionRequest, SubmitQuestionResponse } from "./types";

export const missionsApi = {
  startTodayMission: async (): Promise<DailyMissionStateResponse> => {
    return apiFetch<DailyMissionStateResponse>("/missions/start", {
      method: "POST",
    });
  },

  submitQuestionAttempt: async (
    req: SubmitQuestionRequest
  ): Promise<SubmitQuestionResponse> => {
    return apiFetch<SubmitQuestionResponse>("/missions/submit-question", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  updateMissionConfig: async (req: { subject_code: string; target_count: number }) => {
    return apiFetch<{ status: string; subject_code: string; new_target_count: number; message: string }>("/missions/update-config", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },
};

