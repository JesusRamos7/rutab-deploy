// /frontend/src/modules/optimizacion/pages/SeleccionVehiculoPage.tsx

import { useState, useEffect } from "react";
import {
  Truck,
  Calendar,
  Map,
  ChevronRight,
  Loader2,
  Search,
  PackageOpen,
} from "lucide-react";
import { toast } from "sonner";
import { optimizacionService } from "../services/optimizacionService";
import { ClusterResponse } from "../types/optimizacion.types";
import { SkeletonRuta } from "../components/SkeletonRuta";

export interface RutaPendiente {
  rutaId: string;
  vehiculoId: string;
  placas: string;
  modelo: string;
  fechaProgramada: string;
  pedidosAsignados: number;
}

interface Props {
  onClustersGenerados: (
    clusters: ClusterResponse[],
    rutaSeleccionada: RutaPendiente,
  ) => void;
}

export const SeleccionVehiculoPage = ({ onClustersGenerados }: Props) => {
  const [rutasPendientes, setRutasPendientes] = useState<RutaPendiente[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  useEffect(() => {
    cargarRutas();
  }, []);

  const cargarRutas = async () => {
    try {
      setIsLoading(true);
      const data = await optimizacionService.obtenerRutasPendientes();
      setRutasPendientes(data);
    } catch (error) {
      toast.error("Error al cargar las rutas pendientes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanificar = async (ruta: RutaPendiente) => {
    try {
      setProcesandoId(ruta.rutaId);
      const clustersSugeridos = await optimizacionService.sugerirClusters({
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
      {/* Header Minimalista */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Map size={20} strokeWidth={2.5} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Logística
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
            Planificación de Rutas
          </h1>
          <p className="text-slate-500 text-sm">
            Gestione los borradores y optimice las secuencias de entrega.
          </p>
        </div>

        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Filtrar por placa..."
            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500/50 transition-all w-full md:w-56"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <>
            <SkeletonRuta />
            <SkeletonRuta />
          </>
        ) : rutasPendientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <PackageOpen
              size={40}
              className="text-slate-300 mb-3"
              strokeWidth={1.5}
            />
            <h3 className="text-sm font-semibold text-slate-900">
              Bandeja de entrada vacía
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              No hay rutas pendientes de optimización.
            </p>
          </div>
        ) : (
          rutasPendientes.map((ruta) => (
            <div
              key={ruta.rutaId}
              className="group bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-500/30 hover:shadow-sm hover:shadow-blue-500/5 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Truck size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {ruta.placas}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {ruta.modelo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 md:gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Programación
                  </p>
                  <div className="flex items-center gap-1.5 text-slate-700 text-sm font-medium">
                    <Calendar size={14} className="text-slate-400" />
                    {ruta.fechaProgramada}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Carga
                  </p>
                  <div className="text-slate-900 text-sm font-semibold">
                    {ruta.pedidosAsignados}{" "}
                    <span className="text-[10px] text-slate-400 font-medium uppercase">
                      Pedidos
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanificar(ruta)}
                  disabled={procesandoId === ruta.rutaId}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    procesandoId === ruta.rutaId
                      ? "bg-slate-100 text-slate-400"
                      : "bg-slate-900 text-white hover:bg-blue-600 active:scale-95 shadow-sm"
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
