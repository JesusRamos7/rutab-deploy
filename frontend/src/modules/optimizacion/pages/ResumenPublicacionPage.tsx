// /frontend/src/modules/optimizacion/pages/ResumenPublicacionPage.tsx

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  CheckCircle,
  Clock,
  Route,
  ArrowLeft,
  Truck,
  MapPin,
  ChevronRight,
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
    if (isFirstRender.current) {
      calcularRutas();
      isFirstRender.current = false;
    }
  }, []);

  const calcularRutas = async () => {
    try {
      setIsCalculating(true);

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
      let ultimoPuntoDeEntrega: Coordenadas | undefined = undefined;

      for (let i = 0; i < ordenDeClustersIds.length; i++) {
        const clusterId = ordenDeClustersIds[i];
        const clusterActual = clustersAjustados.find(
          (c) => c.clusterId === clusterId,
        );

        if (!clusterActual || clusterActual.pedidos.length === 0) continue;

        const siguienteClusterId = ordenDeClustersIds[i + 1];
        const siguienteCluster = clustersAjustados.find(
          (c) => c.clusterId === siguienteClusterId,
        );
        const puntoFin = siguienteCluster?.centroide;

        const resultadoOrdenado = await optimizacionService.ordenarCluster({
          pedidos: clusterActual.pedidos,
          inicio: ultimoPuntoDeEntrega,
          fin: puntoFin,
        });

        pedidosPlanificados = [
          ...pedidosPlanificados,
          ...resultadoOrdenado.pedidos,
        ];

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
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePublicar = async () => {
    try {
      setIsPublishing(true);
      await optimizacionService.publicarRuta({
        rutaId: rutaSeleccionada.rutaId,
        ordenFinalPedidos: ordenGlobalPedidos.map((p) => p.id),
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

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-pulse">
        <div className="relative mb-6">
          <Loader2 className="animate-spin text-blue-600" size={64} />
          <Route className="absolute inset-0 m-auto text-blue-400" size={24} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
          Optimizando Secuencia Final
        </h3>
        <p className="text-gray-400 font-medium mt-2">
          Conectando grupos de entrega para minimizar el kilometraje...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Botón Volver */}
      <button
        onClick={onVolver}
        className="group flex items-center text-gray-400 hover:text-gray-900 mb-8 transition-all font-bold text-sm"
      >
        <ArrowLeft
          size={18}
          className="mr-2 group-hover:-translate-x-1 transition-transform"
        />
        REGRESAR AL AJUSTE
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2 text-blue-600 font-black text-xs uppercase tracking-widest">
            <CheckCircle size={14} /> Revisión Final
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
            Resumen de la Ruta
          </h2>
          <div className="flex items-center gap-3 mt-2 bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
            <Truck size={16} className="text-gray-500" />
            <span className="font-bold text-gray-700 text-sm">
              {rutaSeleccionada.placas}{" "}
              <span className="text-gray-400 mx-1">•</span>{" "}
              {rutaSeleccionada.modelo}
            </span>
          </div>
        </div>

        <button
          onClick={handlePublicar}
          disabled={isPublishing}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-green-100 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
        >
          {isPublishing ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          {isPublishing ? "GUARDANDO..." : "PUBLICAR RUTA"}
        </button>
      </div>

      {/* Métricas con Mapeo de Colores Correcto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <MetricCard
          icon={<Route size={24} />}
          label="Distancia Total"
          value={(distanciaTotal / 1000).toFixed(1) + " KM"}
          type="blue"
        />
        <MetricCard
          icon={<Clock size={24} />}
          label="Est. Conducción"
          value={formatTiempo(duracionTotal)}
          type="orange"
        />
        <MetricCard
          icon={<MapPin size={24} />}
          label="Puntos de Entrega"
          value={ordenGlobalPedidos.length}
          type="purple"
        />
      </div>

      {/* Timeline de Entregas */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
          Secuencia de Visita{" "}
          <ChevronRight size={18} className="text-gray-300" />
        </h3>

        <div className="relative">
          {/* Línea central del timeline */}
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100" />

          <div className="space-y-8">
            {ordenGlobalPedidos.map((pedido, index) => (
              <div
                key={pedido.id}
                className="relative flex items-start gap-6 group"
              >
                {/* Indicador de Punto */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-4 transition-colors ${
                    index === 0
                      ? "bg-blue-600 border-blue-100 text-white"
                      : index === ordenGlobalPedidos.length - 1
                        ? "bg-green-600 border-green-100 text-white"
                        : "bg-white border-gray-100 text-gray-400 group-hover:border-blue-200 group-hover:text-blue-500"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {pedido.cliente}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">
                        {index === 0
                          ? "Punto de Inicio"
                          : index === ordenGlobalPedidos.length - 1
                            ? "Punto de Cierre"
                            : "Entrega Intermedia"}
                      </p>
                    </div>

                    {/* Código de Rastreo en el Timeline */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">
                        ID RASTREO
                      </span>
                      <div className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-[10px] font-mono font-black text-gray-600 shadow-sm">
                        {pedido.codigoRastreo}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Auxiliares de Formato
const formatTiempo = (segundos: number) => {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  return h > 0 ? `${h}H ${m}M` : `${m} MIN`;
};

// Sub-componente MetricCard Refactorizado para Tailwind
const MetricCard = ({
  icon,
  label,
  value,
  type,
}: {
  icon: any;
  label: string;
  value: any;
  type: "blue" | "orange" | "purple";
}) => {
  const styles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`p-4 rounded-2xl border ${styles[type]}`}>{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1.5">
          {label}
        </p>
        <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
          {value}
        </p>
      </div>
    </div>
  );
};
