import { apiFetch } from "./client";
import { LoginRequest, LoginResponse, UserProfileResponse } from "./types";

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (typeof window !== "undefined") {
      localStorage.setItem("poforge_jwt_token", res.access_token);
      localStorage.setItem("poforge_user_id", res.user_id);
    }
    return res;
  },

  getCurrentUser: async (): Promise<UserProfileResponse> => {
    return apiFetch<UserProfileResponse>("/auth/me");
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("poforge_jwt_token");
      localStorage.removeItem("poforge_user_id");
    }
  },
};
