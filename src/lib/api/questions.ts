import { apiFetch } from "./client";
import { QuestionResponse } from "./types";

export const questionsApi = {
  searchQuestions: async (params?: {
    subject_code?: string;
    topic_code?: string;
    difficulty?: string;
    limit?: number;
  }): Promise<QuestionResponse[]> => {
    const query = new URLSearchParams();
    if (params?.subject_code) query.append("subject_code", params.subject_code);
    if (params?.topic_code) query.append("topic_code", params.topic_code);
    if (params?.difficulty) query.append("difficulty", params.difficulty);
    if (params?.limit) query.append("limit", params.limit.toString());

    return apiFetch<QuestionResponse[]>(`/questions/search?${query.toString()}`);
  },

  approveQuestion: async (questionId: string): Promise<any> => {
    return apiFetch<any>(`/questions/${questionId}/approve`, {
      method: "POST",
    });
  },
};
