import { Loader2 } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm z-50">
      <div className="relative flex items-center justify-center">
        {/* Anillo exterior decorativo */}
        <div className="absolute h-16 w-16 rounded-full border-4 border-slate-200"></div>
        {/* Spinner real */}
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 relative z-10" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-600 animate-pulse">
        Preparando panel...
      </p>
    </div>
  );
};
