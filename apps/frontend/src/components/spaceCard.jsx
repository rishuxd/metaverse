import React, { useState } from "react";
import { Trash2, Share2, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";

const SpacesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex flex-col space-y-3">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2 items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
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
        // Close dialog
        setDeleteDialogOpen(false);
        setSpaceToDelete(null);

        // Call the callback to refresh spaces
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
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {spaces?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {spaces.map((space) => (
            <div key={space?.id} className="flex flex-col">
              <div
                className="relative aspect-video bg-black rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => router.push(`/space/${space?.id}`)}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}${space?.map?.imageUrl}`}
                  alt={space?.name}
                  width={space?.map?.width * 16}
                  height={space?.map?.height * 16}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex justify-between items-center mt-3 px-1">
                <h3 className="font-semibold text-sm truncate max-w-[70%]">
                  {space?.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs">
                    {new Date(space?.createdAt).toDateString()}
                  </span>
                  <button
                    onClick={(e) => handleCopyLink(space?.id, e)}
                    className="p-1 hover:bg-teal-100 rounded-full transition-colors text-teal-600 hover:text-teal-700"
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
                    className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-600 hover:text-red-700 disabled:opacity-50"
                    title="Delete space"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 bg-fifth rounded-xl">
          <p className="text-gray-400">{msg}</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="p-7">
          <DialogTitle className="text-xl font-bold">Delete Space</DialogTitle>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{spaceToDelete?.name}</span>? This
              action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 bg-gray-200 text-gray-800 rounded-xl py-3 font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSpace}
              disabled={deletingId === spaceToDelete?.id}
              className="flex-1 bg-red-600 text-white rounded-xl py-3 font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        // Close dialog
        setLeaveDialogOpen(false);
        setSpaceToLeave(null);

        // Call the callback to refresh recent spaces
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
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {spaces?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {spaces.map((space) => (
            <div key={space?.id} className="flex flex-col">
              <div
                className="relative aspect-video bg-black rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => router.push(`/space/${space?.space?.id}`)}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL}${space?.space?.map?.imageUrl}`}
                  alt={space?.space?.name}
                  width={space?.space?.map?.width * 16}
                  height={space?.space?.map?.height * 16}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-3 px-1 space-y-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-sm truncate max-w-[60%]">
                    {space?.space?.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleCopyLink(space?.space?.id, e)}
                      className="p-1 hover:bg-teal-100 rounded-full transition-colors text-teal-600 hover:text-teal-700"
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
                      className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-600 hover:text-red-700 disabled:opacity-50"
                      title="Leave space"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>by {space?.space?.creator?.username || "Unknown"}</span>
                  <span>{new Date(space?.joinedAt).toDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 bg-fifth rounded-xl">
          <p className="text-gray-400">{msg}</p>
        </div>
      )}

      {/* Leave Confirmation Dialog */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="p-7">
          <DialogTitle className="text-xl font-bold">Leave Space</DialogTitle>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to leave{" "}
              <span className="font-semibold">{spaceToLeave?.space?.name}</span>
              ?
            </p>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setLeaveDialogOpen(false)}
              className="flex-1 bg-gray-200 text-gray-800 rounded-xl py-3 font-semibold hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleLeaveSpace}
              disabled={leavingId === spaceToLeave?.space?.id}
              className="flex-1 bg-red-600 text-white rounded-xl py-3 font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    <main className="flex flex-col min-h-screen bg-first p-6 md:p-10">
      <div className="max-w-7xl w-full mx-auto space-y-12">
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
    </main>
  );
}
