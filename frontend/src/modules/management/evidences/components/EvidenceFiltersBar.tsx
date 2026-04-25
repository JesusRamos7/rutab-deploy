// src/modules/management/evidences/components/EvidenceFiltersBar.tsx
import { Search, Filter } from "lucide-react";
import { EvidenceFilters } from "../types/evidence.types";

interface Props {
  filters: EvidenceFilters;
  onFilterChange: (filters: Partial<EvidenceFilters>) => void;
}

export const EvidenceFiltersBar = ({ filters, onFilterChange }: Props) => {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
        <input
          type="text"
          placeholder="Buscar por Nombre de Chofer..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={filters.choferNombre}
          onChange={(e) => onFilterChange({ choferNombre: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="text-gray-400 size-4" />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.estado}
          onChange={(e) => onFilterChange({ estado: e.target.value })}
        >
          <option value="">Todos los estados</option>
          <option value="alerta">Alerta</option>
          <option value="auto aprobada">Auto Aprobada</option>
          <option value="aprobada">Aprobada Manualmente</option>
        </select>
      </div>
    </div>
  );
};
