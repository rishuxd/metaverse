import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { gridCells } from "@/helpers/grid";

export const VideoOverlay = ({ wsConnection, userId, mainScene }) => {
  const [peers, setPeers] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [peerMediaStates, setPeerMediaStates] = useState(new Map());
  const [peerDetails, setPeerDetails] = useState(new Map());

  const localVideoRef = useRef();
  const peerConnections = useRef(new Map());
  const localStream = useRef();
  const candidateBuffer = useRef(new Map());
  const addedCandidates = useRef(new Set());
  const videoElements = useRef(new Map());
  const animationFrameId = useRef();

  const MAX_DISTANCE = gridCells(2.2);
  const FADE_START_DISTANCE = gridCells(2);

  const updateProximityEffects = () => {
    if (!mainScene) return;

    const localPlayer = mainScene.children.find(
      (child) => child?.userId === userId
    );
    if (!localPlayer) return;

    videoElements.current.forEach((element, peerId) => {
      const remotePeer = mainScene.children.find(
        (child) => child?.userId === peerId
      );
      if (!remotePeer) return;

      const dx = Math.abs(remotePeer.position.x - localPlayer.position.x);
      const dy = Math.abs(remotePeer.position.y - localPlayer.position.y);

      let volume = 1;
      let opacity = 1;

      if (dx > MAX_DISTANCE || dy > MAX_DISTANCE) {
        volume = 0;
        opacity = 0;
      } else if (dy > FADE_START_DISTANCE || dx > FADE_START_DISTANCE) {
        volume = 0.5;
        opacity = 0.5;
      }

      if (!isAudioMuted && element.volume !== volume) {
        element.volume = volume;
      }

      const currentOpacity =
        parseFloat(element.parentElement.style.opacity) || 1;
      if (!isVideoOff && currentOpacity !== opacity) {
        element.parentElement.style.opacity = opacity;
      }
    });

    animationFrameId.current = requestAnimationFrame(updateProximityEffects);
  };

  useEffect(() => {
    if (mainScene) {
      animationFrameId.current = requestAnimationFrame(updateProximityEffects);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mainScene]);

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    async function setupLocalStream() {
      try {
        setIsLoading(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        stream.getAudioTracks().forEach((track) => (track.enabled = true));
        stream.getVideoTracks().forEach((track) => (track.enabled = true));

        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        broadcastMediaState(isAudioMuted, isVideoOff, userId);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setError("Could not access camera/microphone");
      } finally {
        setIsLoading(false);
      }
    }

    setupLocalStream();

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "webrtc-offer":
          handleReceiveOffer(message.payload);
          break;
        case "webrtc-answer":
          handleReceiveAnswer(message.payload);
          break;
        case "webrtc-ice-candidate":
          handleReceiveICECandidate(message.payload);
          break;
        case "user-joined":
          initiateCall(message.payload.userId, message.payload.username);
          break;
        case "user-left":
          handleUserLeft(message.payload.userId);
          break;
        case "media-state-update":
          handleMediaStateUpdate(message.payload);
          break;
      }
    };

    wsConnection.addEventListener("message", handleMessage);

    return () => {
      localStream.current?.getTracks().forEach((track) => track.stop());

      peerConnections.current.forEach((connection) => {
        connection
          .getSenders()
          .forEach((sender) => connection.removeTrack(sender));
        connection.close();
      });
      peerConnections.current.clear();

      wsConnection.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleMediaStateUpdate = (payload) => {
    const { userId: peerId, isAudioMuted, isVideoOff } = payload;
    setPeerMediaStates(
      (prev) => new Map(prev.set(peerId, { isAudioMuted, isVideoOff }))
    );
  };

  const broadcastMediaState = (isAudioMuted, isVideoOff, userId) => {
    wsConnection.send(
      JSON.stringify({
        type: "media-state-update",
        payload: {
          isAudioMuted,
          isVideoOff,
          userId,
        },
      })
    );
  };

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(!isAudioMuted);
      broadcastMediaState(!audioTrack.enabled, isVideoOff, userId);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!isVideoOff);
      broadcastMediaState(isAudioMuted, !videoTrack.enabled, userId);
    }
  };

  const initiateCall = async (peerId, username) => {
    if (peerId === userId) return;

    if (peerConnections.current.has(peerId)) {
      const existingConnection = peerConnections.current.get(peerId);
      existingConnection.close();
      peerConnections.current.delete(peerId);
    }

    setPeerDetails((prev) => new Map(prev.set(peerId, { username })));

    const peerConnection = new RTCPeerConnection(configuration);
    peerConnections.current.set(peerId, peerConnection);

    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Connection state with ${peerId}:`,
        peerConnection.connectionState
      );
      if (peerConnection.connectionState === "failed") {
        console.warn(`Connection with ${peerId} failed. Reinitiating...`);
        handleUserLeft(peerId);
        initiateCall(peerId, username);
      }
    };

    localStream.current.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream.current);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        wsConnection.send(
          JSON.stringify({
            type: "webrtc-ice-candidate",
            payload: {
              candidate: event.candidate,
              targetUserId: peerId,
            },
          })
        );
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("ontrack event", event);
      setPeers((prev) => new Map(prev.set(peerId, event.streams[0])));
    };

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      wsConnection.send(
        JSON.stringify({
          type: "webrtc-offer",
          payload: {
            offer,
            targetUserId: peerId,
          },
        })
      );
    } catch (err) {
      console.error("Error creating offer:", err);
      handleUserLeft(peerId);
      setError(`Failed to connect with peer ${peerId}`);
    }
  };

  const handleReceiveOffer = async ({ offer, from, username }) => {
    try {
      if (!localStream.current) {
        console.warn("Local stream not ready. Retrying in 100ms...");
        setTimeout(() => handleReceiveOffer({ offer, from, username }), 100);
        return;
      }

      setPeerDetails((prev) => new Map(prev.set(from, { username })));

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnections.current.set(from, peerConnection);

      peerConnection.onconnectionstatechange = () => {
        console.log(
          `Connection state with ${from}:`,
          peerConnection.connectionState
        );
        if (peerConnection.connectionState === "failed") {
          console.warn(`Connection with ${from} failed. Reinitiating...`);
          handleUserLeft(from);
          initiateCall(from, username);
        }
      };

      localStream.current.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream.current);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          wsConnection.send(
            JSON.stringify({
              type: "webrtc-ice-candidate",
              payload: {
                candidate: event.candidate,
                targetUserId: from,
              },
            })
          );
        }
      };

      peerConnection.ontrack = (event) => {
        setPeers((prev) => new Map(prev.set(from, event.streams[0])));
      };

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      if (candidateBuffer.current.has(from)) {
        const candidates = candidateBuffer.current.get(from);
        for (const cand of candidates) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(cand));
        }
        candidateBuffer.current.delete(from);
      }

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      wsConnection.send(
        JSON.stringify({
          type: "webrtc-answer",
          payload: {
            answer,
            targetUserId: from,
          },
        })
      );
    } catch (err) {
      console.error("Error handling offer:", err);
      handleUserLeft(from);
      setError(`Failed to connect with peer ${from}`);
    }
  };

  const handleReceiveAnswer = async ({ answer, from }) => {
    const peerConnection = peerConnections.current.get(from);
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (err) {
        console.error("Error setting remote description:", err);
        handleUserLeft(from);
        setError(`Failed to establish connection with peer ${from}`);
      }
    }
  };

  const handleReceiveICECandidate = async ({ candidate, from }) => {
    const candidateKey = JSON.stringify(candidate);
    if (addedCandidates.current.has(candidateKey)) {
      console.log("Duplicate ICE candidate ignored:", candidate);
      return;
    }

    addedCandidates.current.add(candidateKey);

    const peerConnection = peerConnections.current.get(from);
    if (peerConnection && peerConnection.remoteDescription) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    } else {
      if (!candidateBuffer.current.has(from)) {
        candidateBuffer.current.set(from, []);
      }
      candidateBuffer.current.get(from).push(candidate);
    }
  };

  const handleUserLeft = (peerId) => {
    const peerConnection = peerConnections.current.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      peerConnections.current.delete(peerId);
    }
    setPeers((prev) => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
    setPeerMediaStates((prev) => {
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  };

  const renderPeerVideo = (peerId, stream) => {
    const { username } = peerDetails.get(peerId) || { username: "Unknown" };
    const mediaState = peerMediaStates.get(peerId) || {
      isAudioMuted: false,
      isVideoOff: false,
    };

    return (
      <div
        key={peerId}
        className={`w-48 h-36 bg-black rounded-lg overflow-hidden relative transition-opacity duration-200 `}
      >
        <video
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          ref={(el) => {
            if (el) {
              el.srcObject = stream;
              el.volume = 0;
              videoElements.current.set(peerId, el);
              updateProximityEffects();
            }
          }}
        />
        <div className="absolute bottom-2 right-2 flex gap-2">
          <div className="p-2 rounded-full bg-gray-800">
            {mediaState.isAudioMuted ? (
              <MicOff className="w-4 h-4 text-red-500" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="p-2 rounded-full bg-gray-800">
            {mediaState.isVideoOff ? (
              <VideoOff className="w-4 h-4 text-red-500" />
            ) : (
              <Video className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
        <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
          {username}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 w-full flex justify-center items-center gap-2">
      {isLoading && (
        <div className="bg-black bg-opacity-50 text-white p-2 rounded">
          Connecting to camera!
        </div>
      )}
      {error && (
        <div className="bg-red-500 text-white p-2 rounded">{error}</div>
      )}
      <div className="w-48 h-36 bg-black rounded-lg overflow-hidden relative">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={toggleAudio}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {isAudioMuted ? (
              <MicOff className="w-4 h-4 text-red-500" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={toggleVideo}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {isVideoOff ? (
              <VideoOff className="w-4 h-4 text-red-500" />
            ) : (
              <Video className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
          You
        </div>
      </div>
      {[...peers].map(([peerId, stream]) => renderPeerVideo(peerId, stream))}
    </div>
  );
};
