import { useState, useEffect } from "react";
import axios from "axios";
import { Map, Avatar } from "@/types";

export const useMapsAndAvatars = (token: string | null) => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchMaps = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/maps`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          setMaps(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch maps:", error);
        setError("Failed to fetch maps!");
      }
    };

    const fetchAvatars = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/avatars`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 201) {
          setAvatars(response.data.data.avatars);
        }
      } catch (error) {
        console.error("Failed to fetch avatars:", error);
        setError("Failed to fetch avatars!");
      }
    };

    Promise.all([fetchMaps(), fetchAvatars()]);
  }, [token]);

  return { maps, avatars, error };
};
