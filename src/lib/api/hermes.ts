import { apiFetch } from "./client";
import { HermesChatRequest, HermesChatResponse } from "./types";

export const hermesApi = {
  chat: async (req: HermesChatRequest): Promise<HermesChatResponse> => {
    return apiFetch<HermesChatResponse>("/hermes/chat", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },
};
