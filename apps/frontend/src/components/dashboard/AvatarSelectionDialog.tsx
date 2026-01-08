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

  const toggleAvatar = (id: string) => {
    setSelectedAvatar(selectedAvatar === id ? null : id);
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar || !token) return;

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/metadata`,
        { avatarId: selectedAvatar },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 201) {
        onAvatarUpdate(response.data.data.imageUrl);
        setSelectedAvatar(null);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
      setError("Failed to update avatar!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="rounded-lg flex gap-2 py-2 px-4 bg-gray-100 font-semibold hover:bg-gray-200 transition-all">
          {username}
        </button>
      </DialogTrigger>
      <DialogContent className="p-7">
        <DialogTitle className="text-xl font-bold">Choose Your Avatar</DialogTitle>
        <p className="text-sm text-gray-600 mt-1">Select an avatar to represent you</p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className="flex flex-col items-center gap-2"
              onClick={() => toggleAvatar(avatar.id)}
            >
              <div className="relative p-1 bg-gray-100 rounded-2xl shadow-md cursor-pointer hover:shadow-2xl transition-all hover:bg-gray-200 hover:-translate-y-1">
                <div className="overflow-hidden w-10 h-10 rounded-full relative">
                  <div
                    className="absolute w-full h-full scale-[2]"
                    style={{
                      marginLeft: 8,
                      backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}${avatar.url})`,
                    }}
                  />
                </div>
                {selectedAvatar === avatar.id && (
                  <div className="absolute top-0 right-0 p-1 bg-green-500 rounded-full -mt-1 -mr-1 z-10">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">{avatar.name}</span>
            </div>
          ))}
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mt-4">
            {error}
          </div>
        )}
        <button
          disabled={selectedAvatar === null}
          onClick={handleSaveAvatar}
          className="w-full mt-6 bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Avatar
        </button>
      </DialogContent>
    </Dialog>
  );
};
