"use client";

export interface GoogleAccountInfo {
  googleId: string;
  name: string;
  email: string;
  picture: string;
  verified: boolean;
  connectedAt: string;
}

export const parseJwtPayload = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn("Failed to parse Google JWT payload:", e);
    return null;
  }
};

export const getSavedGoogleAccount = (): GoogleAccountInfo | null => {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("poforge_google_account");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const saveGoogleAccountFromCredential = (credential: string): GoogleAccountInfo | null => {
  const payload = parseJwtPayload(credential);
  if (!payload) return null;

  const googleUser: GoogleAccountInfo = {
    googleId: payload.sub || "google-109849204810294819",
    name: payload.name || payload.given_name || "Google User",
    email: payload.email || "user@gmail.com",
    picture: payload.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    verified: payload.email_verified ?? true,
    connectedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };

  localStorage.setItem("poforge_google_account", JSON.stringify(googleUser));
  localStorage.setItem("poforge_user_name", googleUser.name);
  localStorage.setItem("poforge_user_email", googleUser.email);
  localStorage.setItem("poforge_google_id_token", credential);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("poforge_google_auth_changed", { detail: googleUser }));
    window.dispatchEvent(new CustomEvent("poforge_profile_updated", { detail: googleUser }));
  }

  return googleUser;
};

export const loginWithGoogleAccount = (customData?: Partial<GoogleAccountInfo>): GoogleAccountInfo => {
  const defaultGoogleUser: GoogleAccountInfo = {
    googleId: customData?.googleId || "google-109849204810294819",
    name: customData?.name || "Jishnu PG",
    email: customData?.email || "jishnu.pg@gmail.com",
    picture: customData?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    verified: true,
    connectedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  };

  localStorage.setItem("poforge_google_account", JSON.stringify(defaultGoogleUser));
  localStorage.setItem("poforge_user_name", defaultGoogleUser.name);
  localStorage.setItem("poforge_user_email", defaultGoogleUser.email);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("poforge_google_auth_changed", { detail: defaultGoogleUser }));
    window.dispatchEvent(new CustomEvent("poforge_profile_updated", { detail: defaultGoogleUser }));
  }

  return defaultGoogleUser;
};

export const logoutGoogleAccount = () => {
  localStorage.removeItem("poforge_google_account");
  localStorage.removeItem("poforge_google_id_token");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("poforge_google_auth_changed", { detail: null }));
  }
};
