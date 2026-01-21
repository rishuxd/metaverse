import { useState } from "react";
import {
  ArrowLeft,
  PlusCircle,
  Map as MapIcon,
  Pencil,
  ArrowRight,
  Check,
} from "lucide-react";
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
        <button className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-105 transition-all">
          <PlusCircle size={18} />
          <span className="hidden sm:inline">Create</span>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200/60 dark:border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30 max-w-xl">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative p-8">
          {!selectedMap ? (
            <>
              {/* Header - Map Selection */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/20 -rotate-3">
                  <MapIcon className="text-white w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Choose a Map
                  </DialogTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select a map template for your new space
                  </p>
                </div>
              </div>

              {/* Map List */}
              <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto hide-scrollbar px-2 py-3 -mx-2">
                {maps.map((map) => (
                  <div
                    key={map.id}
                    className="border-teal-400 dark:border-teal-500 group flex bg-slate-200 dark:bg-slate-900 rounded-2xl cursor-pointer hover:bg-teal-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200"
                    onClick={() => setSelectedMap(map.id)}
                  >
                    <div className="h-36 w-2/5 relative overflow-hidden bg-green-100 dark:bg-slate-800 rounded-l-2xl">
                      <img
                        src={`${process.env.NEXT_PUBLIC_BASE_URL}${map.imageUrl}`}
                        alt="Map Image"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-5 py-3">
                      <h2 className="font-bold text-slate-900 dark:text-white mb-1">
                        {map.name}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {map.description}
                      </p>
                    </div>
                    <div className="flex items-center pr-4">
                      <ArrowRight
                        size={18}
                        className="text-slate-500 dark:text-slate-600 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Header - Name Space */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 rotate-3">
                    <Pencil className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                      Name Your Space
                    </DialogTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Give your space a unique name
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMap(null)}
                  className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/5 border-2 border-white/80 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all flex items-center justify-center group"
                >
                  <ArrowLeft
                    size={20}
                    className="text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-white transition-colors"
                  />
                </button>
              </div>

              {/* Name Input */}
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <Pencil size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-white/80 dark:border-white/10 bg-white/60 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-teal-400 dark:focus:border-teal-500/50 focus:bg-white/80 dark:focus:bg-white/10 focus:ring-0 transition-all outline-none"
                    placeholder="Enter space name"
                    value={spaceName}
                    onChange={(e) => setSpaceName(e.target.value)}
                    disabled={isCreating}
                  />
                </div>

                {/* Messages */}
                {successMessage && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} />
                    {successMessage}
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <span className="text-lg">!</span>
                    {error}
                  </div>
                )}

                {/* Create Button */}
                <button
                  disabled={spaceName === "" || isCreating}
                  onClick={handleCreate}
                  className="w-full font-bold py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Space</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
