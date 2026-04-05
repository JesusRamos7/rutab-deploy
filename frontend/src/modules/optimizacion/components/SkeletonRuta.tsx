// /frontend/src/modules/optimizacion/components/SkeletonRuta.tsx

/**
 * Componente de carga (Placeholder).
 * Proporciona una estructura visual animada mientras se sincronizan los datos de las rutas,
 * mejorando la percepción de velocidad y evitando saltos bruscos en la interfaz.
 */
export const SkeletonRuta = () => {
  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-5 mb-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Espacio reservado para el icono del vehículo */}
          <div className="w-12 h-12 bg-gray-100 rounded-xl" />

          <div className="space-y-2">
            {/* Marcadores para placas y modelo */}
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-50 rounded" />
          </div>
        </div>

        {/* Marcadores para botones de acción y métricas laterales */}
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-100 rounded-xl" />
          <div className="h-10 w-10 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
