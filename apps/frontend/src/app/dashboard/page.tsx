"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Check, LogOut, PlusCircle, Stars, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import SpacesLayout from "@/components/spaceCard";
import { Avatar, Map, RecentSpace, Space } from "@/types";
import { getAuthToken, deleteCookie } from "@/utils/auth";

const Dashboard = () => {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [maps, setMaps] = useState<Map[]>([]);
  const [recentSpaces, setRecentSpaces] = useState<RecentSpace[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);

  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [spaceName, setSpaceName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingSpace, setIsCreatingSpace] = useState<boolean>(false);
  const [isCreateSpaceDialogOpen, setIsCreateSpaceDialogOpen] = useState<boolean>(false);
  const [isJoinSpaceDialogOpen, setIsJoinSpaceDialogOpen] = useState<boolean>(false);
  const [joinSpaceId, setJoinSpaceId] = useState<string>("");
  const [isJoiningSpace, setIsJoiningSpace] = useState<boolean>(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const token = getAuthToken();
    if (!token) return;
    setToken(token);

    const fetchSpaces = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/space/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200 && isMounted) {
          setSpaces(response.data.data.spaces);
        }
      } catch (error) {
        console.error("Failed to fetch spaces:", error);
        if (isMounted) {
          setError("Failed to fetch spaces!");
        }
      }
    };

    const fetchRecentSpaces = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/space/recent`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200 && isMounted) {
          setRecentSpaces(response.data.data.recentSpaces);
        }
      } catch (error) {
        console.error("Failed to fetch recent spaces:", error);
        if (isMounted) {
          setError("Failed to fetch recent spaces!");
        }
      }
    };

    const fetchMaps = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/maps`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 && isMounted) {
          setMaps(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch maps:", error);
        if (isMounted) {
          setError("Failed to fetch maps!");
        }
      }
    };

    const fetchAvatars = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/avatars`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201 && isMounted) {
          setAvatars(response.data.data.avatars);
        }
      } catch (error) {
        console.error("Failed to fetch avatars:", error);
        if (isMounted) {
          setError("Failed to fetch avatars!");
        }
      }
    };

    const fetchData = async () => {
      if (!token) {
        setError("Unauthorized: No token found!");
        setIsLoading(false);
        return;
      }

      try {
        await Promise.all([
          fetchSpaces(),
          fetchMaps(),
          fetchRecentSpaces(),
          fetchAvatars(),
        ]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to fetch data!");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Check if user needs to select an avatar on first login
  useEffect(() => {
    const avatarUrl = localStorage.getItem("avatarUrl");
    if (!avatarUrl || avatarUrl === "null") {
      setIsAvatarDialogOpen(true);
    }
  }, []);

  const refreshSpaces = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/space/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setSpaces(response.data.data.spaces);
        console.log("Spaces refreshed 1");
      }
    } catch (error) {
      console.error("Failed to refresh spaces:", error);
    }
  };

  const refreshRecentSpaces = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/space/recent`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setRecentSpaces(response.data.data.recentSpaces);
      }
    } catch (error) {
      console.error("Failed to refresh recent spaces:", error);
    }
  };

  const handleCreateSpace = async () => {
    if (isCreatingSpace) return;

    setIsCreatingSpace(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = getAuthToken();

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/space`,
        {
          name: spaceName,
          mapId: selectedMap,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        // Show success message
        setSuccessMessage("Space created successfully!");

        // Refresh the spaces list immediately
        await refreshSpaces();

        // Wait 1.5 seconds to show success message, then close
        setTimeout(() => {
          setIsCreateSpaceDialogOpen(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to create space:", error);
      setError("Failed to create space!");
    } finally {
      setIsCreatingSpace(false);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateSpaceDialogOpen(open);

    // Reset form when dialog closes
    if (!open) {
      setSpaceName("");
      setSelectedMap(null);
      setSuccessMessage(null);
      setError(null);
    }
  };

  const handleJoinDialogOpenChange = (open: boolean) => {
    setIsJoinSpaceDialogOpen(open);

    // Reset form when dialog closes
    if (!open) {
      setJoinSpaceId("");
      setSuccessMessage(null);
      setError(null);
    }
  };

  const handleJoinSpace = async () => {
    if (isJoiningSpace) return;

    setIsJoiningSpace(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = getAuthToken();

      // Navigate to the space page (joining happens automatically when entering)
      router.push(`/space/${joinSpaceId}`);

      setIsJoinSpaceDialogOpen(false);
    } catch (error) {
      console.error("Failed to join space:", error);
      setError("Failed to join space!");
    } finally {
      setIsJoiningSpace(false);
    }
  };

  const handleLogout = () => {
    // Clear localStorage (username, avatarUrl)
    localStorage.clear();

    // Clear the auth cookie
    deleteCookie("token");

    // Redirect to login
    window.location.href = "/login";
  };

  const toggleAvatar = (id: string) => {
    if (selectedAvatar === id) {
      setSelectedAvatar(null);
    } else {
      setSelectedAvatar(id);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/metadata`,
        {
          avatarId: selectedAvatar,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        setSelectedAvatar(null);
        localStorage.setItem("avatarUrl", response.data.data.imageUrl);
        setIsAvatarDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update avatar:", error);
      setError("Failed to update avatar!");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <nav className="flex items-center justify-between bg-second px-8 py-4 shadow-2xl">
        <div className="flex items-center gap-6">
          <Image
            src="/leaf.png"
            alt="Logo"
            width={36}
            height={36}
            className="cursor-pointer"
            style={{
              imageRendering: "auto",
            }}
          />
          <div className="rounded-lg flex gap-2 py-2 px-4 bg-fourth font-semibold  transition-all">
            <Stars size={20} className="mt-[1px]" />
            Spaces
          </div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full"
              style={{
                position: "relative",
              }}
            >
              <div
                style={{
                  marginLeft: 5,
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${`${process.env.NEXT_PUBLIC_BASE_URL}${localStorage.getItem("avatarUrl")}`})`,
                  scale: 2,
                }}
              />
            </div>

            <Dialog open={isAvatarDialogOpen} onOpenChange={(open) => {
              // Only allow closing if user has an avatar
              const avatarUrl = localStorage.getItem("avatarUrl");
              if (avatarUrl && avatarUrl !== "null") {
                setIsAvatarDialogOpen(open);
              }
            }}>
              <DialogTrigger asChild>
                <button className="rounded-lg flex gap-2 py-2 px-4 bg-fourth font-semibold hover:bg-fifth transition-all">
                  {localStorage.getItem("username")}
                </button>
              </DialogTrigger>
              <DialogContent className="p-7" onInteractOutside={(e) => {
                // Prevent closing on outside click if no avatar selected
                const avatarUrl = localStorage.getItem("avatarUrl");
                if (!avatarUrl || avatarUrl === "null") {
                  e.preventDefault();
                }
              }} onEscapeKeyDown={(e) => {
                // Prevent closing on Escape key if no avatar selected
                const avatarUrl = localStorage.getItem("avatarUrl");
                if (!avatarUrl || avatarUrl === "null") {
                  e.preventDefault();
                }
              }}>
                <DialogTitle className="text-xl font-bold">Choose Your Avatar</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">Select an avatar to represent you</p>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="flex flex-col items-center gap-2"
                      onClick={() => toggleAvatar(avatar.id)}
                    >
                      <div className="relative p-1 bg-fourth rounded-2xl shadow-md cursor-pointer hover:shadow-2xl transition-all hover:bg-fifth hover:-translate-y-1">
                        <div
                          className="overflow-hidden w-10 h-10 rounded-full"
                          style={{
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              marginLeft: 8,
                              position: "absolute",
                              width: "100%",
                              height: "100%",
                              backgroundImage: `url(${`${process.env.NEXT_PUBLIC_BASE_URL}${avatar.url}`})`,
                              scale: 2,
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
                <button
                  disabled={selectedAvatar === null}
                  onClick={handleSaveAvatar}
                  className="w-full mt-6 bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Avatar
                </button>
              </DialogContent>
            </Dialog>
          </div>

          <Dialog open={isJoinSpaceDialogOpen} onOpenChange={handleJoinDialogOpenChange}>
            <DialogTrigger asChild>
              <button className="rounded-lg flex gap-2 py-2 px-4 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all">
                <UserPlus size={20} className="mt-[1px]" />
                Join
              </button>
            </DialogTrigger>
            <DialogContent className="p-7">
              <DialogTitle className="text-xl font-bold">Join a Space</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Enter the space ID to join</p>
              <div className="flex flex-col gap-4 mt-6">
                <input
                  type="text"
                  className="rounded-xl p-3 text-gray-900 border-gray-300 border-2 focus:outline-none focus:ring-2 focus:ring-third focus:border-third transition-all"
                  placeholder="Enter space ID"
                  value={joinSpaceId}
                  onChange={(e) => setJoinSpaceId(e.target.value)}
                  disabled={isJoiningSpace}
                />
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                    <p className="text-sm font-medium">{successMessage}</p>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}
                <button
                  disabled={joinSpaceId === "" || isJoiningSpace}
                  onClick={handleJoinSpace}
                  className="bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isJoiningSpace ? "Joining..." : "Join Space"}
                </button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateSpaceDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <button className="rounded-lg flex gap-2 py-2 px-4 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all">
                <PlusCircle size={20} className="mt-[1px]" />
                Create
              </button>
            </DialogTrigger>
            <DialogContent className="p-7">
              {!selectedMap ? (
                <>
                  <DialogTitle className="text-xl font-bold">Choose a Map</DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">Select a map template for your new space</p>
                  <div className="flex flex-col gap-4 mt-6">
                    {maps.map((map) => (
                      <div
                        key={map.id}
                        className="flex bg-fourth rounded-2xl shadow-md cursor-pointer hover:shadow-2xl transition-all overflow-hidden hover:bg-fifth hover:-translate-y-1"
                        onClick={() => setSelectedMap(map.id)}
                      >
                        <div className="bg-black h-32 w-2/5">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_BASE_URL}${map.imageUrl}`}
                            alt="Map Image"
                            width={map.width * 16}
                            height={map.height * 16}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="w-3/5 flex flex-col justify-center px-8">
                          <h2 className="font-semibold mb-1">{map.name}</h2>
                          <p className="text-sm">{map.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-xl font-bold">Name Your Space</DialogTitle>
                      <p className="text-sm text-gray-600 mt-1">Give your space a unique name</p>
                    </div>
                    <button
                      onClick={() => setSelectedMap(null)}
                      className="rounded-xl bg-fourth p-2 hover:bg-fifth transition-all"
                    >
                      <ArrowLeft size={20} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-4 mt-6">
                    <input
                      type="text"
                      className="rounded-xl p-3 text-gray-900 border-gray-300 border-2 focus:outline-none focus:ring-2 focus:ring-third focus:border-third transition-all"
                      placeholder="Enter space name"
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                      disabled={isCreatingSpace}
                    />
                    {successMessage && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                        <p className="text-sm font-medium">{successMessage}</p>
                      </div>
                    )}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}
                    <button
                      disabled={spaceName === "" || isCreatingSpace}
                      onClick={handleCreateSpace}
                      className="bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingSpace ? "Creating..." : "Create Space"}
                    </button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg py-2 px-4 bg-red-100 text-red-600 hover:bg-red-200 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

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
