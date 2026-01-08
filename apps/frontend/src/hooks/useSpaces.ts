import { useState, useEffect } from "react";
import axios from "axios";
import { Space, RecentSpace } from "@/types";

export const useSpaces = (token: string | null) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [recentSpaces, setRecentSpaces] = useState<RecentSpace[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpaces = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/space/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setSpaces(response.data.data.spaces);
      }
    } catch (error) {
      console.error("Failed to fetch spaces:", error);
      setError("Failed to fetch spaces!");
    }
  };

  const fetchRecentSpaces = async () => {
    if (!token) return;

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/space/recent`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setRecentSpaces(response.data.data.recentSpaces);
      }
    } catch (error) {
      console.error("Failed to fetch recent spaces:", error);
      setError("Failed to fetch recent spaces!");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setError("Unauthorized: No token found!");
        setIsLoading(false);
        return;
      }

      try {
        await Promise.all([fetchSpaces(), fetchRecentSpaces()]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to fetch data!");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token]);

  return {
    spaces,
    recentSpaces,
    isLoading,
    error,
    refreshSpaces: fetchSpaces,
    refreshRecentSpaces: fetchRecentSpaces,
  };
};
