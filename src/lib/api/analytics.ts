import { apiFetch } from "./client";
import { AnalyticsResponse } from "./types";

export const analyticsApi = {
  getPerformanceAnalytics: async (): Promise<AnalyticsResponse> => {
    return apiFetch<AnalyticsResponse>("/analytics/performance");
  },
};
