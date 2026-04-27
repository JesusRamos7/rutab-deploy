// src/modules/monitoring/components/ActivityFeed.tsx
import { VehicleCard } from './VehicleCard';

export const ActivityFeed = ({ vehicles }: { vehicles: any[] }) => {
  return (
    <div className="w-96 bg-white border-l border-gray-200 h-full overflow-y-auto p-4">
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Vehículos Activos</h2>
      </div>
      
      {/* Mapeo de los vehículos que vienen del Socket */}
      {vehicles.length > 0 ? (
        vehicles.map((v) => (
          <VehicleCard key={v.rutaId} {...v} />
        ))
      ) : (
        <p className="text-gray-400 text-center mt-10">No hay unidades en ruta</p>
      )}
    </div>
  );
};