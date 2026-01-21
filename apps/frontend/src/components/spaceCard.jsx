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
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="backdrop-blur-md bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-2xl overflow-hidden"
      >
        <Skeleton className="aspect-video w-full" />
        <div className="p-4 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
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
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/20">
          <Grid3X3 className="text-white" size={16} />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      {spaces?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((space) => (
            <div
              key={space?.id}
              className="backdrop-blur-md bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-300/50 dark:hover:border-indigo-500/30 group"
              onClick={() => router.push(`/space/${space?.id}`)}
            >
              <div className="relative aspect-video bg-green-100 overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}${space?.map?.imageUrl}`}
                  alt={space?.name}
                  width={space?.map?.width * 16}
                  height={space?.map?.height * 16}
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {space?.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(space?.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopyLink(space?.id, e)}
                      className="p-1.5 rounded-lg bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/10 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all text-teal-600 dark:text-teal-400"
                      title="Copy invite link"
                    >
                      {copiedId === space?.id ? (
                        <Check size={13} />
                      ) : (
                        <Share2 size={13} />
                      )}
                    </button>
                    <button
                      onClick={(e) => openDeleteDialog(space, e)}
                      disabled={deletingId === space?.id}
                      className="p-1.5 rounded-lg bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-red-500 dark:text-red-400 disabled:opacity-50"
                      title="Delete space"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="backdrop-blur-md bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🏠</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{msg}</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-white/50 dark:border-white/10 rounded-2xl p-6">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Delete Space
          </DialogTitle>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {spaceToDelete?.name}
            </span>
            ? This cannot be undone.
          </p>
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSpace}
              disabled={deletingId === spaceToDelete?.id}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {deletingId === spaceToDelete?.id ? "Deleting..." : "Delete"}
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
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-500/20">
          <Clock className="text-white" size={16} />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      {spaces?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((space) => (
            <div
              key={space?.id}
              className="backdrop-blur-md bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-300/50 dark:hover:border-blue-500/30 group"
              onClick={() => router.push(`/space/${space?.space?.id}`)}
            >
              <div className="relative aspect-video bg-slate-900 overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}${space?.space?.map?.imageUrl}`}
                  alt={space?.space?.name}
                  width={space?.space?.map?.width * 16}
                  height={space?.space?.map?.height * 16}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {space?.space?.name}
                </h3>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      by {space?.space?.creator?.username || "Unknown"}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock size={9} />
                      {new Date(space?.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopyLink(space?.space?.id, e)}
                      className="p-1.5 rounded-lg bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/10 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all text-teal-600 dark:text-teal-400"
                      title="Copy invite link"
                    >
                      {copiedId === space?.space?.id ? (
                        <Check size={13} />
                      ) : (
                        <Share2 size={13} />
                      )}
                    </button>
                    <button
                      onClick={(e) => openLeaveDialog(space, e)}
                      disabled={leavingId === space?.space?.id}
                      className="p-1.5 rounded-lg bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-red-500 dark:text-red-400 disabled:opacity-50"
                      title="Leave space"
                    >
                      <LeaveIcon size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="backdrop-blur-md bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/10 rounded-2xl p-10 text-center">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🚀</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{msg}</p>
        </div>
      )}

      {/* Leave Confirmation Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-white/50 dark:border-white/10 rounded-2xl p-6">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Leave Space
          </DialogTitle>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Are you sure you want to leave{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {spaceToLeave?.space?.name}
            </span>
            ?
          </p>
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setLeaveDialogOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleLeaveSpace}
              disabled={leavingId === spaceToLeave?.space?.id}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {leavingId === spaceToLeave?.space?.id ? "Leaving..." : "Leave"}
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
    <div className="space-y-8">
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
