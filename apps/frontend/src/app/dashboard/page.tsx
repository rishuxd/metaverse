"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowBigLeft,
  ArrowLeft,
  EllipsisVertical,
  Loader,
  Loader2,
  PlusCircle,
  Stars,
  StepBack,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const router = useRouter();
  const [spaces, setSpaces] = useState([]);
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [spaceName, setSpaceName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const user = {
    name: "John Doe",
    avatar: "/PIC.jpg",
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");

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
          console.log("Maps: ", response.data.data);
          setMaps(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch maps:", error);
        if (isMounted) {
          setError("Failed to fetch maps!");
        }
      }
    };

    const fetchData = async () => {
      if (!token) {
        setError("Unauthorized: No token found!");
        return;
      }

      try {
        await Promise.all([fetchSpaces(), fetchMaps()]);
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

      console.log(response.data);

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
          />
          <div className="rounded-lg flex gap-2 py-2 px-4 bg-fourth font-semibold hover:bg-fifth transition-all">
            <Stars size={20} className="mt-[1px]" />
            My Spaces
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Image
              src={user.avatar}
              alt="User Avatar"
              width={34}
              height={34}
              className="rounded-full"
            />
            <span className="rounded-lg py-2 px-4 bg-fifth font-semibold hover:bg-fourth transition-all">
              {user.name}
            </span>
          </div>
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
                      onClick={handleCreateSpace}
                      className="bg-third text-white rounded-xl py-2 hover:bg-fourth transition-all"
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

      <main className="flex flex-col bg-first flex-grow h-screen py-10 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
          {spaces.map((space) => (
            <div key={space.id}>
              <div
                className="bg-black h-full w-full rounded-lg shadow-2xl transition-all overflow-hidden hover:scale-105"
                onClick={() => router.push(`/space?spaceId=${space.id}`)}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}${space.map.imageUrl}`}
                  alt="Space Image"
                  width={space.map.width * 16}
                  height={space.map.height * 16}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex text-sm justify-between pl-1 mt-4">
                <h2 className="font-semibold ">{space.name}</h2>
                <div className="flex gap-2 items-center">
                  <p className="text-xs">
                    {new Date(space.createdAt).toLocaleDateString()}
                  </p>
                  <EllipsisVertical size={16} className="text-gray-300" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            <div className="h-72 w-80 flex flex-col space-y-6">
              <Skeleton className=" h-full w-full rounded-xl" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <div className=" flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
            <div className="h-72 w-80 flex flex-col space-y-6">
              <Skeleton className=" h-full w-full rounded-xl" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <div className=" flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
            <div className="h-72 w-80 flex flex-col space-y-6">
              <Skeleton className=" h-full w-full rounded-xl" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <div className=" flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          spaces.length === 0 && (
            <div className="flex items-center justify-center">
              <p>You have no spaces yet. Create one!</p>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default Dashboard;
