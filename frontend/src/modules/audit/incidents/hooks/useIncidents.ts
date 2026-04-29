import { useState, useEffect, useCallback } from "react";
import { Incident, IncidentFilters } from "../types/incident.types";
import { incidentService } from "../services/incident.service";
import { toast } from "sonner";

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<IncidentFilters>({});

  const fetchIncidents = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await incidentService.getAll(filters);
      setIncidents(data);
    } catch (error) {
      toast.error("Error al cargar las incidencias");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const updateFilters = (newFilters: Partial<IncidentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await incidentService.updateStatus(id, newStatus);
      toast.success(`Incidencia marcada como ${newStatus}`);
      // Recargamos la lista para obtener los datos más recientes
      fetchIncidents();
    } catch (error) {
      toast.error("No se pudo actualizar el estado de la incidencia");
      throw error;
    }
  };

  return {
    incidents,
    isLoading,
    filters,
    updateFilters,
    handleUpdateStatus,
  };
};
