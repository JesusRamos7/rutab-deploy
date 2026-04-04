// /frontend/src/modules/optimizacion/components/SkeletonRuta.tsx

export const SkeletonRuta = () => {
  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-5 mb-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-50 rounded" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-100 rounded-xl" />
          <div className="h-10 w-10 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
