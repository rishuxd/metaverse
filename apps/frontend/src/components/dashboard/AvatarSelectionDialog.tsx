import { useState } from "react";
import { Check, User } from "lucide-react";
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
        <button className="flex items-center gap-2 px-4 py-3 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 font-semibold text-slate-700 dark:text-white hover:bg-white/60 dark:hover:bg-black/60 hover:scale-[1.02] transition-all">
          <User size={18} />
          {username}
        </button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-2 border-white/50 dark:border-white/10 rounded-[2rem] p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <span className="material-symbols-outlined text-white text-2xl">
              face
            </span>
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Choose Your Avatar
            </DialogTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select an avatar to represent you
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="flex flex-col items-center gap-3"
              onClick={() => toggleAvatar(avatar.id)}
            >
              <div
                className={`relative p-3 backdrop-blur-md rounded-[1.5rem] cursor-pointer transition-all hover:-translate-y-1 ${
                  selectedAvatar === avatar.id
                    ? "bg-teal-100 dark:bg-teal-900/40 border-2 border-teal-500 shadow-lg shadow-teal-500/20"
                    : "bg-white/50 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 hover:shadow-lg"
                }`}
              >
                <div className="overflow-hidden w-14 h-14 rounded-full relative">
                  <div
                    className="absolute w-full h-full scale-[2]"
                    style={{
                      marginLeft: 10,
                      backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}${avatar.url})`,
                    }}
                  />
                </div>
                {selectedAvatar === avatar.id && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {avatar.name}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mt-4">
            {error}
          </div>
        )}

        <button
          disabled={selectedAvatar === null || isSaving}
          onClick={handleSaveAvatar}
          className="w-full mt-6 font-bold py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-500/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="animate-spin">⏳</span>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Save Avatar</span>
              <span className="material-symbols-outlined">check</span>
            </>
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
};
