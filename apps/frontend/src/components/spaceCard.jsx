import React, { useState } from "react";
import { Trash2 } from "lucide-react";
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

  const openDeleteDialog = (space, e) => {
    e.stopPropagation();
    setSpaceToDelete(space);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSpace = async () => {
    if (!spaceToDelete) return;

    setDeletingId(spaceToDelete.id);

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/space/${spaceToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {spaces?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {spaces.map((space) => (
            <div key={space?.id} className="flex flex-col">
              <div
                className="relative aspect-video bg-black rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() =>
                  router.push(`/space?spaceId=${space?.id}&token=${token}`)
                }
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
          <DialogTitle>Delete Space</DialogTitle>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{spaceToDelete?.name}</span>? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 bg-gray-200 text-gray-800 rounded-xl py-2 hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSpace}
              disabled={deletingId === spaceToDelete?.id}
              className="flex-1 bg-red-600 text-white rounded-xl py-2 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingId === spaceToDelete?.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

const RecentSpace = ({ title, spaces, token, router, msg }) => (
  <section className="space-y-4">
    <h2 className="text-xl font-semibold">{title}</h2>
    {spaces?.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {spaces.map((space) => (
          <div key={space?.id} className="flex flex-col">
            <div
              className="relative aspect-video bg-black rounded-lg shadow-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() =>
                router.push(`/space?spaceId=${space?.space?.id}&token=${token}`)
              }
            >
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${space?.space?.map?.imageUrl}`}
                alt={space?.space?.name}
                width={space?.space?.map?.width * 16}
                height={space?.space?.map?.height * 16}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex justify-between items-center mt-3 px-1">
              <h3 className="font-semibold text-sm truncate max-w-[70%]">
                {space?.space?.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs">
                  {new Date(space?.joinedAt).toDateString()}
                </span>
                <button className="p-1 hover:bg-fourth rounded-full transition-colors">
                  <EllipsisVertical size={16} />
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
  </section>
);

export default function SpacesLayout({
  spaces,
  recentSpaces,
  token,
  router,
  isLoading,
  onSpaceDeleted,
}) {
  return (
    <main className="flex flex-col min-h-screen bg-first p-6 md:p-10">
      <div className="max-w-7xl w-full mx-auto space-y-12">
        {isLoading ? (
          <SpacesSkeleton />
        ) : (
          <>
            <MySpace
              title="My Spaces"
              spaces={spaces}
              token={token}
              router={router}
              msg="You have no spaces yet. Create one!"
              onSpaceDeleted={onSpaceDeleted}
            />
            <RecentSpace
              title="Recent Spaces"
              spaces={recentSpaces}
              token={token}
              router={router}
              msg="No recent joined spaces found!"
            />
          </>
        )}
      </div>
    </main>
  );
}
