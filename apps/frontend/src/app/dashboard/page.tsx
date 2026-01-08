"use client";

import { useState } from "react";
import Image from "next/image";
import { LogOut, PlusCircle, Stars, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import SpacesLayout from "@/components/spaceCard";
import { useAuth } from "@/hooks/useAuth";
import { useSpaces } from "@/hooks/useSpaces";
import { useMapsAndAvatars } from "@/hooks/useMapsAndAvatars";
import { useSpaceActions } from "@/hooks/useSpaceActions";
import { CreateSpaceDialog } from "@/components/dashboard/CreateSpaceDialog";
import { AvatarSelectionDialog } from "@/components/dashboard/AvatarSelectionDialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";

const Dashboard = () => {
  const router = useRouter();
  const { token, username, avatarUrl, logout, updateAvatar } = useAuth();
  const {
    spaces,
    recentSpaces,
    isLoading,
    refreshSpaces,
    refreshRecentSpaces,
  } = useSpaces(token);
  const { maps, avatars } = useMapsAndAvatars(token);
  const {
    createSpace,
    isCreating,
    error: spaceError,
    successMessage,
    resetMessages,
  } = useSpaceActions(refreshSpaces);

  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinSpaceId, setJoinSpaceId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinSpace = async () => {
    if (isJoining || !joinSpaceId) return;

    setIsJoining(true);
    try {
      router.push(`/space/${joinSpaceId}`);
      setIsJoinDialogOpen(false);
    } catch (error) {
      console.error("Failed to join space:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinDialogOpenChange = (open: boolean) => {
    setIsJoinDialogOpen(open);
    if (!open) {
      setJoinSpaceId("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between bg-gray-800 px-8 py-4 shadow-2xl">
        <div className="flex items-center gap-6">
          <Image
            src="/leaf.png"
            alt="Logo"
            width={36}
            height={36}
            className="cursor-pointer"
            style={{ imageRendering: "auto" }}
          />
          <div className="rounded-lg flex gap-2 py-2 px-4 bg-gray-700 font-semibold text-white transition-all">
            <Stars size={20} className="mt-[1px]" />
            Spaces
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {/* Avatar Display */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full relative">
              <div
                className="absolute w-full h-full scale-[2]"
                style={{
                  marginLeft: 5,
                  backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}${avatarUrl})`,
                }}
              />
            </div>

            <AvatarSelectionDialog
              avatars={avatars}
              token={token}
              username={username}
              onAvatarUpdate={updateAvatar}
            />
          </div>

          {/* Join Space Dialog */}
          <Dialog
            open={isJoinDialogOpen}
            onOpenChange={handleJoinDialogOpenChange}
          >
            <DialogTrigger asChild>
              <button className="rounded-lg flex gap-2 py-2 px-4 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all">
                <UserPlus size={20} className="mt-[1px]" />
                Join
              </button>
            </DialogTrigger>
            <DialogContent className="p-7">
              <DialogTitle className="text-xl font-bold">
                Join a Space
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Enter the space ID to join
              </p>
              <div className="flex flex-col gap-4 mt-6">
                <input
                  type="text"
                  className="rounded-xl p-3 text-gray-900 border-gray-300 border-2 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all"
                  placeholder="Enter space ID"
                  value={joinSpaceId}
                  onChange={(e) => setJoinSpaceId(e.target.value)}
                  disabled={isJoining}
                />
                <button
                  disabled={joinSpaceId === "" || isJoining}
                  onClick={handleJoinSpace}
                  className="bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoining ? "Joining..." : "Join Space"}
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create Space Dialog */}
          <CreateSpaceDialog
            maps={maps}
            onCreateSpace={createSpace}
            isCreating={isCreating}
            error={spaceError}
            successMessage={successMessage}
            resetMessages={resetMessages}
          />

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg py-2 px-4 bg-red-100 text-red-600 hover:bg-red-200 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Spaces Layout */}
      <SpacesLayout
        spaces={spaces}
        recentSpaces={recentSpaces}
        token={token}
        router={router}
        isLoading={isLoading}
        onSpaceDeleted={refreshSpaces}
        onSpaceLeft={refreshRecentSpaces}
      />
    </div>
  );
};

export default Dashboard;
