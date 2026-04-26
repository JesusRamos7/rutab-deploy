// src/modules/management/evidences/components/EvidenceFiltersBar.tsx
import { Search, Filter, Calendar, RotateCcw } from "lucide-react";
import { EvidenceFilters } from "../types/evidence.types";

interface Props {
  filters: EvidenceFilters;
  onFilterChange: (filters: Partial<EvidenceFilters>) => void;
}

export const EvidenceFiltersBar = ({ filters, onFilterChange }: Props) => {
  // Verificamos si hay algún filtro activo para mostrar el botón de limpieza
  const hasActiveFilters = !!(
    filters.choferCorreo ||
    filters.fecha ||
    filters.estado ||
    filters.pedidoId
  );

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-6 items-center">
      {/* Búsqueda por Correo */}
      <div className="flex-1 min-w-[250px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
        <input
          type="email"
          placeholder="Buscar por Correo de Chofer..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
          value={filters.choferCorreo || ""}
          onChange={(e) => onFilterChange({ choferCorreo: e.target.value })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Filtro por Fecha */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
          <input
            type="date"
            className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600 bg-white"
            value={filters.fecha || ""}
            onChange={(e) => onFilterChange({ fecha: e.target.value })}
          />
        </div>

        {/* Filtro por Estado */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm appearance-none cursor-pointer"
              value={filters.estado || ""}
              onChange={(e) => onFilterChange({ estado: e.target.value })}
            >
              <option value="">Todos los estados</option>
              <option value="alerta">Alerta</option>
              <option value="auto aprobada">Auto Aprobada</option>
              <option value="aprobada">Aprobada Manualmente</option>
            </select>
          </div>
        </div>

        {/* Botón de Limpieza Mejorado */}
        {hasActiveFilters && (
          <button
            onClick={() =>
              onFilterChange({
                choferCorreo: "",
                fecha: "",
                estado: "",
                pedidoId: "",
              })
            }
            className="flex items-center justify-center p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 hover:border-red-200 transition-all group"
            title="Limpiar todos los filtros"
          >
            <RotateCcw
              size={18}
              className="group-hover:rotate-[-45deg] transition-transform"
            />
          </button>
        )}
      </div>
    </div>
  );
};
