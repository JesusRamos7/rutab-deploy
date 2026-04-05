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
  Hash,
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

/**
 * Componente final del flujo de optimización.
 * Calcula la secuencia global definitiva, consolida métricas de tiempo/distancia
 * y permite la publicación oficial del itinerario.
 */
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

  // Evita ejecuciones duplicadas en entornos de desarrollo (Strict Mode)
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      calcularRutas();
      isFirstRender.current = false;
    }
  }, []);

  /**
   * Orquestador de la secuencia final.
   * Primero ordena los grupos entre sí y luego optimiza las paradas internas
   * de cada grupo asegurando el encadenamiento de puntos (salida/llegada).
   */
  const calcularRutas = async () => {
    try {
      setIsCalculating(true);

      // Determina el orden de visita óptimo entre los centroides de los grupos
      const centroides = clustersAjustados.map((c) => ({
        clusterId: c.clusterId,
        lat: c.centroide.lat,
        lng: c.centroide.lng,
      }));

      const ordenDeClustersIds =
        await optimizacionService.proponerOrdenClusters({ centroides });

      let pedidosPlanificados: PuntoPedido[] = [];
      let sumDistancia = 0;
      let sumDuracion = 0;
      let ultimoPuntoDeEntrega: Coordenadas | undefined = undefined;

      // Itera sobre el orden de grupos para optimizar trayectos punto a punto
      for (let i = 0; i < ordenDeClustersIds.length; i++) {
        const clusterId = ordenDeClustersIds[i];
        const clusterActual = clustersAjustados.find(
          (c) => c.clusterId === clusterId,
        );

        if (!clusterActual || clusterActual.pedidos.length === 0) continue;

        const siguienteCluster = clustersAjustados.find(
          (c) => c.clusterId === ordenDeClustersIds[i + 1],
        );

        // Optimiza la secuencia interna del grupo actual conectándolo con el siguiente
        const resultadoOrdenado = await optimizacionService.ordenarCluster({
          pedidos: clusterActual.pedidos,
          inicio: ultimoPuntoDeEntrega,
          fin: siguienteCluster?.centroide,
        });

        pedidosPlanificados = [
          ...pedidosPlanificados,
          ...resultadoOrdenado.pedidos,
        ];

        // Actualiza el último punto para que el siguiente grupo inicie desde ahí
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

  /**
   * Persiste la configuración final de la ruta en la base de datos.
   */
  const handlePublicar = async () => {
    try {
      setIsPublishing(true);
      await optimizacionService.publicarRuta({
        rutaId: rutaSeleccionada.rutaId,
        ordenFinalPedidos: ordenGlobalPedidos.map((p) => p.id),
        distanciaTotalMetros: distanciaTotal,
        duracionTotalSegundos: duracionTotal,
      });
      toast.success("Ruta publicada exitosamente");
      onFinalizado();
    } catch (error) {
      toast.error("Error al publicar la ruta.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2
          className="animate-spin text-slate-300 mb-4"
          size={40}
          strokeWidth={1.5}
        />
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em]">
          Optimizando Secuencia
        </h3>
        <p className="text-slate-400 text-xs mt-2 font-medium">
          Calculando el trayecto más eficiente entre grupos...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Botón de retorno al paso de edición */}
      <button
        onClick={onVolver}
        className="group flex items-center text-slate-400 hover:text-slate-900 mb-10 transition-colors text-[10px] font-bold uppercase tracking-widest"
      >
        <ArrowLeft
          size={14}
          className="mr-2 group-hover:-translate-x-1 transition-transform"
        />
        Regresar al ajuste
      </button>

      {/* Identificación de la ruta y acción principal */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Revisión de itinerario
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Resumen de Ruta
          </h2>
          <div className="flex items-center gap-2 py-1 px-3 bg-slate-100 rounded-full w-fit border border-slate-200/50">
            <Truck size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-tight">
              {rutaSeleccionada.placas}{" "}
              <span className="text-slate-300 mx-1">|</span>{" "}
              {rutaSeleccionada.modelo}
            </span>
          </div>
        </div>

        <button
          onClick={handlePublicar}
          disabled={isPublishing}
          className="bg-slate-900 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
        >
          {isPublishing ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <CheckCircle size={16} />
          )}
          {isPublishing ? "Publicando..." : "Publicar Ruta"}
        </button>
      </div>

      {/* Panel de Indicadores Clave (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <MetricCard
          icon={<Route size={20} />}
          label="Distancia"
          value={(distanciaTotal / 1000).toFixed(1) + " km"}
        />
        <MetricCard
          icon={<Clock size={20} />}
          label="Tiempo Est."
          value={formatTiempo(duracionTotal)}
        />
        <MetricCard
          icon={<MapPin size={20} />}
          label="Entregas"
          value={ordenGlobalPedidos.length}
        />
      </div>

      {/* Línea de tiempo detallada de la secuencia de entrega */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.15em]">
            Secuencia de Visita
          </h3>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            {ordenGlobalPedidos.length} Puntos totales
          </span>
        </div>

        <div className="relative">
          {/* Eje visual del itinerario */}
          <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-slate-100" />

          <div className="space-y-10">
            {ordenGlobalPedidos.map((pedido, index) => (
              <div
                key={pedido.id}
                className="relative flex items-start gap-6 group"
              >
                {/* Indicador de posición con énfasis en origen y destino */}
                <div
                  className={`relative z-10 w-[23px] h-[23px] rounded-full flex items-center justify-center text-[10px] font-bold transition-all border ${
                    index === 0
                      ? "bg-slate-900 border-slate-900 text-white"
                      : index === ordenGlobalPedidos.length - 1
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-900 group-hover:text-slate-900"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 transition-colors">
                      {pedido.cliente}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                      {index === 0
                        ? "Punto de partida"
                        : index === ordenGlobalPedidos.length - 1
                          ? "Destino final"
                          : "Escala intermedia"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                    <Hash
                      size={10}
                      className="text-slate-300"
                      strokeWidth={3}
                    />
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                      {pedido.codigoRastreo}
                    </span>
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

/**
 * Convierte segundos a formato legible de horas y minutos.
 */
const formatTiempo = (segundos: number) => {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m} min`;
};

/**
 * Tarjeta de visualización para métricas del itinerario.
 */
const MetricCard = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: any;
}) => (
  <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4 transition-all hover:bg-white hover:shadow-sm">
    <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-slate-400 shadow-sm">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </span>
      <span className="text-lg font-semibold text-slate-900 tracking-tight">
        {value}
      </span>
    </div>
  </div>
);
