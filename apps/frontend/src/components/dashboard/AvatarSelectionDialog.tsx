import { useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar } from "@/types";
import axios from "axios";

interface AvatarSelectionDialogProps {
  avatars: Avatar[];
  token: string | null;
  username: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

export const AvatarSelectionDialog: React.FC<AvatarSelectionDialogProps> = ({
  avatars,
  token,
  username,
  onAvatarUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleAvatar = (id: string) => {
    setSelectedAvatar(selectedAvatar === id ? null : id);
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar || !token) return;

    setIsSaving(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/user/metadata`,
        { avatarId: selectedAvatar },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.status === 201) {
        onAvatarUpdate(response.data.data.imageUrl);
        setSelectedAvatar(null);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
      setError("Failed to update avatar!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="px-3 py-2 rounded-xl bg-white/50 dark:bg-white/10 border border-white/50 dark:border-white/10 text-slate-700 dark:text-white text-sm font-medium hover:bg-white/70 dark:hover:bg-white/20 transition-all hidden sm:block">
          {username}
        </button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-white/50 dark:border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <span className="material-symbols-outlined text-white text-xl">
              face
            </span>
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Choose Avatar
            </DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select your character
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="flex flex-col items-center gap-2"
              onClick={() => toggleAvatar(avatar.id)}
            >
              <div
                className={`relative p-2.5 rounded-xl cursor-pointer transition-all ${
                  selectedAvatar === avatar.id
                    ? "bg-teal-100 dark:bg-teal-900/40 border-2 border-teal-500 shadow-lg shadow-teal-500/20"
                    : "bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20"
                }`}
              >
                <div className="overflow-hidden w-12 h-12 rounded-full relative">
                  <div
                    className="absolute w-full h-full scale-[2]"
                    style={{
                      marginLeft: 8,
                      backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}${avatar.url})`,
                    }}
                  />
                </div>
                {selectedAvatar === avatar.id && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {avatar.name}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs mt-4">
            {error}
          </div>
        )}

        <button
          disabled={selectedAvatar === null || isSaving}
          onClick={handleSaveAvatar}
          className="w-full mt-5 font-semibold py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isSaving ? "Saving..." : "Save Avatar"}
        </button>
      </DialogContent>
    </Dialog>
  );
};
