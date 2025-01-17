"use client";

import { useEffect, useState, useRef } from "react";
import { resources } from "@/utils/Resource";
import { Sprite } from "@/utils/Sprite";
import { Vector2 } from "@/utils/Vector2";
import { GameLoop } from "@/utils/GameLoop";
import { Input } from "@/utils/Input";
import { gridCells } from "@/helpers/grid";
import { GameObject } from "@/utils/GameObject";
import { Hero } from "@/objects/Hero/Hero";
import { Camera } from "@/utils/Camera";
import { RemoteUser } from "@/objects/RemoteUser";
import { VideoOverlay } from "./video";

export default function GameCanvas() {
  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const mainSceneRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const spaceId = url.searchParams.get("spaceId");

    if (!token || !spaceId) {
      return;
    }

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

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const mainScene = new GameObject({
      position: new Vector2(0, 0),
    });
    mainSceneRef.current = mainScene;

    const groundSprite = new Sprite({
      resource: resources.images.ground,
      frameSize: new Vector2(gridCells(30), gridCells(20)),
    });
    mainScene.addChild(groundSprite);

    const camera = new Camera();
    mainScene.addChild(camera);

    mainScene.input = new Input();

    const update = (delta) => {
      mainScene.stepEntry(delta, mainScene);
    };

    const draw = () => {
      mainScene.draw(ctx, 0, 0);
    };

    const gameLoop = new GameLoop(update, draw);
    gameLoop.start();

    return () => gameLoop.stop();
  }, []);

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

  return (
    <>
      <canvas
        ref={canvasRef}
        id="game-canvas"
        width={gridCells(30)}
        height={gridCells(20)}
      />

      {isConnected && userId && (
        <VideoOverlay
          wsConnection={wsRef.current}
          userId={userId}
          mainScene={mainSceneRef.current}
        />
      )}
    </>
  );
}
