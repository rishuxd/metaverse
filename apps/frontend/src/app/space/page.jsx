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
import { Locate, ZoomIn, ZoomOutIcon } from "lucide-react";

export default function Page() {
  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const mainSceneRef = useRef(null);
  const gameLoopRef = useRef(null);
  const cameraRef = useRef(null);
  const scaleRef = useRef(1); // Zoom level

  const [userId, setUserId] = useState(null);
  const [space, setSpace] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    cameraRef.current?.disableFollowHero();
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;

    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;

    panStart.current = { x: e.clientX, y: e.clientY };

    cameraRef.current?.handlePan(dx, dy);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const image = {
        image: img,
        isLoaded: false,
      };

      img.onload = () => {
        image.isLoaded = true;
        resolve(image);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const handleZoom = (zoomIn) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    scaleRef.current = Math.max(
      0.5,
      Math.min(scaleRef.current + (zoomIn ? 0.1 : -0.1), 3)
    );
    ctx.resetTransform();
    ctx.scale(scaleRef.current, scaleRef.current);
  };

  const moveToHero = () => {
    const heroPosition = cameraRef.current?.heroPosition;
    if (heroPosition) {
      cameraRef.current.moveTo(heroPosition);
      cameraRef.current.enableFollowHero();
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const url = new URL(window.location.href);
      const token = localStorage.getItem("token");
      const spaceId = url.searchParams.get("spaceId");

      if (!token || !spaceId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/space/${spaceId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSpace(response.data.data.space);

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

        wsRef.current.onclose = () => setIsConnected(false);
        wsRef.current.onmessage = (event) => {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        };

        setIsLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (gameLoopRef.current) gameLoopRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (!space || !canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const mainScene = new GameObject({ position: new Vector2(0, 0) });
    mainSceneRef.current = mainScene;

    // Resize canvas to match its CSS size and device pixel ratio
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1; // Use device pixel ratio for crisp rendering
      const rect = canvas.getBoundingClientRect(); // Get CSS size

      // Update canvas resolution to match its CSS size multiplied by DPR
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Reset canvas styles to match CSS dimensions
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Scale the context to handle high-DPI rendering
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Reset transform with scaling
    };

    async function initializeGame() {
      try {
        resizeCanvas();

        const mapImage = await loadImage(
          `${process.env.NEXT_PUBLIC_BASE_URL}${space.map.imageUrl}`
        );

        // Create map sprite with proper positioning
        const mapSprite = new Sprite({
          resource: mapImage,
          frameSize: new Vector2(gridCells(30), gridCells(20)),
        });

        // Initialize camera with proper canvas dimensions
        const camera = new Camera(canvas.width, canvas.height);
        cameraRef.current = camera;

        // camera.setMapSize(mapSprite.frameSize.x, mapSprite.frameSize.y);
        camera.setPosition(
          -mapSprite.frameSize.x / 2 + canvas.width / 2,
          -mapSprite.frameSize.y / 2 + canvas.height / 2
        );

        // Add objects in correct order
        mainScene.addChild(mapSprite);
        mainScene.addChild(camera);
        mainScene.input = new Input();

        const update = (delta) => {
          if (!mainScene || !camera) return;

          // Ensure delta is reasonable
          const cappedDelta = Math.min(delta, 32); // Cap at ~30 FPS equivalent
          mainScene.stepEntry(cappedDelta, mainScene);
          camera.update(cappedDelta);
        };

        const draw = () => {
          if (!ctx || !mainScene || !camera) return;

          // Clear the canvas with a background color
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.save();

          // Apply camera transform with zoom
          const dpr = window.devicePixelRatio || 1;
          ctx.scale(camera.zoom, camera.zoom);
          ctx.translate(-camera.position.x * dpr, -camera.position.y * dpr);

          // Draw scene
          mainScene.draw(ctx, 0, 0);

          ctx.restore();
        };

        // Clean up previous game loop if it exists
        if (gameLoopRef.current) {
          gameLoopRef.current.stop();
        }

        const gameLoop = new GameLoop(update, draw);
        gameLoopRef.current = gameLoop;
        gameLoop.start();
      } catch (error) {
        console.error("Game initialization error:", error);
      }
    }

    initializeGame();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      if (gameLoopRef.current) {
        gameLoopRef.current.stop();
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [space, isLoading]);

  const handleWebSocketMessage = (message) => {
    const mainScene = mainSceneRef.current;
    if (!mainScene) return;

    switch (message.type) {
      case "space-joined":
        const hero = new Hero(
          gridCells(message.payload.spawn.x),
          gridCells(message.payload.spawn.y),
          wsRef.current,
          message.payload.userId
        );
        mainScene.addChild(hero);
        setUserId(message.payload.userId);

        if (message.payload.users) {
          message.payload.users.forEach((user) => {
            const remoteUser = new RemoteUser(
              gridCells(user.x),
              gridCells(user.y),
              user.userId
            );
            mainScene.addChild(remoteUser);
          });
        }
        break;

      case "user-joined":
        const remoteUser = new RemoteUser(
          gridCells(message.payload.x),
          gridCells(message.payload.y),
          message.payload.userId
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-red-300">
      <div className="flex justify-between items-center p-4 bg-second text-white">
        <div>{space?.name}</div>
        <div className="flex gap-4">
          <button onClick={() => handleZoom(true)}>
            <ZoomIn size={24} />
          </button>
          <button onClick={() => handleZoom(false)}>
            <ZoomOutIcon size={24} />
          </button>
          <button onClick={moveToHero}>
            <Locate size={24} />
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        id="game-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isPanning ? "grabbing" : "grab",
        }}
      />
      {isConnected && userId && (
        <VideoOverlay
          wsConnection={wsRef.current}
          userId={userId}
          mainScene={mainSceneRef.current}
        />
      )}
    </div>
  );
}
