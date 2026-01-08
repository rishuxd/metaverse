"use client";

import { useEffect, useState, useRef } from "react";
import { VideoOverlay } from "@/components/video";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import ChatPanel from "@/components/chat";
import { loadImage } from "@/game/helpers/loadImage";
import { walls } from "@/levels/level1";
import { getAuthToken } from "@/utils/auth";
import { Share2, Check } from "lucide-react";
import SpaceLobbyOverlay from "@/components/lobby/SpaceLobbyOverlay";
import { GameManager } from "@/game/engine/GameManager";
import { events } from "@/game/engine/Events";

export default function SpacePage() {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.spaceId;

  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [space, setSpace] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Lobby state
  const [showLobby, setShowLobby] = useState(true);
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [hasAvatar, setHasAvatar] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [cachedMapImage, setCachedMapImage] = useState(null);
  const [loadingSteps, setLoadingSteps] = useState({
    spaceData: { status: "loading", label: "Fetching space..." },
    assets: { status: "loading", label: "Loading assets..." },
    media: { status: "loading", label: "Setting up media..." },
    avatars: { status: "loading", label: "Loading avatars..." },
    connection: { status: "loading", label: "Connecting to server..." },
  });

  // Active users in the space
  const [activeUsers, setActiveUsers] = useState([]);
  const [userCount, setUserCount] = useState(0);

  // Check if user has avatar
  useEffect(() => {
    const avatarUrl = localStorage.getItem("avatarUrl");
    setHasAvatar(!!(avatarUrl && avatarUrl !== "null"));
  }, []);

  // Fetch active users in the space once when lobby opens
  useEffect(() => {
    if (!showLobby || !spaceId) return;

    const fetchActiveUsers = async () => {
      try {
        const wsHttpUrl =
          process.env.NEXT_PUBLIC_WS_HTTP_URL || "http://localhost:7004";
        const response = await axios.get(`${wsHttpUrl}/rooms/${spaceId}/users`);
        setActiveUsers(response.data.users || []);
        setUserCount(response.data.userCount || 0);
      } catch (error) {
        console.error("Failed to fetch active users:", error);
      }
    };

    fetchActiveUsers();
  }, [showLobby, spaceId]);

  // Set up game engine event listeners
  useEffect(() => {
    const handleUserIdSet = (userId) => {
      setUserId(userId);
    };

    const handleGameReady = () => {
      console.log("[GameManager] Game is ready");
      setLoadingSteps((prev) => ({
        ...prev,
        connection: { status: "success", label: "Game ready!" },
      }));
    };

    events.on("USER_ID_SET", null, handleUserIdSet);
    events.on("GAME_READY", null, handleGameReady);

    return () => {
      events.off("USER_ID_SET");
      events.off("GAME_READY");
    };
  }, []);

  // Get GameManager singleton instance
  const gameManager = GameManager.getInstance();

  // Lobby: Preload everything
  useEffect(() => {
    const token = getAuthToken();
    if (!token || !spaceId) {
      router.push("/login?redirect=/space/" + spaceId);
      return;
    }

    let progress = 0;

    // Task 1: Fetch space data
    axios
      .get(`${process.env.NEXT_PUBLIC_BASE_URL}/space/${spaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const spaceData = response.data.data.space;
        setSpace(spaceData);

        setLoadingSteps((prev) => ({
          ...prev,
          spaceData: { status: "success", label: "Space loaded!" },
        }));
        progress += 25;
        setLoadingProgress(progress);

        // Task 2: Preload map image
        loadImage(
          `${process.env.NEXT_PUBLIC_BASE_URL}${spaceData.map.imageUrl}`,
        ).then(async (mapImage) => {
          setCachedMapImage(mapImage);
          setLoadingSteps((prev) => ({
            ...prev,
            assets: { status: "success", label: "Assets loaded!" },
          }));
          progress += 25;
          setLoadingProgress(progress);

          // Initialize GameManager with loaded assets (only once)
          if (canvasRef.current && spaceData && !gameManager.isInitialized) {
            try {
              console.log("[SpacePage] Initializing GameManager with assets");

              // Set up canvas size
              const canvas = canvasRef.current;
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;

              // Initialize game with preloaded assets
              await gameManager.initialize(canvas, spaceData, {
                mapImage: mapImage,
              });

              // Connect WebSocket to GameManager if available
              if (wsRef.current) {
                gameManager.connectWebSocket(wsRef.current);
              }

              console.log("[SpacePage] GameManager initialized with assets");
            } catch (error) {
              console.error(
                "[SpacePage] GameManager initialization failed:",
                error,
              );
            }
          } else if (gameManager.isInitialized) {
            console.log(
              "[SpacePage] GameManager already initialized, skipping",
            );
          }
        });
      })
      .catch((err) => {
        console.error("Failed to fetch space:", err);
        setError("Failed to load space. Please try again.");
        setLoadingSteps((prev) => ({
          ...prev,
          spaceData: { status: "error", label: "Failed to load space" },
        }));
      });

    // Task 3: Fetch avatars (if needed)
    if (!hasAvatar) {
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_URL}/avatars`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          if (response.status === 201) {
            setAvatars(response.data.data.avatars);
            setLoadingSteps((prev) => ({
              ...prev,
              avatars: { status: "success", label: "Avatars loaded!" },
            }));
            progress += 25;
            setLoadingProgress(progress);
          }
        })
        .catch((err) => console.error("Failed to fetch avatars:", err));
    } else {
      setLoadingSteps((prev) => ({
        ...prev,
        avatars: { status: "success", label: "Avatar ready!" },
      }));
      progress += 25;
      setLoadingProgress(progress);
    }

    // Task 4: Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLoadingSteps((prev) => ({
          ...prev,
          media: { status: "success", label: "Media ready!" },
        }));
        progress += 25;
        setLoadingProgress(progress);
      })
      .catch((err) => {
        console.warn("Media not available:", err);
        setLoadingSteps((prev) => ({
          ...prev,
          media: { status: "error", label: "Media unavailable (optional)" },
        }));
        progress += 25;
        setLoadingProgress(progress);
      });

    return () => {
      // Cleanup only if still in lobby
      if (showLobby && mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [spaceId, hasAvatar, showLobby]);

  // Mark connection as ready (no WebSocket needed in lobby)
  useEffect(() => {
    setLoadingSteps((prev) => ({
      ...prev,
      connection: { status: "success", label: "Ready to join!" },
    }));
  }, []);

  // Cleanup WebSocket and GameManager when navigating away
  useEffect(() => {
    return () => {
      console.log(
        "[SpacePage] Cleaning up - closing WebSocket and resetting GameManager",
      );
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
      }
      gameManager.reset();
    };
  }, [spaceId]);

  // Destroy singleton on component unmount
  useEffect(() => {
    return () => {
      console.log("[SpacePage] Destroying GameManager singleton");
      GameManager.destroyInstance();
    };
  }, []);

  // Handle window resize for GameManager
  useEffect(() => {
    const handleResize = () => {
      gameManager.resize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lobby handlers
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;

    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/metadata`,
        { avatarId: selectedAvatar },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 201) {
        localStorage.setItem("avatarUrl", response.data.data.imageUrl);
        setHasAvatar(true);
        setSelectedAvatar(null);
      }
    } catch (err) {
      console.error("Failed to save avatar:", err);
      setError("Failed to save avatar. Please try again.");
    }
  };

  const canJoinSpace = () => {
    const requiredSteps = [
      loadingSteps.spaceData.status === "success",
      loadingSteps.assets.status === "success",
      loadingSteps.connection.status === "success",
      hasAvatar,
      gameManager.isReady(), // Just check if game is initialized, not WebSocket
    ];
    return requiredSteps.every(Boolean);
  };

  const handleJoinSpace = async () => {
    if (!canJoinSpace()) {
      return;
    }

    console.log("[SpacePage] Connecting to WebSocket and joining space");

    try {
      // Establish WebSocket connection
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5001";
      wsRef.current = new WebSocket(wsUrl);

      await new Promise((resolve, reject) => {
        wsRef.current.onopen = () => {
          console.log("[SpacePage] WebSocket connected");
          setIsConnected(true);
          resolve();
        };

        wsRef.current.onerror = (error) => {
          console.error("[SpacePage] WebSocket connection error:", error);
          reject(error);
        };

        // Timeout after 5 seconds
        setTimeout(
          () => reject(new Error("WebSocket connection timeout")),
          5000,
        );
      });

      wsRef.current.onclose = () => {
        console.log("[SpacePage] WebSocket disconnected");
        setIsConnected(false);
      };

      wsRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        gameManager.handleWebSocketMessage(message);
      };

      // Connect GameManager to WebSocket
      gameManager.connectWebSocket(wsRef.current);

      // Send join message to server
      const token = getAuthToken();
      gameManager.joinSpace(spaceId, token);

      // Hide lobby - character will spawn when server responds
      setShowLobby(false);
      setIsLoading(false);
    } catch (error) {
      console.error("[SpacePage] Failed to connect:", error);
      setError("Failed to connect to server. Please try again.");
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/space/${spaceId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-green-100">
      <canvas
        ref={canvasRef}
        id="game-canvas"
        style={{
          display: "block",
          backgroundColor: "#d1fae5",
          imageRendering: "pixelated",
          imageRendering: "-moz-crisp-edges",
          imageRendering: "crisp-edges",
        }}
      />

      <div className="absolute top-2 left-2 flex gap-2">
        <div
          className=" flex items-center px-3 text-white bg-black bg-opacity-50 rounded-lg transition-all hover:bg-opacity-60 cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <img
            src="/rec.png"
            alt="logo"
            width={20}
            style={{
              imageRendering: "auto",
            }}
          />
        </div>
        <div className="px-2 text-white bg-black bg-opacity-50 py-2 rounded-lg transition-all">
          {space?.name || "Unknown Space"}
        </div>
      </div>

      {isConnected && userId && (
        <>
          <div className="absolute top-2 right-2 flex gap-2">
            <div
              className="flex items-center px-3 py-2 text-white bg-black bg-opacity-50 rounded-lg transition-all hover:bg-opacity-60 cursor-pointer"
              onClick={handleCopyLink}
              title="Copy invite link"
            >
              {copied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Share2 size={16} />
              )}
            </div>
            <ChatPanel
              wsConnection={wsRef.current}
              userId={userId}
              mainScene={gameManager.scene}
            />
          </div>
          <VideoOverlay
            wsConnection={wsRef.current}
            userId={userId}
            mainScene={gameManager.scene}
          />
        </>
      )}

      {/* Lobby Overlay */}
      {showLobby && (
        <SpaceLobbyOverlay
          space={space}
          avatars={avatars}
          selectedAvatar={selectedAvatar}
          hasAvatar={hasAvatar}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          error={error}
          loadingProgress={loadingProgress}
          loadingSteps={loadingSteps}
          localVideoRef={localVideoRef}
          activeUsers={activeUsers}
          userCount={userCount}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onSelectAvatar={setSelectedAvatar}
          onSaveAvatar={handleSaveAvatar}
          onJoin={handleJoinSpace}
          canJoin={canJoinSpace()}
        />
      )}
    </div>
  );
}
