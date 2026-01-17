"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { LogOut, PlusCircle, UserPlus, Search, Grid3X3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
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

const Dashboard = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-200 flex flex-col"
      style={{
        background: "var(--auth-bg-light)",
      }}
    >
      {/* Dark Mode Gradient Overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-200 opacity-0 dark:opacity-100 z-0"
        style={{
          background: "var(--auth-bg-dark)",
        }}
      />

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: "var(--auth-bg-overlay)",
            backgroundSize: "40px 40px",
          }}
        />
        <span
          className="absolute text-[240px] opacity-50 dark:opacity-30 top-[-40px] left-[5%] blur-sm select-none"
          style={{ opacity: "var(--auth-cloud-opacity)" }}
        >
          ☁️
        </span>
        <span
          className="absolute text-[300px] opacity-60 dark:opacity-40 top-20 right-[10%] blur-sm select-none"
          style={{ opacity: "var(--auth-cloud-opacity)" }}
        >
          ☁️
        </span>
        <span
          className="absolute text-[180px] opacity-45 dark:opacity-25 bottom-10 left-[15%] blur-md select-none"
          style={{ opacity: "var(--auth-cloud-opacity)" }}
        >
          ☁️
        </span>
        <div className="absolute bg-green-500/20 dark:bg-green-500/10 rounded-[2rem] border-b-8 border-green-600/30 w-96 h-24 top-[15%] left-[5%] -rotate-2"></div>
        <div className="absolute bg-green-500/20 dark:bg-green-500/10 rounded-[2rem] border-b-8 border-green-600/30 w-64 h-32 bottom-[10%] right-[10%] rotate-3"></div>
        <div className="absolute top-[20%] right-[5%] w-24 h-24 backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-3xl flex items-center justify-center opacity-60">
          <span className="text-5xl select-none">🌳</span>
        </div>
        <div className="absolute bottom-[15%] left-[5%] w-28 h-28 backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-[2rem] flex items-center justify-center opacity-60">
          <span className="text-6xl select-none">🏠</span>
        </div>
        <div className="absolute bottom-[25%] right-[8%] w-24 h-24 backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 rounded-3xl flex items-center justify-center opacity-60">
          <span className="text-5xl select-none">🌳</span>
        </div>
      </div>

      {/* Header / Navbar */}
      <header className="px-6 md:px-10 py-5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <nav className="backdrop-blur-xl bg-white/50 dark:bg-black/30 border border-white/50 dark:border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <span className="material-symbols-outlined text-white text-xl">
                  eco
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-white hidden sm:block">
                Rishu's Town
              </span>
            </div>

            {/* Center Actions */}
            <div className="flex items-center gap-2">
              {/* Join Space Dialog */}
              <Dialog
                open={isJoinDialogOpen}
                onOpenChange={handleJoinDialogOpenChange}
              >
                <DialogTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/10 border border-white/50 dark:border-white/10 text-slate-700 dark:text-white text-sm font-medium hover:bg-white/70 dark:hover:bg-white/20 transition-all">
                    <UserPlus size={18} />
                    <span className="hidden sm:inline">Join</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-white/50 dark:border-white/10 rounded-2xl p-6">
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Join a Space
                  </DialogTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Enter the space ID to join
                  </p>
                  <div className="flex flex-col gap-3 mt-5">
                    <div className="relative">
                      <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={18}
                      />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 focus:border-teal-500 focus:ring-0 transition-all outline-none text-sm"
                        placeholder="Enter space ID"
                        value={joinSpaceId}
                        onChange={(e) => setJoinSpaceId(e.target.value)}
                        disabled={isJoining}
                      />
                    </div>
                    <button
                      disabled={joinSpaceId === "" || isJoining}
                      onClick={handleJoinSpace}
                      className="w-full font-semibold py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Avatar and Username */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-white/50 dark:bg-black/40 border border-white/50 dark:border-white/10 overflow-hidden relative">
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

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/50 dark:bg-white/10 border border-white/50 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/20 transition-all"
              >
                {mounted && (
                  <span className="material-symbols-outlined text-[20px]">
                    {theme === "dark" ? (
                      <span className="text-yellow-400">light_mode</span>
                    ) : (
                      <span className="text-slate-600">dark_mode</span>
                    )}
                  </span>
                )}
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-all text-red-600 dark:text-red-400"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Page Title */}
      <div className="px-6 md:px-10 pt-4 pb-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Grid3X3 className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Your Spaces
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Create and explore virtual environments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow px-6 md:px-10 pb-10 relative z-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
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
      </main>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-5 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>Jyotiswaroop Srivastava</span>
            <div className="flex items-center gap-2">
              <a
                href="https://twitter.com/rishuxd"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com/rishuxd"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/rishuxd"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
          <span>V1.0.4</span>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
