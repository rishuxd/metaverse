import { useState } from "react";
import { ArrowLeft, PlusCircle } from "lucide-react";
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
        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-lg shadow-teal-500/20 hover:scale-105 transition-all">
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Create</span>
        </button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-2 border-white/50 dark:border-white/10 rounded-[2rem] p-8 max-w-xl">
        {!selectedMap ? (
          <>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <span className="material-symbols-outlined text-white text-2xl">
                  map
                </span>
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Choose a Map
                </DialogTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Select a map template for your new space
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-6 max-h-[400px] overflow-y-auto hide-scrollbar">
              {maps.map((map) => (
                <div
                  key={map.id}
                  className="flex backdrop-blur-md bg-white/50 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 rounded-[1.5rem] shadow-md cursor-pointer hover:shadow-xl hover:border-teal-500/50 dark:hover:border-teal-500/30 transition-all overflow-hidden hover:-translate-y-1"
                  onClick={() => setSelectedMap(map.id)}
                >
                  <div className="bg-black h-28 w-2/5 relative overflow-hidden">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}${map.imageUrl}`}
                      alt="Map Image"
                      width={map.width * 16}
                      height={map.height * 16}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="w-3/5 flex flex-col justify-center px-6 py-4">
                    <h2 className="font-bold text-slate-900 dark:text-white mb-1">
                      {map.name}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {map.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <span className="material-symbols-outlined text-white text-2xl">
                    edit
                  </span>
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Name Your Space
                  </DialogTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Give your space a unique name
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMap(null)}
                className="w-12 h-12 rounded-2xl backdrop-blur-md bg-white/50 dark:bg-black/40 border-2 border-white/50 dark:border-white/10 hover:bg-white/70 dark:hover:bg-black/60 transition-all flex items-center justify-center"
              >
                <ArrowLeft
                  size={20}
                  className="text-slate-700 dark:text-white"
                />
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-6">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  badge
                </span>
                <input
                  type="text"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 focus:border-teal-500 focus:ring-0 transition-all outline-none"
                  placeholder="Enter space name"
                  value={spaceName}
                  onChange={(e) => setSpaceName(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              {successMessage && (
                <Alert variant="success">{successMessage}</Alert>
              )}
              {error && <Alert variant="error">{error}</Alert>}
              <button
                disabled={spaceName === "" || isCreating}
                onClick={handleCreate}
                className="w-full font-bold py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-500/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Space</span>
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
