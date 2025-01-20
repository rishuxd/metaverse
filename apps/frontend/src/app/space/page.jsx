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
import { useRouter } from "next/navigation";
import ChatPanel from "@/components/chat";
import { loadImage } from "@/helpers/loadImage";
import { walls } from "@/levels/level1";

export default function Page() {
  const router = useRouter();
  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const mainSceneRef = useRef(null);
  const gameLoopRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [space, setSpace] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize WebSocket connection and fetch space data
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const spaceId = url.searchParams.get("spaceId");

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
  }, []);

  // Initialize game after space data is loaded
  useEffect(() => {
    if (!space || !canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const mainScene = new GameObject({
      position: new Vector2(0, 0),
    });
    mainSceneRef.current = mainScene;

    async function initializeGame() {
      try {
        const mapImage = await loadImage(
          `${process.env.NEXT_PUBLIC_BASE_URL}${space.map.imageUrl}`
        );

        const mapSprite = new Sprite({
          resource: mapImage,
          frameSize: new Vector2(gridCells(30), gridCells(20)),
        });
        mainScene.addChild(mapSprite);

        // Initialize camera and input
        const camera = new Camera();
        mainScene.addChild(camera);
        mainScene.input = new Input();

        // Start game loop
        const update = (delta) => {
          mainScene.stepEntry(delta, mainScene);
        };

        const draw = () => {
          mainScene.draw(ctx, 0, 0);
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

  return isLoading ? (
    <div className="bg-fourth h-screen flex justify-center items-center">
      <div className="animate-[spin_2s_linear_infinite]">
        <img
          src="/leaf.png"
          alt="Logo"
          width={36}
          height={36}
          style={{
            imageRendering: "auto",
          }}
        />
      </div>
    </div>
  ) : (
    <div className="relative">
      <canvas
        ref={canvasRef}
        id="game-canvas"
        width={gridCells(30)}
        height={gridCells(20)}
      />

      <div className="absolute top-2 left-2 flex gap-2">
        <div
          className=" flex items-center px-3 text-white bg-black bg-opacity-50 rounded-lg transition-all hover:bg-opacity-60 cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          <img
            src="rec.png"
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
          <ChatPanel
            wsConnection={wsRef.current}
            userId={userId}
            mainScene={mainSceneRef.current}
          />
          <VideoOverlay
            wsConnection={wsRef.current}
            userId={userId}
            mainScene={mainSceneRef.current}
          />
        </>
      )}
    </div>
  );
}
