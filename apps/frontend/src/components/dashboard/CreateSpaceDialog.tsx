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
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium shadow-lg shadow-teal-500/20 transition-all">
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Create</span>
        </button>
      </DialogTrigger>
      <DialogContent className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-white/50 dark:border-white/10 rounded-2xl p-6 max-w-lg">
        {!selectedMap ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <span className="material-symbols-outlined text-white text-xl">
                  map
                </span>
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  Choose a Map
                </DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select a template for your space
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-5 max-h-[350px] overflow-y-auto hide-scrollbar">
              {maps.map((map) => (
                <div
                  key={map.id}
                  className="flex bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl cursor-pointer hover:border-teal-500/50 dark:hover:border-teal-500/30 hover:shadow-md transition-all overflow-hidden"
                  onClick={() => setSelectedMap(map.id)}
                >
                  <div className="bg-black h-24 w-2/5 relative overflow-hidden">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}${map.imageUrl}`}
                      alt="Map Image"
                      width={map.width * 16}
                      height={map.height * 16}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="w-3/5 flex flex-col justify-center px-4 py-3">
                    <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {map.name}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <span className="material-symbols-outlined text-white text-xl">
                    edit
                  </span>
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Name Your Space
                  </DialogTitle>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Give it a unique name
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMap(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all flex items-center justify-center"
              >
                <ArrowLeft
                  size={18}
                  className="text-slate-600 dark:text-white"
                />
              </button>
            </div>
            <div className="flex flex-col gap-3 mt-5">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                  badge
                </span>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/40 text-slate-900 dark:text-white placeholder-slate-400 focus:border-teal-500 focus:ring-0 transition-all outline-none text-sm"
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
                className="w-full font-semibold py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
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
