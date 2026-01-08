import { useState, useEffect } from "react";
import { getAuthToken, deleteCookie } from "@/utils/auth";

export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setToken(token);
    }

    // Load user data from localStorage on client side only
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username") || "");
      setAvatarUrl(localStorage.getItem("avatarUrl") || "");
    }
  }, []);

  const logout = () => {
    // Clear localStorage (username, avatarUrl)
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/login";
    }

    // Clear the auth cookie
    deleteCookie("token");
  };

  const updateAvatar = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
    if (typeof window !== "undefined") {
      localStorage.setItem("avatarUrl", newAvatarUrl);
    }
  };

  return {
    token,
    username,
    avatarUrl,
    logout,
    updateAvatar,
  };
};
