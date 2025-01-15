import React from "react";
import { EllipsisVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

const MySpace = ({ title, spaces, token, router, msg }) => (
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
