// /frontend/src/modules/optimization/pages/VehicleSelectionPage.tsx

import { useState, useEffect } from "react";
import {
  Truck,
  Calendar as CalendarIcon,
  Map,
  ChevronRight,
  Loader2,
  Search,
  PackageOpen,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { optimizationService } from "../services/optimizationService";
import { ClusterResponse } from "../types/optimization.types";
import { SkeletonRoute } from "../components/SkeletonRoute";

/**
 * Representa la información básica de una ruta en estado borrador.
 */
export interface RutaPendiente {
  rutaId: string;
  vehiculoId: string;
  placas: string;
  modelo: string;
  fechaProgramada: string;
  pedidosAsignados: number;
}

interface Props {
  /** Notifica al componente padre cuando se han generado los grupos geográficos iniciales */
  onClustersGenerados: (
    clusters: ClusterResponse[],
    rutaSeleccionada: RutaPendiente,
  ) => void;
}

/**
 * Página inicial del módulo que permite buscar y seleccionar una ruta para optimizar.
 */
export const VehicleSelectionPage = ({ onClustersGenerados }: Props) => {
  const [rutasPendientes, setRutasPendientes] = useState<RutaPendiente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  // Estados para el control de filtros de búsqueda y fecha
  const [busqueda, setBusqueda] = useState("");
  const [fecha, setFecha] = useState("");

  /**
   * Ejecuta un debounce de 500ms antes de realizar la búsqueda en el servidor
   * para reducir la carga de peticiones mientras el usuario escribe.
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      cargarRutas(busqueda, fecha);
    }, 500);

    return () => clearTimeout(handler);
  }, [busqueda, fecha]);

  /**
   * Obtiene del servidor las rutas con estatus "borrador" aplicando los filtros activos.
   */
  const cargarRutas = async (q?: string, f?: string) => {
    try {
      setIsLoading(true);
      const data = await optimizationService.obtenerRutasPendientes(q, f);
      setRutasPendientes(data);
    } catch (error) {
      toast.error("Error al sincronizar las rutas.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Inicia el proceso de agrupamiento (Clustering) para la ruta seleccionada.
   */
  const handlePlanificar = async (ruta: RutaPendiente) => {
    try {
      setProcesandoId(ruta.rutaId);
      const clustersSugeridos = await optimizationService.sugerirClusters({
        vehiculoId: ruta.vehiculoId,
        fechaProgramada: ruta.fechaProgramada,
      });

      if (clustersSugeridos.length === 0) {
        toast.warning("No hay pedidos geolocalizados para esta ruta.");
        return;
      }

      onClustersGenerados(clustersSugeridos, ruta);
    } catch (error) {
      toast.error("Error al generar la agrupación geográfica.");
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Encabezado con herramientas de filtrado */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Map size={20} strokeWidth={2.5} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Operaciones
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Selección de Rutas
          </h1>
          <p className="text-slate-500 text-sm">
            Filtre por placa del vehiculo, UUID de ruta o fecha programada.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Entrada de búsqueda por texto */}
          <div className="relative group w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Placa o UUID de ruta..."
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500/50 transition-all w-full"
            />
          </div>

          {/* Selector de fecha programada */}
          <div className="relative group w-full sm:w-44">
            <CalendarIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors pointer-events-none"
              size={16}
            />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500/50 transition-all w-full text-slate-600 appearance-none uppercase"
            />
          </div>
        </div>
      </div>

      {/* Listado dinámico de rutas pendientes */}
      <div className="grid gap-3">
        {isLoading ? (
          <>
            <SkeletonRoute />
            <SkeletonRoute />
          </>
        ) : rutasPendientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <PackageOpen
              size={40}
              className="text-slate-300 mb-3"
              strokeWidth={1.5}
            />
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Sin coincidencias
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Intente ajustar los filtros de búsqueda.
            </p>
          </div>
        ) : (
          rutasPendientes.map((ruta) => (
            <div
              key={ruta.rutaId}
              className="group bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500/30 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shrink-0 mt-1">
                  <Truck size={24} strokeWidth={1.5} />
                </div>

                <div className="min-w-0">
                  {/* Identificador único de la ruta */}
                  <div className="flex items-center gap-1.5 mb-2 bg-slate-50 w-fit px-2 py-0.5 rounded-md border border-slate-100">
                    <Hash size={10} className="text-blue-500/50" />
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
                      UUID: {ruta.rutaId}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 truncate">
                    {ruta.placas}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {ruta.modelo}
                  </p>
                </div>
              </div>

              {/* Información de programación y carga */}
              <div className="flex flex-wrap items-center gap-6 md:gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Programación
                  </p>
                  <div className="flex items-center gap-1.5 text-slate-700 text-sm font-medium">
                    <CalendarIcon size={14} className="text-slate-400" />
                    {ruta.fechaProgramada}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Carga Actual
                  </p>
                  <div className="text-slate-900 text-sm font-semibold">
                    {ruta.pedidosAsignados}{" "}
                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                      Pedidos
                    </span>
                  </div>
                </div>

                {/* Botón de acción para iniciar optimización */}
                <button
                  onClick={() => handlePlanificar(ruta)}
                  disabled={procesandoId === ruta.rutaId}
                  className={`min-w-[140px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    procesandoId === ruta.rutaId
                      ? "bg-slate-100 text-slate-400"
                      : "bg-slate-900 text-white hover:bg-blue-600 active:scale-95 shadow-sm shadow-slate-200"
                  }`}
                >
                  {procesandoId === ruta.rutaId ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      Optimizar
                      <ChevronRight size={14} strokeWidth={3} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
