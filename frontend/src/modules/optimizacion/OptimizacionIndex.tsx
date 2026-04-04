import { useState } from "react";
import {
  SeleccionVehiculoPage,
  RutaPendiente,
} from "./pages/SeleccionVehiculoPage";
import { AjusteClustersPage } from "./pages/AjusteClustersPage";
import { ResumenPublicacionPage } from "./pages/ResumenPublicacionPage";
import { ClusterResponse } from "./types/optimizacion.types";
import { Stepper } from "./components/Stepper";

export const OptimizacionIndex = () => {
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);
  const [rutaSeleccionada, setRutaSeleccionada] =
    useState<RutaPendiente | null>(null);
  const [clusters, setClusters] = useState<ClusterResponse[]>([]);

  const handleClustersGenerados = (
    clustersSugeridos: ClusterResponse[],
    ruta: RutaPendiente,
  ) => {
    setClusters(clustersSugeridos);
    setRutaSeleccionada(ruta);
    setPasoActual(2);
  };

  const handleContinuarPaso2 = (clustersAjustados: ClusterResponse[]) => {
    setClusters(clustersAjustados);
    setPasoActual(3);
  };

  const handleFinalizado = () => {
    setRutaSeleccionada(null);
    setClusters([]);
    setPasoActual(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header Fijo con Progreso */}
      <Stepper pasoActual={pasoActual} />

      <main className="flex-1 animate-in fade-in duration-500">
        {pasoActual === 1 && (
          <SeleccionVehiculoPage
            onClustersGenerados={handleClustersGenerados}
          />
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
      </main>
    </div>
  );
};
