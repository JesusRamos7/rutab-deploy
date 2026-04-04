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
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* Header con Estilo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
              <Map size={28} />
            </div>
            Planificación
          </h1>
          <p className="text-gray-400 font-medium mt-2">
            Selecciona un borrador para optimizar la secuencia de entrega.
          </p>
        </div>

        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por placa..."
            className="pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all w-full md:w-64 shadow-sm"
          />
        </div>
      </div>

      {/* Grid de Rutas (Cards en lugar de Tabla) */}
      <div className="space-y-4">
        {isLoading ? (
          // Skeletons de Carga
          <>
            <SkeletonRuta />
            <SkeletonRuta />
            <SkeletonRuta />
          </>
        ) : rutasPendientes.length === 0 ? (
          // Estado Vacío Ilustrado
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <PackageOpen size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">
              Todo al día
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              No hay rutas en borrador esperando optimización.
            </p>
          </div>
        ) : (
          rutasPendientes.map((ruta) => (
            <div
              key={ruta.rutaId}
              className="group bg-white border border-gray-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-gray-100 hover:border-blue-100 transition-all duration-300"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                  <Truck size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">
                    {ruta.placas}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {ruta.modelo}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                    Fecha
                  </span>
                  <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                    <Calendar size={14} className="text-blue-500" />
                    {ruta.fechaProgramada}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                    Volumen
                  </span>
                  <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-black border border-amber-100">
                    {ruta.pedidosAsignados} PEDIDOS
                  </div>
                </div>

                <button
                  onClick={() => handlePlanificar(ruta)}
                  disabled={procesandoId === ruta.rutaId}
                  className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    procesandoId === ruta.rutaId
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-blue-600 shadow-lg shadow-gray-200 active:scale-95"
                  }`}
                >
                  {procesandoId === ruta.rutaId ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      Optimizar <ChevronRight size={16} />
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