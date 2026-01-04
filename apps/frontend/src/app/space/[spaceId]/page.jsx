"use client";

import { useEffect, useState, useRef } from "react";
import { Sprite } from "@/utils/Sprite";
import { Vector2 } from "@/utils/Vector2";
import { GameLoop } from "@/utils/GameLoop";
import { Input } from "@/utils/Input";
import { gridCells } from "@/helpers/grid";
import { GameObject } from "@/utils/GameObject";
import { Hero } from "@/objects/Hero/Hero";
import { Camera } from "@/utils/Camera";
import { RemoteUser } from "@/objects/RemoteUser";
import { VideoOverlay } from "@/components/video";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import ChatPanel from "@/components/chat";
import { loadImage } from "@/helpers/loadImage";
import { walls } from "@/levels/level1";
import { getAuthToken } from "@/utils/auth";
import { Share2, Check } from "lucide-react";
import SpaceLobbyOverlay from "@/components/lobby/SpaceLobbyOverlay";

export default function SpacePage() {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.spaceId;

  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const mainSceneRef = useRef(null);
  const gameLoopRef = useRef(null);
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
  const [loadingSteps, setLoadingSteps] = useState({
    spaceData: { status: 'loading', label: 'Fetching space...' },
    assets: { status: 'loading', label: 'Loading assets...' },
    media: { status: 'loading', label: 'Setting up media...' },
    avatars: { status: 'loading', label: 'Loading avatars...' },
  });

  // Check if user has avatar
  useEffect(() => {
    const avatarUrl = localStorage.getItem("avatarUrl");
    setHasAvatar(!!(avatarUrl && avatarUrl !== "null"));
  }, []);

  // Lobby: Preload everything
  useEffect(() => {
    const token = getAuthToken();
    if (!token || !spaceId) {
      router.push("/login?redirect=/space/" + spaceId);
      return;
    }

    let progress = 0;

    // Task 1: Fetch space data
    axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/space/${spaceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
      const spaceData = response.data.data.space;
      setSpace(spaceData);
      walls.set("walls", spaceData.map.walls);

      setLoadingSteps((prev) => ({
        ...prev,
        spaceData: { status: 'success', label: 'Space loaded!' },
      }));
      progress += 25;
      setLoadingProgress(progress);

      // Task 2: Preload map image
      loadImage(`${process.env.NEXT_PUBLIC_BASE_URL}${spaceData.map.imageUrl}`)
        .then(() => {
          setLoadingSteps((prev) => ({
            ...prev,
            assets: { status: 'success', label: 'Assets loaded!' },
          }));
          progress += 25;
          setLoadingProgress(progress);
        });
    })
    .catch((err) => {
      console.error("Failed to fetch space:", err);
      setError("Failed to load space. Please try again.");
      setLoadingSteps((prev) => ({
        ...prev,
        spaceData: { status: 'error', label: 'Failed to load space' },
      }));
    });

    // Task 3: Fetch avatars (if needed)
    if (!hasAvatar) {
      axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/avatars`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.status === 201) {
          setAvatars(response.data.data.avatars);
          setLoadingSteps((prev) => ({
            ...prev,
            avatars: { status: 'success', label: 'Avatars loaded!' },
          }));
          progress += 25;
          setLoadingProgress(progress);
        }
      })
      .catch((err) => console.error("Failed to fetch avatars:", err));
    } else {
      setLoadingSteps((prev) => ({
        ...prev,
        avatars: { status: 'success', label: 'Avatar ready!' },
      }));
      progress += 25;
      setLoadingProgress(progress);
    }

    // Task 4: Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setLoadingSteps((prev) => ({
          ...prev,
          media: { status: 'success', label: 'Media ready!' },
        }));
        progress += 25;
        setLoadingProgress(progress);
      })
      .catch((err) => {
        console.warn("Media not available:", err);
        setLoadingSteps((prev) => ({
          ...prev,
          media: { status: 'error', label: 'Media unavailable (optional)' },
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

  // Initialize WebSocket connection when joining from lobby
  useEffect(() => {
    if (showLobby) return; // Only run after lobby

    const token = getAuthToken();

    if (!token || !spaceId) {
      setIsLoading(false);
      return;
    }

    async function initialize() {
      try {
        // First fetch space data
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/space/${spaceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSpace(response.data.data.space);
        walls.set("walls", response.data.data.space.map.walls);

        // Then establish WebSocket connection
        wsRef.current = new WebSocket("ws://localhost:5001");

        wsRef.current.onopen = () => {
          setIsConnected(true);
          wsRef.current.send(
            JSON.stringify({
              type: "join",
              payload: {
                spaceId,
                token,
              },
            })
          );
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
        };

        wsRef.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        };

        setIsLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoading(false);
      }
    }

    initialize();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (gameLoopRef.current) {
        gameLoopRef.current.stop();
      }
    };
  }, [spaceId]);

  // Initialize game after space data is loaded
  useEffect(() => {
    if (!space || !canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Disable image smoothing for crisp pixel art at all zoom levels
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;

    const mainScene = new GameObject({
      position: new Vector2(0, 0),
    });
    mainSceneRef.current = mainScene;

    async function initializeGame() {
      try {
        // Fullscreen viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        canvas.width = viewportWidth;
        canvas.height = viewportHeight;

        // Handle window resize
        const handleResize = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          if (camera) {
            camera.canvasWidth = window.innerWidth;
            camera.canvasHeight = window.innerHeight;
          }
        };
        window.addEventListener('resize', handleResize);

        const mapImage = await loadImage(
          `${process.env.NEXT_PUBLIC_BASE_URL}${space.map.imageUrl}`
        );

        const mapSprite = new Sprite({
          resource: mapImage,
          frameSize: new Vector2(gridCells(space.map.width), gridCells(space.map.height)),
        });
        mainScene.addChild(mapSprite);

        // Initialize camera and input
        const camera = new Camera(viewportWidth, viewportHeight, space.map.width, space.map.height);

        // Center the map initially before hero spawns
        const mapWidthPixels = space.map.width * 16;
        const mapHeightPixels = space.map.height * 16;
        camera.position = new Vector2(
          (viewportWidth - mapWidthPixels) / 2,
          (viewportHeight - mapHeightPixels) / 2
        );

        mainScene.addChild(camera);
        mainScene.input = new Input();

        // Add zoom controls
        const handleWheel = (e) => {
          e.preventDefault();
          const zoomDirection = e.deltaY > 0 ? -1 : 1;
          camera.adjustZoom(zoomDirection);
        };

        // Add pan controls (drag to pan)
        let mouseDownPos = null;
        let hasDragged = false;

        const handleMouseDown = (e) => {
          if (e.button === 0) { // Left click
            mouseDownPos = { x: e.clientX, y: e.clientY };
            hasDragged = false;
          }
        };

        const handleMouseMove = (e) => {
          if (mouseDownPos) {
            // Check if user has dragged a minimum distance (to distinguish from click)
            const dx = e.clientX - mouseDownPos.x;
            const dy = e.clientY - mouseDownPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (!hasDragged && distance > 5) {
              // User started dragging
              hasDragged = true;
              camera.startPan(mouseDownPos.x, mouseDownPos.y);
              canvas.style.cursor = 'grabbing';
            }

            if (hasDragged) {
              camera.updatePan(e.clientX, e.clientY);
            }
          }
        };

        const handleMouseUp = (e) => {
          if (hasDragged && camera.isPanning) {
            camera.endPan();
            canvas.style.cursor = 'default';
          }
          mouseDownPos = null;
          hasDragged = false;
        };

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);

        // Start game loop
        const update = (delta) => {
          mainScene.stepEntry(delta, mainScene);
        };

        const draw = () => {
          // Fill with background color before drawing
          ctx.fillStyle = '#d1fae5';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Apply camera transformations
          ctx.save();

          // Ensure image smoothing is disabled for crisp pixels
          ctx.imageSmoothingEnabled = false;
          ctx.webkitImageSmoothingEnabled = false;
          ctx.mozImageSmoothingEnabled = false;
          ctx.msImageSmoothingEnabled = false;

          // Apply zoom (from center of canvas)
          if (camera.zoom !== 1.0) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(camera.zoom, camera.zoom);
            ctx.translate(-centerX, -centerY);
          }

          // Draw the scene, but use camera position as the starting offset
          // This makes the camera position control where we're looking
          mainScene.draw(ctx, camera.position.x, camera.position.y);

          ctx.restore();
        };

        const gameLoop = new GameLoop(update, draw);
        gameLoopRef.current = gameLoop;
        gameLoop.start();
      } catch (error) {
        console.error("Game initialization error:", error);
      }
    }

    initializeGame();
  }, [space, isLoading]);

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
        { headers: { Authorization: `Bearer ${token}` } }
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
      loadingSteps.spaceData.status === 'success',
      loadingSteps.assets.status === 'success',
      hasAvatar,
    ];
    return requiredSteps.every(Boolean);
  };

  const handleJoinSpace = () => {
    if (!canJoinSpace()) return;
    // Hide lobby and start the space
    setShowLobby(false);
    setIsLoading(false);
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/space/${spaceId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleWebSocketMessage = async (message) => {
    const mainScene = mainSceneRef.current;
    if (!mainScene) return;

    switch (message.type) {
      case "space-joined":
        const avatar = await loadImage(
          `${process.env.NEXT_PUBLIC_BASE_URL}${message.payload.avatarUrl}`
        );

        const hero = new Hero(
          gridCells(message.payload.spawn.x),
          gridCells(message.payload.spawn.y),
          wsRef.current,
          message.payload.userId,
          message.payload.username,
          avatar
        );
        mainScene.addChild(hero);
        setUserId(message.payload.userId);

        if (message.payload.users) {
          message.payload.users.forEach(async (user) => {
            const avatar1 = await loadImage(
              `${process.env.NEXT_PUBLIC_BASE_URL}${user.avatarUrl}`
            );

            const remoteUser = new RemoteUser(
              gridCells(user.x),
              gridCells(user.y),
              user.userId,
              user.username,
              avatar1
            );
            mainScene.addChild(remoteUser);
          });
        }
        break;

      case "user-joined":
        const result = await loadImage(
          `${process.env.NEXT_PUBLIC_BASE_URL}${message.payload.avatarUrl}`
        );

        if (!result.isLoaded) {
          console.error(result.error);
          return;
        }

        const remoteUser = new RemoteUser(
          gridCells(message.payload.x),
          gridCells(message.payload.y),
          message.payload.userId,
          message.payload.username,
          result
        );
        mainScene.addChild(remoteUser);
        break;

      case "user-left":
        const remoteUser1 = mainScene.children.find(
          (child) => child?.userId === message.payload.userId
        );
        if (remoteUser1) {
          mainScene.removeChild(remoteUser1);
          remoteUser1.destroy();
        }
        break;

      case "movement":
        const remoteUser3 = mainScene.children.find(
          (child) => child?.userId === message.payload.userId
        );
        if (remoteUser3) {
          remoteUser3.updatePosition(message.payload.x, message.payload.y);
        }
        break;

      case "movement-rejected":
        setMe((prev) => ({
          ...prev,
          x: message.payload.x,
          y: message.payload.y,
        }));
        break;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-green-100">
      <canvas
        ref={canvasRef}
        id="game-canvas"
        style={{
          display: 'block',
          backgroundColor: '#d1fae5',
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges',
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
              mainScene={mainSceneRef.current}
            />
          </div>
          <VideoOverlay
            wsConnection={wsRef.current}
            userId={userId}
            mainScene={mainSceneRef.current}
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
