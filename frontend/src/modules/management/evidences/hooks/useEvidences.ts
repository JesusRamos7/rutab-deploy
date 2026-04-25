// src/modules/management/evidences/hooks/useEvidences.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Evidence, EvidenceFilters } from "../types/evidence.types";
import { EvidenceService } from "../services/evidence.service";

export const useEvidences = () => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<EvidenceFilters>({
    estado: "",
    pedidoId: "",
    choferNombre: "",
  });

  const loadEvidences = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await EvidenceService.getAll(filters);
      setEvidences(data);
    } catch (error) {
      toast.error("Error al cargar las evidencias");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadEvidences();
  }, [loadEvidences]);

  const handleApprove = async (id: string) => {
    try {
      await EvidenceService.approve(id);
      toast.success("Evidencia aprobada correctamente");
      // Recargamos para actualizar el estado en la lista
      await loadEvidences();
    } catch (error) {
      toast.error("No se pudo aprobar la evidencia");
    }
  };

  const updateFilters = (newFilters: Partial<EvidenceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    evidences,
    isLoading,
    filters,
    updateFilters,
    handleApprove,
    refresh: loadEvidences,
  };
};
