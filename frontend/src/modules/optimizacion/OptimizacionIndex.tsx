// /frontend/src/modules/optimizacion/OptimizacionIndex.tsx

import { useState } from "react";
import { toast } from "sonner";
import {
  SeleccionVehiculoPage,
  RutaPendiente,
} from "./pages/SeleccionVehiculoPage";
import { AjusteClustersPage } from "./pages/AjusteClustersPage";
import { ResumenPublicacionPage } from "./pages/ResumenPublicacionPage";
import { ClusterResponse } from "./types/optimizacion.types";
import { Stepper } from "./components/Stepper";
import { optimizacionService } from "./services/optimizacionService";

export const OptimizacionIndex = () => {
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);
  const [rutaSeleccionada, setRutaSeleccionada] =
    useState<RutaPendiente | null>(null);
  const [clusters, setClusters] = useState<ClusterResponse[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleClustersGenerados = (
    clustersSugeridos: ClusterResponse[],
    ruta: RutaPendiente,
  ) => {
    setClusters(clustersSugeridos);
    setRutaSeleccionada(ruta);
    setPasoActual(2);
  };

  const handleRegenerarClusters = async () => {
    if (!rutaSeleccionada) return;

    try {
      setIsRegenerating(true);
      const clustersSugeridos = await optimizacionService.sugerirClusters({
        vehiculoId: rutaSeleccionada.vehiculoId,
        fechaProgramada: rutaSeleccionada.fechaProgramada,
      });

      if (clustersSugeridos.length === 0) {
        toast.warning("No se encontraron pedidos para regenerar los grupos.");
        return;
      }

      setClusters(clustersSugeridos);
      toast.success("Sugerencia de grupos actualizada.");
    } catch (error) {
      toast.error("Error al intentar recalcular los grupos.");
    } finally {
      setIsRegenerating(false);
    }
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Stepper pasoActual={pasoActual} />
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-top-1 duration-500 ease-out">
        {pasoActual === 1 && (
          <SeleccionVehiculoPage
            onClustersGenerados={handleClustersGenerados}
          />
        )}

        {pasoActual === 2 && rutaSeleccionada && (
          <AjusteClustersPage
            clustersIniciales={clusters}
            onContinuarPaso2={handleContinuarPaso2}
            onVolver={() => setPasoActual(1)}
            onRegenerar={handleRegenerarClusters} // <-- Nueva prop para el algoritmo
            isRegenerating={isRegenerating} // <-- Estado de carga para el botón
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
