// /frontend/src/modules/optimizacion/pages/ResumenPublicacionPage.tsx

import { useState, useEffect } from "react";
import {
  Loader2,
  CheckCircle,
  Clock,
  Route,
  ArrowLeft,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { optimizacionService } from "../services/optimizacionService";
import { ClusterResponse, PuntoPedido } from "../types/optimizacion.types";
import { RutaPendiente } from "./SeleccionVehiculoPage"; // Importamos la interfaz temporal

interface Props {
  rutaSeleccionada: RutaPendiente;
  clustersAjustados: ClusterResponse[];
  onVolver: () => void;
  onFinalizado: () => void;
}

export const ResumenPublicacionPage = ({
  rutaSeleccionada,
  clustersAjustados,
  onVolver,
  onFinalizado,
}: Props) => {
  const [isCalculating, setIsCalculating] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Estados para almacenar el resultado de Google Maps
  const [ordenGlobalPedidos, setOrdenGlobalPedidos] = useState<PuntoPedido[]>(
    [],
  );
  const [distanciaTotal, setDistanciaTotal] = useState(0);
  const [duracionTotal, setDuracionTotal] = useState(0);

  useEffect(() => {
    calcularRutas();
  }, []);

  const calcularRutas = async () => {
    try {
      setIsCalculating(true);

      const centroides = clustersAjustados.map((c) => ({
        clusterId: c.clusterId,
        lat: c.centroide.lat,
        lng: c.centroide.lng,
      }));

      // Ahora esto recibe un arreglo de números [2, 0, 1...] gracias al cambio en el Controller
      const ordenDeClusters = await optimizacionService.proponerOrdenClusters({
        centroides,
      });

      if (!Array.isArray(ordenDeClusters)) {
        throw new Error("El orden de clusters no es un arreglo válido.");
      }

      let pedidosPlanificados: PuntoPedido[] = [];
      let sumDistancia = 0;
      let sumDuracion = 0;

      // Iteramos sobre los IDs ordenados
      for (const clusterId of ordenDeClusters) {
        const cluster = clustersAjustados.find(
          (c) => c.clusterId === clusterId,
        );
        if (!cluster || cluster.pedidos.length === 0) continue;

        const resultadoOrdenado = await optimizacionService.ordenarCluster(
          cluster.pedidos,
        );

        pedidosPlanificados = [
          ...pedidosPlanificados,
          ...resultadoOrdenado.pedidos,
        ];

        // Sumamos métricas internas de cada cluster
        sumDistancia += resultadoOrdenado.distanciaMetros;
        sumDuracion += resultadoOrdenado.duracionSegundos;
      }

      setOrdenGlobalPedidos(pedidosPlanificados);
      setDistanciaTotal(sumDistancia);
      setDuracionTotal(sumDuracion);
    } catch (error) {
      // ... (manejo de error)
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePublicar = async () => {
    try {
      setIsPublishing(true);

      // Extraemos solo los IDs en el orden final
      const ordenFinalPedidos = ordenGlobalPedidos.map((p) => p.id);

      // PASO 4: Publicar y guardar en BD
      await optimizacionService.publicarRuta({
        rutaId: rutaSeleccionada.rutaId,
        ordenFinalPedidos,
        distanciaTotalMetros: distanciaTotal,
        duracionTotalSegundos: duracionTotal,
      });

      toast.success(
        "¡Ruta publicada exitosamente! La app del chofer se ha actualizado.",
      );
      onFinalizado();
    } catch (error) {
      toast.error("Ocurrió un error al intentar publicar la ruta.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Funciones de formateo visual
  const formatKms = (metros: number) => (metros / 1000).toFixed(1) + " km";
  const formatTiempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const min = Math.floor((segundos % 3600) / 60);
    return `${horas}h ${min}m`;
  };

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-gray-800">
          Trazando la ruta óptima...
        </h3>
        <p className="text-gray-500 mt-2">
          Consultando infraestructura vial y tráfico con Google Maps.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={onVolver}
        className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Volver a los grupos
      </button>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Resumen de la Ruta
          </h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Truck size={16} /> {rutaSeleccionada.placas} -{" "}
            {rutaSeleccionada.modelo}
          </p>
        </div>
        <button
          onClick={handlePublicar}
          disabled={isPublishing}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-colors disabled:opacity-70"
        >
          {isPublishing ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          {isPublishing ? "Guardando..." : "Publicar Ruta Definitiva"}
        </button>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Route size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Distancia Total Estimada
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatKms(distanciaTotal)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Tiempo de Conducción
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatTiempo(duracionTotal)}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Total de Entregas
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {ordenGlobalPedidos.length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista Secuencial */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
          Secuencia de Visita Propuesta
        </div>
        <div className="divide-y divide-gray-100">
          {ordenGlobalPedidos.map((pedido, index) => (
            <div
              key={pedido.id}
              className="p-4 flex items-center gap-4 hover:bg-gray-50"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{pedido.cliente}</p>
                <p className="text-sm text-gray-500">
                  {pedido.lat.toFixed(4)}, {pedido.lng.toFixed(4)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
