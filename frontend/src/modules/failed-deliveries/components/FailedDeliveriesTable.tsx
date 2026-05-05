import { useState, useMemo } from "react";
import { Trash2, Search, FilterX } from "lucide-react";
import { FailedOrder } from "../hooks/useFailedDeliveries";

interface FailedDeliveriesTableProps {
  orders: FailedOrder[];
  onRemove: (codigo: string) => void;
}

interface Filters {
  codigo_rastreo: string;
  cliente: string;
  contacto: string;
  direccion: string;
  fecha: string;
}

export const FailedDeliveriesTable = ({
  orders,
  onRemove,
}: FailedDeliveriesTableProps) => {
  const [filters, setFilters] = useState<Filters>({
    codigo_rastreo: "",
    cliente: "",
    contacto: "",
    direccion: "",
    fecha: "",
  });

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      codigo_rastreo: "",
      cliente: "",
      contacto: "",
      direccion: "",
      fecha: "",
    });
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const contactoText =
        `${order.telefono} ${order.correo_cliente}`.toLowerCase();

      // Formateamos la fecha del pedido a YYYY-MM-DD para compararla con el input type="date"
      const dateObj = new Date(order.fecha);
      const orderDateFormatted = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

      // Si hay filtro de fecha, debe coincidir exactamente
      const matchesFecha = filters.fecha
        ? orderDateFormatted === filters.fecha
        : true;

      return (
        order.codigo_rastreo
          .toLowerCase()
          .includes(filters.codigo_rastreo.toLowerCase()) &&
        order.cliente.toLowerCase().includes(filters.cliente.toLowerCase()) &&
        contactoText.includes(filters.contacto.toLowerCase()) &&
        order.direccion
          .toLowerCase()
          .includes(filters.direccion.toLowerCase()) &&
        matchesFecha
      );
    });
  }, [orders, filters]);

  // Evaluamos si hay algún filtro activo para mostrar el estado visual del botón de limpiar
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-slate-200/60">
        <div className="p-4 bg-slate-50 rounded-full mb-4">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium text-lg">
          La lista de extracción está vacía.
        </p>
        <p className="text-slate-400 text-sm mt-1">
          Todos los elementos han sido procesados o retirados.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200/60">
            <tr>
              <th className="px-5 py-4 font-semibold text-slate-700">
                Cód. Rastreo
              </th>
              <th className="px-5 py-4 font-semibold text-slate-700">
                Cliente
              </th>
              <th className="px-5 py-4 font-semibold text-slate-700">
                Contacto
              </th>
              <th className="px-5 py-4 font-semibold text-slate-700">
                Dirección
              </th>
              <th className="px-5 py-4 font-semibold text-slate-700 whitespace-nowrap">
                Fecha
              </th>
              <th className="px-5 py-4 font-semibold text-slate-700 text-center w-24">
                Acción
              </th>
            </tr>
            {/* Fila de Filtros */}
            <tr className="bg-slate-50/40 border-t border-slate-100">
              <th className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Filtrar código..."
                  value={filters.codigo_rastreo}
                  onChange={(e) =>
                    handleFilterChange("codigo_rastreo", e.target.value)
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </th>
              <th className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Filtrar cliente..."
                  value={filters.cliente}
                  onChange={(e) =>
                    handleFilterChange("cliente", e.target.value)
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </th>
              <th className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Tel. o Correo..."
                  value={filters.contacto}
                  onChange={(e) =>
                    handleFilterChange("contacto", e.target.value)
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </th>
              <th className="px-3 py-2">
                <input
                  type="text"
                  placeholder="Filtrar dirección..."
                  value={filters.direccion}
                  onChange={(e) =>
                    handleFilterChange("direccion", e.target.value)
                  }
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                />
              </th>
              <th className="px-3 py-2">
                <input
                  type="date"
                  value={filters.fecha}
                  onChange={(e) => handleFilterChange("fecha", e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
                />
              </th>
              <th className="px-3 py-2 text-center">
                <button
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className={`p-1.5 rounded-md transition-all ${
                    hasActiveFilters
                      ? "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      : "text-slate-300 cursor-not-allowed"
                  }`}
                  title="Limpiar todos los filtros"
                >
                  <FilterX className="w-4 h-4 mx-auto" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No se encontraron resultados para los filtros actuales.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.codigo_rastreo}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">
                    {order.codigo_rastreo}
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {order.cliente}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-700">{order.telefono}</span>
                      <span className="text-xs text-slate-500">
                        {order.correo_cliente}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p
                      className="truncate max-w-[250px] text-slate-600"
                      title={order.direccion}
                    >
                      {order.direccion}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                    {new Date(order.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => onRemove(order.codigo_rastreo)}
                      className="p-2 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-red-500 hover:bg-red-50 rounded-lg transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      title="Retirar de la lista de extracción"
                    >
                      <Trash2 className="w-[18px] h-[18px] mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
