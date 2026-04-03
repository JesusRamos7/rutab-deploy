// /frontend/src/modules/optimizacion/pages/ResumenPublicacionPage.tsx

import { useState, useEffect, useRef } from "react";
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
import {
  ClusterResponse,
  PuntoPedido,
  Coordenadas,
} from "../types/optimizacion.types";
import { RutaPendiente } from "./SeleccionVehiculoPage";

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

  const [ordenGlobalPedidos, setOrdenGlobalPedidos] = useState<PuntoPedido[]>(
    [],
  );
  const [distanciaTotal, setDistanciaTotal] = useState(0);
  const [duracionTotal, setDuracionTotal] = useState(0);

  const isFirstRender = useRef(true);

  useEffect(() => {
    // En desarrollo, esto evita que se ejecute la segunda vez del StrictMode
    if (isFirstRender.current) {
      calcularRutas();
      isFirstRender.current = false;
    }
  }, []);

  const calcularRutas = async () => {
    try {
      setIsCalculating(true);

      // PASO 3: Obtener orden de clusters (Lógica local en Backend, $0 costo)
      const centroides = clustersAjustados.map((c) => ({
        clusterId: c.clusterId,
        lat: c.centroide.lat,
        lng: c.centroide.lng,
      }));

      const ordenDeClustersIds =
        await optimizacionService.proponerOrdenClusters({
          centroides,
        });

      let pedidosPlanificados: PuntoPedido[] = [];
      let sumDistancia = 0;
      let sumDuracion = 0;

      // Variable para encadenar: el inicio del cluster N es el último punto del cluster N-1
      let ultimoPuntoDeEntrega: Coordenadas | undefined = undefined;

      // Iteramos secuencialmente para aplicar la lógica de postas
      for (let i = 0; i < ordenDeClustersIds.length; i++) {
        const clusterId = ordenDeClustersIds[i];
        const clusterActual = clustersAjustados.find(
          (c) => c.clusterId === clusterId,
        );

        if (!clusterActual || clusterActual.pedidos.length === 0) continue;

        // Determinamos el destino del grupo actual (el centroide del siguiente grupo)
        // Si no hay siguiente grupo, el destino será la Empresa (undefined en el servicio)
        const siguienteClusterId = ordenDeClustersIds[i + 1];
        const siguienteCluster = clustersAjustados.find(
          (c) => c.clusterId === siguienteClusterId,
        );
        const puntoFin = siguienteCluster?.centroide;

        // PASO 2: Llamada a Google Maps (1 solicitud por cada 20 pedidos)
        const resultadoOrdenado = await optimizacionService.ordenarCluster({
          pedidos: clusterActual.pedidos,
          inicio: ultimoPuntoDeEntrega, // Viene del cluster anterior (o base)
          fin: puntoFin, // Va hacia el centroide del siguiente
        });

        // Agregamos los pedidos ordenados al total
        pedidosPlanificados = [
          ...pedidosPlanificados,
          ...resultadoOrdenado.pedidos,
        ];

        // Actualizamos el punto de inicio para el SIGUIENTE cluster
        // Es el último pedido que Google decidió poner al final de este grupo
        const ultimoPedido =
          resultadoOrdenado.pedidos[resultadoOrdenado.pedidos.length - 1];
        ultimoPuntoDeEntrega = { lat: ultimoPedido.lat, lng: ultimoPedido.lng };

        sumDistancia += resultadoOrdenado.distanciaMetros;
        sumDuracion += resultadoOrdenado.duracionSegundos;
      }

      setOrdenGlobalPedidos(pedidosPlanificados);
      setDistanciaTotal(sumDistancia);
      setDuracionTotal(sumDuracion);
    } catch (error) {
      toast.error("Error al calcular la secuencia óptima.");
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePublicar = async () => {
    try {
      setIsPublishing(true);
      const ordenFinalPedidos = ordenGlobalPedidos.map((p) => p.id);

      await optimizacionService.publicarRuta({
        rutaId: rutaSeleccionada.rutaId,
        ordenFinalPedidos,
        distanciaTotalMetros: distanciaTotal,
        duracionTotalSegundos: duracionTotal,
      });

      toast.success("¡Ruta publicada exitosamente!");
      onFinalizado();
    } catch (error) {
      toast.error("Error al publicar la ruta.");
    } finally {
      setIsPublishing(false);
    }
  };

  const formatKms = (metros: number) => (metros / 1000).toFixed(1) + " km";
  const formatTiempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const min = Math.floor((segundos % 3600) / 60);
    return horas > 0 ? `${horas}h ${min}m` : `${min} min`;
  };

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-gray-800">
          Trazando ruta encadenada...
        </h3>
        <p className="text-gray-500 mt-2">
          Optimizando saltos entre grupos de entrega.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          icon={<Route size={24} />}
          label="Distancia Total"
          value={formatKms(distanciaTotal)}
          color="blue"
        />
        <MetricCard
          icon={<Clock size={24} />}
          label="Tiempo de Conducción"
          value={formatTiempo(duracionTotal)}
          color="orange"
        />
        <MetricCard
          icon={<CheckCircle size={24} />}
          label="Total de Entregas"
          value={ordenGlobalPedidos.length}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
          Secuencia de Visita
        </div>
        <div className="divide-y divide-gray-100">
          {ordenGlobalPedidos.map((pedido, index) => (
            <div
              key={pedido.id}
              className="p-4 flex items-center gap-4 hover:bg-gray-50"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 border border-gray-200">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{pedido.cliente}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Punto de Entrega
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sub-componente para limpiar el render principal
const MetricCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
    <div className={`bg-${color}-50 p-3 rounded-full text-${color}-600`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
