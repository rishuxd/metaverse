"use client";

import { Mic, MicOff, Video as VideoIcon, VideoOff, Check, Loader2 } from "lucide-react";
import { Avatar } from "@/types";

interface SpaceLobbyOverlayProps {
  space: any;
  avatars: Avatar[];
  selectedAvatar: string | null;
  hasAvatar: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  error: string | null;
  loadingProgress: number;
  loadingSteps: any;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onSelectAvatar: (id: string) => void;
  onSaveAvatar: () => void;
  onJoin: () => void;
  canJoin: boolean;
}

export default function SpaceLobbyOverlay({
  space,
  avatars,
  selectedAvatar,
  hasAvatar,
  isAudioEnabled,
  isVideoEnabled,
  error,
  loadingProgress,
  loadingSteps,
  localVideoRef,
  onToggleAudio,
  onToggleVideo,
  onSelectAvatar,
  onSaveAvatar,
  onJoin,
  canJoin,
}: SpaceLobbyOverlayProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-teal-50 to-green-100 flex items-center justify-center p-4 z-50">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Join Space</h1>
          {space && (
            <p className="text-sm text-gray-600">
              {space.name} · by {space.creator?.username || "Unknown"}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Horizontal Layout */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Side - Video Preview */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Camera Preview</h2>
              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <VideoOff size={40} className="text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Media Controls */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={onToggleAudio}
                className={`p-4 rounded-full transition-all ${
                  isAudioEnabled
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                onClick={onToggleVideo}
                className={`p-4 rounded-full transition-all ${
                  isVideoEnabled
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoEnabled ? <VideoIcon size={20} /> : <VideoOff size={20} />}
              </button>
            </div>

            {/* Join Button */}
            <button
              onClick={onJoin}
              disabled={!canJoin}
              className="w-full bg-teal-600 text-white rounded-lg py-3 text-base font-bold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canJoin ? 'Join Space →' : 'Please wait...'}
            </button>
          </div>

          {/* Right Side - Avatar Selection & Loading */}
          <div className="space-y-4">
            {/* Loading Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Loading...</span>
                <span className="text-sm font-medium text-teal-600">{loadingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="mt-3 space-y-1.5">
                {Object.entries(loadingSteps).map(([key, step]: [string, any]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    {step.status === 'loading' && <Loader2 size={14} className="animate-spin text-gray-400" />}
                    {step.status === 'success' && <Check size={14} className="text-green-500" />}
                    {step.status === 'error' && <span className="text-red-500 text-xs">✗</span>}
                    <span className={step.status === 'success' ? 'text-green-600' : step.status === 'error' ? 'text-red-500' : 'text-gray-500'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avatar Selection (if needed) */}
            {!hasAvatar && avatars.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Choose Your Avatar</h2>
                <div className="grid grid-cols-3 gap-2">
                  {avatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className={`relative p-1.5 rounded-lg cursor-pointer transition-all ${
                        selectedAvatar === avatar.id
                          ? 'bg-teal-100 border-2 border-teal-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => onSelectAvatar(avatar.id)}
                    >
                      <div className="aspect-square bg-white rounded-md overflow-hidden">
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}${avatar.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      </div>
                      <p className="text-xs text-center mt-1 font-medium truncate">{avatar.name}</p>
                      {selectedAvatar === avatar.id && (
                        <div className="absolute top-0.5 right-0.5 bg-teal-600 rounded-full p-0.5">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={onSaveAvatar}
                  disabled={!selectedAvatar}
                  className="mt-3 w-full bg-teal-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Avatar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
