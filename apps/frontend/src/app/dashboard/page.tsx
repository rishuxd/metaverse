"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, Check, LogOut, PlusCircle, Stars } from "lucide-react";
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

const Dashboard = () => {
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [maps, setMaps] = useState<Map[]>([]);
  const [recentSpaces, setRecentSpaces] = useState<RecentSpace[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);

  const [selectedMap, setSelectedMap] = useState<String | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<String | null>(null);
  const [spaceName, setSpaceName] = useState<string>("");
  const [error, setError] = useState<String | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [token, setToken] = useState<String | null>(null);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");
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
          setIsLoading(false);
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
          setIsLoading(false);
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
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateSpace = async () => {
    try {
      const token = localStorage.getItem("token");

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

      if (response.status === 201) {
        setSpaces([...spaces, response.data.data.space]);
        setSpaceName("");
        setSelectedMap(null);
      }
    } catch (error) {
      console.error("Failed to create space:", error);
      setError("Failed to create space!");
    }

    return;
  };

  const handleLogout = () => {
    localStorage.clear();
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
        <div className="flex items-center justify-center gap-8">
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

            <Dialog>
              <DialogTrigger asChild>
                <button className="rounded-lg flex gap-2 py-2 px-4 bg-fourth font-semibold hover:bg-fifth transition-all">
                  {localStorage.getItem("username")}
                </button>
              </DialogTrigger>
              <DialogContent className="p-7">
                <DialogTitle>How do you want to look?</DialogTitle>
                <div className="grid grid-cols-3 gap-4 mt-4">
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
                  className="w-full mt-6 bg-third text-white rounded-xl py-2 hover:bg-fourth transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-third"
                >
                  <p className="font-semibold">Save</p>
                </button>
              </DialogContent>
            </Dialog>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg py-2 px-4 bg-red-100 text-red-600 hover:bg-red-200 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded-lg flex gap-2 py-2 px-4 bg-third font-semibold hover:bg-fourth transition-all">
                <PlusCircle size={20} className="mt-[1px]" />
                Create Space
              </button>
            </DialogTrigger>
            <DialogContent className="p-7">
              {!selectedMap ? (
                <>
                  <DialogTitle>What are you looking to do here?</DialogTitle>
                  <div className="flex flex-col gap-6 mt-4">
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
                  <div className="flex items-center justify-between px-1">
                    <DialogTitle>
                      What would be the space of your name?
                    </DialogTitle>
                    <button
                      onClick={() => setSelectedMap(null)}
                      className="rounded-full bg-fourth p-1 hover:bg-fifth transition-all"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-6 mt-4">
                    <input
                      type="text"
                      className="bg-fourth rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 "
                      placeholder="Enter space name"
                      value={spaceName}
                      onChange={(e) => setSpaceName(e.target.value)}
                    />
                    <button
                      disabled={spaceName === ""}
                      onClick={handleCreateSpace}
                      className="bg-third text-white rounded-xl py-2 hover:bg-fourth transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-third"
                    >
                      <p className="font-semibold">Create Space</p>
                    </button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      <SpacesLayout
        spaces={spaces}
        recentSpaces={recentSpaces}
        token={token}
        router={router}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Dashboard;
