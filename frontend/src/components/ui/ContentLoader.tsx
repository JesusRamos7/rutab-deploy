// src/components/ui/ContentLoader.tsx

export const ContentLoader = () => {
  return (
    <div className="relative h-full w-full min-h-[400px] flex flex-col items-center justify-center p-4">
      {/* 1. Barra de progreso superior fija justo debajo del Header si tienes */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 overflow-hidden bg-slate-100">
        <div className="h-full bg-blue-600 animate-progress-infinity w-full origin-left"></div>
      </div>

      {/* 2. Un Skeleton muy genérico simulando texto para dar feedback visual */}
      <div className="w-full max-w-4xl space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-md w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};
