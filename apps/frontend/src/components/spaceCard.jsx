import React, { useState } from "react";
import {
  Trash2,
  Share2,
  Check,
  Clock,
  Grid3X3,
  LogOut as LeaveIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import axios from "axios";

const SpacesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 rounded-[2rem] overflow-hidden"
      >
        <Skeleton className="aspect-video w-full" />
        <div className="p-5 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    ))}
  </div>
);

const MySpace = ({ title, spaces, token, router, msg, onSpaceDeleted }) => {
  const [deletingId, setDeletingId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const openDeleteDialog = (space, e) => {
    e.stopPropagation();
    setSpaceToDelete(space);
    setDeleteDialogOpen(true);
  };

  const handleCopyLink = (spaceId, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/space/${spaceId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(spaceId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDeleteSpace = async () => {
    if (!spaceToDelete) return;

    setDeletingId(spaceToDelete.id);

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/space/${spaceToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setDeleteDialogOpen(false);
        setSpaceToDelete(null);
        onSpaceDeleted();
      }
    } catch (error) {
      console.error("Failed to delete space:", error);
      alert("Failed to delete space!");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
          <Grid3X3 className="text-teal-500" size={20} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      {spaces?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <div
              key={space?.id}
              className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/10 group"
              onClick={() => router.push(`/space/${space?.id}`)}
            >
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}${space?.map?.imageUrl}`}
                  alt={space?.name}
                  width={space?.map?.width * 16}
                  height={space?.map?.height * 16}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                  {space?.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(space?.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopyLink(space?.id, e)}
                      className="p-2 rounded-xl backdrop-blur-md bg-white/50 dark:bg-black/50 border border-white/50 dark:border-white/10 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all text-teal-600 dark:text-teal-400"
                      title="Copy invite link"
                    >
                      {copiedId === space?.id ? (
                        <Check size={14} />
                      ) : (
                        <Share2 size={14} />
                      )}
                    </button>
                    <button
                      onClick={(e) => openDeleteDialog(space, e)}
                      disabled={deletingId === space?.id}
                      className="p-2 rounded-xl backdrop-blur-md bg-white/50 dark:bg-black/50 border border-white/50 dark:border-white/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-red-600 dark:text-red-400 disabled:opacity-50"
                      title="Delete space"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🏠</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">{msg}</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-2 border-white/50 dark:border-white/10 rounded-[2rem] p-8">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Delete Space
          </DialogTitle>
          <div className="mt-4">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {spaceToDelete?.name}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 py-4 rounded-2xl backdrop-blur-md bg-white/50 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 text-slate-700 dark:text-white font-semibold hover:bg-white/70 dark:hover:bg-black/60 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSpace}
              disabled={deletingId === spaceToDelete?.id}
              className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === spaceToDelete?.id
                ? "Deleting..."
                : "Delete Space"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

const RecentSpace = ({ title, spaces, token, router, msg, onSpaceLeft }) => {
  const [leavingId, setLeavingId] = useState(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [spaceToLeave, setSpaceToLeave] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const openLeaveDialog = (space, e) => {
    e.stopPropagation();
    setSpaceToLeave(space);
    setLeaveDialogOpen(true);
  };

  const handleCopyLink = (spaceId, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/space/${spaceId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedId(spaceId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleLeaveSpace = async () => {
    if (!spaceToLeave) return;

    setLeavingId(spaceToLeave.space.id);

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/space/recent/${spaceToLeave.space.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        setLeaveDialogOpen(false);
        setSpaceToLeave(null);
        onSpaceLeft();
      }
    } catch (error) {
      console.error("Failed to leave space:", error);
      alert("Failed to leave space!");
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
          <Clock className="text-blue-500" size={20} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      {spaces?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space) => (
            <div
              key={space?.id}
              className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 group"
              onClick={() => router.push(`/space/${space?.space?.id}`)}
            >
              <div className="relative aspect-video bg-black overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}${space?.space?.map?.imageUrl}`}
                  alt={space?.space?.name}
                  width={space?.space?.map?.width * 16}
                  height={space?.space?.map?.height * 16}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5 space-y-3">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                  {space?.space?.name}
                </h3>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      by {space?.space?.creator?.username || "Unknown"}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(space?.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopyLink(space?.space?.id, e)}
                      className="p-2 rounded-xl backdrop-blur-md bg-white/50 dark:bg-black/50 border border-white/50 dark:border-white/10 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all text-teal-600 dark:text-teal-400"
                      title="Copy invite link"
                    >
                      {copiedId === space?.space?.id ? (
                        <Check size={14} />
                      ) : (
                        <Share2 size={14} />
                      )}
                    </button>
                    <button
                      onClick={(e) => openLeaveDialog(space, e)}
                      disabled={leavingId === space?.space?.id}
                      className="p-2 rounded-xl backdrop-blur-md bg-white/50 dark:bg-black/50 border border-white/50 dark:border-white/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-red-600 dark:text-red-400 disabled:opacity-50"
                      title="Leave space"
                    >
                      <LeaveIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="backdrop-blur-xl bg-white/40 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 rounded-[2rem] p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">{msg}</p>
        </div>
      )}

      {/* Leave Confirmation Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-2 border-white/50 dark:border-white/10 rounded-[2rem] p-8">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Leave Space
          </DialogTitle>
          <div className="mt-4">
            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to leave{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {spaceToLeave?.space?.name}
              </span>
              ?
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setLeaveDialogOpen(false)}
              className="flex-1 py-4 rounded-2xl backdrop-blur-md bg-white/50 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 text-slate-700 dark:text-white font-semibold hover:bg-white/70 dark:hover:bg-black/60 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleLeaveSpace}
              disabled={leavingId === spaceToLeave?.space?.id}
              className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {leavingId === spaceToLeave?.space?.id
                ? "Leaving..."
                : "Leave Space"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default function SpacesLayout({
  spaces,
  recentSpaces,
  token,
  router,
  isLoading,
  onSpaceDeleted,
  onSpaceLeft,
}) {
  return (
    <div className="space-y-10">
      {isLoading ? (
        <SpacesSkeleton />
      ) : (
        <>
          <RecentSpace
            title="Recent Spaces"
            spaces={recentSpaces}
            token={token}
            router={router}
            msg="No recent joined spaces found!"
            onSpaceLeft={onSpaceLeft}
          />
          <MySpace
            title="My Spaces"
            spaces={spaces}
            token={token}
            router={router}
            msg="You have no spaces yet. Create one!"
            onSpaceDeleted={onSpaceDeleted}
          />
        </>
      )}
    </div>
  );
}
