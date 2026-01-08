import { useState } from "react";
import axios from "axios";
import { getAuthToken } from "@/utils/auth";

export const useSpaceActions = (onSpaceCreated?: () => void) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createSpace = async (name: string, mapId: string): Promise<boolean> => {
    if (isCreating) return false;

    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/space`,
        { name, mapId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.status === 200 || response.status === 201) {
        setSuccessMessage("Space created successfully!");
        if (onSpaceCreated) {
          await onSpaceCreated();
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to create space:", error);
      setError("Failed to create space!");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const resetMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  return {
    createSpace,
    isCreating,
    error,
    successMessage,
    resetMessages,
  };
};
