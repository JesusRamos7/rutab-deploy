// /frontend/src/modules/optimizacion/OptimizacionIndex.tsx

import { useState } from "react";
import {
  SeleccionVehiculoPage,
  RutaPendiente,
} from "./pages/SeleccionVehiculoPage";
import { AjusteClustersPage } from "./pages/AjusteClustersPage";
import { ResumenPublicacionPage } from "./pages/ResumenPublicacionPage";
import { ClusterResponse } from "./types/optimizacion.types";

export const OptimizacionIndex = () => {
  // Manejo de los 3 pasos: 1 (Selección) -> 2 (Ajuste UI) -> 3 (Cálculo y Publicación)
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);

  // Estado global del flujo
  const [rutaSeleccionada, setRutaSeleccionada] =
    useState<RutaPendiente | null>(null);
  const [clusters, setClusters] = useState<ClusterResponse[]>([]);

  // Transición 1 -> 2
  const handleClustersGenerados = (
    clustersSugeridos: ClusterResponse[],
    ruta: RutaPendiente,
  ) => {
    setClusters(clustersSugeridos);
    setRutaSeleccionada(ruta);
    setPasoActual(2);
  };

  // Transición 2 -> 3
  const handleContinuarPaso2 = (clustersAjustados: ClusterResponse[]) => {
    setClusters(clustersAjustados);
    setPasoActual(3);
  };

  // Resetear flujo completo
  const handleFinalizado = () => {
    setRutaSeleccionada(null);
    setClusters([]);
    setPasoActual(1);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50">
      {pasoActual === 1 && (
        <SeleccionVehiculoPage onClustersGenerados={handleClustersGenerados} />
      )}

      {pasoActual === 2 && rutaSeleccionada && (
        <AjusteClustersPage
          clustersIniciales={clusters}
          onContinuarPaso2={handleContinuarPaso2}
        />
      )}

      {pasoActual === 3 && rutaSeleccionada && (
        <ResumenPublicacionPage
          rutaSeleccionada={rutaSeleccionada}
          clustersAjustados={clusters}
          onVolver={() => setPasoActual(2)}
          onFinalizado={handleFinalizado}
        />
      )}
    </div>
  );
};
