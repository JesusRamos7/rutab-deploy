import { useState } from "react";
import { useIncidents } from "../hooks/useIncidents";
import { IncidentFiltersBar } from "../components/IncidentFiltersBar";
import { IncidentTable } from "../components/IncidentTable";
import { IncidentReviewModal } from "../components/IncidentReviewModal";
import { Incident } from "../types/incident.types";

export const IncidentsPage = () => {
  const { incidents, isLoading, filters, updateFilters, handleUpdateStatus } =
    useIncidents();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          Gestión de Incidencias
        </h1>
        <p className="text-gray-500">
          Supervisa, revisa y resuelve las incidencias reportadas en ruta.
        </p>
      </header>

      <IncidentFiltersBar filters={filters} onFilterChange={updateFilters} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
          <div className="size-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-medium">Cargando incidencias de ruta...</p>
        </div>
      ) : (
        <IncidentTable
          incidents={incidents}
          onReview={(incident) => setSelectedIncident(incident)}
        />
      )}

      <IncidentReviewModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
