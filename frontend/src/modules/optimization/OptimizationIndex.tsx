// /frontend/src/modules/optimization/OptimizationIndex.tsx

import { useState } from "react";
import { toast } from "sonner";
import {
  VehicleSelectionPage,
  RutaPendiente,
} from "./pages/VehicleSelectionPage";
import { AdjustClustersPage } from "./pages/AdjustClustersPage";
import { RouteSummaryPage } from "./pages/RouteSummary";
import { ClusterResponse } from "./types/optimization.types";
import { Stepper } from "./components/Stepper";
import { optimizationService } from "./services/optimizationService";

/**
 * Componente principal (Orquestador) del módulo de Optimización.
 * Gestiona el flujo de trabajo en tres etapas: Selección, Ajuste y Resumen.
 */
export const OptimizationIndex = () => {
  // Estado para controlar la navegación entre los pasos del proceso
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);

  // Información de la ruta y los grupos de pedidos (clusters) en memoria
  const [rutaSeleccionada, setRutaSeleccionada] =
    useState<RutaPendiente | null>(null);
  const [clusters, setClusters] = useState<ClusterResponse[]>([]);

  // Estado de carga para operaciones asíncronas de recalculo
  const [isRegenerating, setIsRegenerating] = useState(false);

  /**
   * Inicializa el proceso tras seleccionar una ruta en el Paso 1.
   * Recibe la sugerencia inicial generada por el servidor.
   */
  const handleClustersGenerados = (
    clustersSugeridos: ClusterResponse[],
    ruta: RutaPendiente,
  ) => {
    setClusters(clustersSugeridos);
    setRutaSeleccionada(ruta);
    setPasoActual(2);
  };

  /**
   * Ejecuta nuevamente el algoritmo de agrupamiento (Clustering) desde el Paso 2.
   * Permite obtener una nueva distribución geográfica sin cambiar de ruta.
   */
  const handleRegenerarClusters = async () => {
    if (!rutaSeleccionada) return;

    try {
      setIsRegenerating(true);
      const clustersSugeridos = await optimizationService.sugerirClusters({
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

  /**
   * Valida y guarda los ajustes manuales realizados en los grupos para pasar al resumen.
   */
  const handleContinuarPaso2 = (clustersAjustados: ClusterResponse[]) => {
    setClusters(clustersAjustados);
    setPasoActual(3);
  };

  /**
   * Limpia el estado local y reinicia el flujo tras publicar con éxito.
   */
  const handleFinalizado = () => {
    setRutaSeleccionada(null);
    setClusters([]);
    setPasoActual(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* Indicador de progreso persistente */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Stepper pasoActual={pasoActual} />
      </nav>

      {/* Renderizado condicional basado en la etapa actual del proceso */}
      <main className="flex-1 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-top-1 duration-500 ease-out">
        {pasoActual === 1 && (
          <VehicleSelectionPage
            onClustersGenerados={handleClustersGenerados}
          />
        )}

        {pasoActual === 2 && rutaSeleccionada && (
          <AdjustClustersPage
            clustersIniciales={clusters}
            onContinuarPaso2={handleContinuarPaso2}
            onVolver={() => setPasoActual(1)}
            onRegenerar={handleRegenerarClusters}
            isRegenerating={isRegenerating}
          />
        )}

        {pasoActual === 3 && rutaSeleccionada && (
          <RouteSummaryPage
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
