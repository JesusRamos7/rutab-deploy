// useVehiculosPage.ts
import { useState, useEffect, useCallback } from "react";
import { Vehiculo } from "../types";
import { vehiculosService } from "../services/vehiculo.service";
import { toast } from 'sonner';

export const useVehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchVehiculos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vehiculosService.getAll();
      setVehiculos(data);
  
    } catch (error) {
      console.error("Error fetching vehiculos:", error);
      toast.error("Hubo un problema al cargar la lista de vehículos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehiculos();
  }, [fetchVehiculos]);

  const handleDelete = async (id: string | number) => {
    if (window.confirm('¿Deseas eliminar esta unidad?')) {
      try {
        await vehiculosService.delete(id);
        await fetchVehiculos(); // Recargar la lista tras borrar
        toast.success("Unidad eliminada correctamente");
        
      } catch (error: any) {
        console.error("Error deleting vehiculo:", error);
        // Ahora mostramos el mensaje real que viene del backend/servicio
        toast.error(error.message || "Hubo un problema al cargar los vehículos");
      }
    }
  };

  const openNewModal = () => {
    setSelectedVehiculo(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    vehiculos,
    isLoading,
    isModalOpen,
    selectedVehiculo,
    fetchVehiculos,
    handleDelete,
    openNewModal,
    openEditModal,
    closeModal,
  };
};
