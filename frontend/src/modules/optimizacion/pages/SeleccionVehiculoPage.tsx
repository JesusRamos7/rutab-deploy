// /frontend/src/modules/optimizacion/pages/SeleccionVehiculoPage.tsx

import { useState, useEffect } from "react";
import { Truck, Calendar, Map, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { optimizacionService } from "../services/optimizacionService";
import { ClusterResponse } from "../types/optimizacion.types";

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

  // Efecto para cargar los datos reales al montar el componente
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
      console.error(error);
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
        toast.warning(
          "No se encontraron pedidos geolocalizados para este vehículo en esta fecha.",
        );
        return;
      }

      toast.success(
        `Se han generado ${clustersSugeridos.length} grupos de entrega exitosamente.`,
      );
      onClustersGenerados(clustersSugeridos, ruta);
    } catch (error) {
      toast.error(
        "Ocurrió un error al intentar generar la agrupación geográfica.",
      );
      console.error(error);
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Map className="text-blue-600" size={32} />
          Planificación de Rutas
        </h1>
        <p className="text-gray-500 mt-2">
          Selecciona un vehículo con carga pendiente para optimizar su recorrido
          y generar la ruta de entrega.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Vehículo
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Fecha Programada
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Carga
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    <Loader2
                      className="animate-spin mx-auto text-blue-600 mb-2"
                      size={24}
                    />
                    Cargando rutas pendientes...
                  </td>
                </tr>
              ) : rutasPendientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No hay rutas en estado borrador pendientes de planificar.
                  </td>
                </tr>
              ) : (
                rutasPendientes.map((ruta) => (
                  <tr
                    key={ruta.rutaId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* ... (El resto de las celdas de la tabla se mantienen exactamente igual que en el código anterior) ... */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {ruta.placas}
                          </p>
                          <p className="text-xs text-gray-500">{ruta.modelo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={16} />
                        {ruta.fechaProgramada}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {ruta.pedidosAsignados} pedidos
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handlePlanificar(ruta)}
                        disabled={procesandoId === ruta.rutaId}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          procesandoId === ruta.rutaId
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        }`}
                      >
                        {procesandoId === ruta.rutaId ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Calculando...
                          </>
                        ) : (
                          <>
                            Planificar Ruta
                            <ChevronRight size={16} />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
