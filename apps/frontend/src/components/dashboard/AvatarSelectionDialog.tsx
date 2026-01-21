import { useState } from "react";
import { Check, User, Sparkles } from "lucide-react";
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedAvatar(null);
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-3 rounded-2xl backdrop-blur-md bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 font-semibold text-slate-700 dark:text-white hover:bg-white/60 dark:hover:bg-black/60 hover:scale-[1.02] transition-all">
          <User size={18} />
          {username}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200/60 dark:border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-400/20 dark:bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-md shadow-pink-500/20 rotate-3">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Choose Your Avatar
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select an avatar to represent you in spaces
              </p>
            </div>
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-3 gap-4">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                className="flex flex-col items-center gap-2 group"
                onClick={() => toggleAvatar(avatar.id)}
              >
                <div
                  className={`relative cursor-pointer transition-all duration-200 ${
                    selectedAvatar === avatar.id
                      ? "scale-110"
                      : "hover:scale-105"
                  }`}
                >
                  <div
                    className={`overflow-hidden w-14 h-14 rounded-full relative bg-slate-100 dark:bg-slate-800 transition-all duration-200 ${
                      selectedAvatar === avatar.id
                        ? "ring-3 ring-teal-500 shadow-lg shadow-teal-500/30"
                        : "ring-2 ring-white/60 dark:ring-white/20 hover:ring-teal-300 dark:hover:ring-teal-500/40 shadow-md hover:shadow-lg"
                    }`}
                  >
                    <div
                      className="absolute w-full h-full scale-[2]"
                      style={{
                        marginLeft: 23,
                        marginTop: 17,
                        backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}${avatar.url})`,
                      }}
                    />
                  </div>
                  {selectedAvatar === avatar.id && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-md shadow-teal-500/30 border-2 border-white dark:border-slate-900">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span
                  className={`text-sm font-medium transition-colors ${
                    selectedAvatar === avatar.id
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                  }`}
                >
                  {avatar.name}
                </span>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span className="text-lg">!</span>
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            disabled={selectedAvatar === null || isSaving}
            onClick={handleSaveAvatar}
            className="w-full mt-6 font-bold py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg uppercase tracking-wide text-sm flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={18} strokeWidth={3} />
                <span>Save Avatar</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
