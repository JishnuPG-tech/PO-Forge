import { apiFetch } from "./client";
import { DocumentResponse } from "./types";

export const documentsApi = {
  listDocuments: async (): Promise<DocumentResponse[]> => {
    return apiFetch<DocumentResponse[]>("/documents/");
  },

  uploadDocument: async (formData: FormData): Promise<any> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("poforge_jwt_token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("http://localhost:8000/api/v1/documents/upload", {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }
    return res.json();
  },
};
