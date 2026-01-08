import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Map } from "@/types";
import { Alert } from "@/components/ui/alert";

interface CreateSpaceDialogProps {
  maps: Map[];
  onCreateSpace: (name: string, mapId: string) => Promise<boolean>;
  isCreating: boolean;
  error: string | null;
  successMessage: string | null;
  resetMessages: () => void;
}

export const CreateSpaceDialog: React.FC<CreateSpaceDialogProps> = ({
  maps,
  onCreateSpace,
  isCreating,
  error,
  successMessage,
  resetMessages,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMap, setSelectedMap] = useState<string | null>(null);
  const [spaceName, setSpaceName] = useState<string>("");

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSpaceName("");
      setSelectedMap(null);
      resetMessages();
    }
  };

  const handleCreate = async () => {
    if (!selectedMap || !spaceName) return;

    const success = await onCreateSpace(spaceName, selectedMap);
    if (success) {
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="rounded-lg flex gap-2 py-2 px-4 bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all">
          Create Space
        </button>
      </DialogTrigger>
      <DialogContent className="p-7">
        {!selectedMap ? (
          <>
            <DialogTitle className="text-xl font-bold">Choose a Map</DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              Select a map template for your new space
            </p>
            <div className="flex flex-col gap-4 mt-6">
              {maps.map((map) => (
                <div
                  key={map.id}
                  className="flex bg-gray-100 rounded-2xl shadow-md cursor-pointer hover:shadow-2xl transition-all overflow-hidden hover:bg-gray-200 hover:-translate-y-1"
                  onClick={() => setSelectedMap(map.id)}
                >
                  <div className="bg-black h-32 w-2/5">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}${map.imageUrl}`}
                      alt="Map Image"
                      width={map.width * 16}
                      height={map.height * 16}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="w-3/5 flex flex-col justify-center px-8">
                    <h2 className="font-semibold mb-1">{map.name}</h2>
                    <p className="text-sm">{map.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">Name Your Space</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Give your space a unique name
                </p>
              </div>
              <button
                onClick={() => setSelectedMap(null)}
                className="rounded-xl bg-gray-100 p-2 hover:bg-gray-200 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-6">
              <input
                type="text"
                className="rounded-xl p-3 text-gray-900 border-gray-300 border-2 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all"
                placeholder="Enter space name"
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                disabled={isCreating}
              />
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              {error && <Alert variant="error">{error}</Alert>}
              <button
                disabled={spaceName === "" || isCreating}
                onClick={handleCreate}
                className="bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Space"}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
