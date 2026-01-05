"use client";

import { Mic, MicOff, Video as VideoIcon, VideoOff, Check, Loader2, ArrowRight } from "lucide-react";
import { Avatar } from "@/types";

interface ActiveUser {
  userId: string;
  username: string;
  avatarUrl: string;
}

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
  activeUsers: ActiveUser[];
  userCount: number;
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
  activeUsers,
  userCount,
  onToggleAudio,
  onToggleVideo,
  onSelectAvatar,
  onSaveAvatar,
  onJoin,
  canJoin,
}: SpaceLobbyOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="max-w-4xl w-full bg-white/95 backdrop-blur rounded-3xl shadow-xl border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100">
          {space ? (
            <>
              <h1 className="text-3xl font-light text-gray-900 mb-2">{space.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                <span>by {space.creator?.username || "Unknown"}</span>
                {space.map && (
                  <>
                    <span>·</span>
                    <span>{space.map.name}</span>
                    <span>·</span>
                    <span>{space.map.description}</span>
                  </>
                )}
              </div>
              {space.map?.description && (
                <p className="text-sm text-gray-600"></p>
              )}
            </>
          ) : (
            <>
              <div className="w-full h-9 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
              <div className="w-full h-5 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="w-3/4 h-5 bg-gray-200 rounded animate-pulse"></div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Main Content - Card Grid */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Camera Card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h3 className="text-xs font-medium text-gray-700 mb-3">Camera</h3>
              <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video relative mb-3">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <VideoOff size={24} className="text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onToggleAudio}
                  className={`flex-1 p-2.5 rounded-lg transition-all ${
                    isAudioEnabled
                      ? 'bg-white hover:bg-gray-100 text-gray-700'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                  title={isAudioEnabled ? 'Mute' : 'Unmute'}
                >
                  {isAudioEnabled ? <Mic size={14} className="mx-auto" /> : <MicOff size={14} className="mx-auto" />}
                </button>
                <button
                  onClick={onToggleVideo}
                  className={`flex-1 p-2.5 rounded-lg transition-all ${
                    isVideoEnabled
                      ? 'bg-white hover:bg-gray-100 text-gray-700'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                  title={isVideoEnabled ? 'Turn off' : 'Turn on'}
                >
                  {isVideoEnabled ? <VideoIcon size={14} className="mx-auto" /> : <VideoOff size={14} className="mx-auto" />}
                </button>
              </div>
            </div>

            {/* Loading Progress Card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-medium text-gray-700">Status</h3>
                <span className="text-xs font-medium text-gray-900">{loadingProgress}%</span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 mb-3 overflow-hidden">
                <div
                  className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="space-y-1.5">
                {Object.entries(loadingSteps).map(([key, step]: [string, any]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    {step.status === 'loading' && <Loader2 size={12} className="animate-spin text-gray-400" />}
                    {step.status === 'success' && <Check size={12} className="text-green-600" />}
                    {step.status === 'error' && <span className="text-red-500 text-xs">✗</span>}
                    {step.status === 'idle' && <div className="w-3 h-3" />}
                    <span className={step.status === 'success' ? 'text-green-600' : step.status === 'error' ? 'text-red-500' : 'text-gray-600'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Users Card */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h3 className="text-xs font-medium text-gray-700 mb-3">
                People in space {userCount} online
              </h3>
              {userCount > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeUsers.slice(0, 4).map((user) => (
                    <div key={user.userId} className="flex items-center gap-2 bg-white rounded-full px-2.5 py-1.5">
                      <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {user.avatarUrl && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_URL}${user.avatarUrl})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{user.username}</span>
                    </div>
                  ))}
                  {userCount > 4 && (
                    <div className="flex items-center bg-white rounded-full px-2.5 py-1.5">
                      <span className="text-xs font-medium text-gray-500">+{userCount - 4}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  <span>No one here yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Avatar Selection Card (if needed) */}
          {!hasAvatar && avatars.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h3 className="text-xs font-medium text-gray-700 mb-3">Choose Your Avatar</h3>
              <div className="grid grid-cols-6 gap-2 mb-3">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`relative p-1 rounded-lg cursor-pointer transition-all ${
                      selectedAvatar === avatar.id
                        ? 'bg-gray-900 border-2 border-gray-900'
                        : 'bg-white hover:bg-gray-100 border-2 border-transparent'
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
                    {selectedAvatar === avatar.id && (
                      <div className="absolute top-0.5 right-0.5 bg-white rounded-full p-0.5">
                        <Check size={10} className="text-gray-900" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={onSaveAvatar}
                disabled={!selectedAvatar}
                className="w-full bg-gray-900 text-white rounded-xl py-2 text-xs font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Avatar
              </button>
            </div>
          )}
        </div>

        {/* Centered Circular Join Button */}
        <div className="flex justify-center pb-8">
          <button
            onClick={onJoin}
            disabled={!canJoin}
            className="w-14 h-14 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
            title={canJoin ? 'Join Space' : 'Please wait...'}
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
