// useVehiculosPage.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Vehiculo } from '../types';
import { vehiculosService } from '../vehiculos.service';

export const useVehiculosPage = () => {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el Modal del Formulario (Crear/Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);

  // NUEVOS: Estados para el Modal de Confirmación (Eliminar)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [vehiculoToDelete, setVehiculoToDelete] = useState<Vehiculo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVehiculos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await vehiculosService.getAll();
      setVehiculos(data);
    } catch (error: any) {
      toast.error(error.message || "Hubo un problema al cargar los vehículos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehiculos(); }, [fetchVehiculos]);

  // --- Lógica del Formulario ---
  const openNewModal = () => { setSelectedVehiculo(null); setIsModalOpen(true); };
  const openEditModal = (vehiculo: Vehiculo) => { setSelectedVehiculo(vehiculo); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); };

  // --- NUEVA: Lógica de Eliminación ---
  const confirmDelete = (vehiculo: Vehiculo) => {
    setVehiculoToDelete(vehiculo);
    setIsConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmOpen(false);
    // Esperamos un poco antes de limpiar el estado para que la animación de cierre del modal no pierda el nombre del vehículo
    setTimeout(() => setVehiculoToDelete(null), 200); 
  };

  const executeDelete = async () => {
    if (!vehiculoToDelete) return;

    setIsDeleting(true);
    try {
      await vehiculosService.delete(vehiculoToDelete.id);
      toast.success(`Unidad ${vehiculoToDelete.placas} eliminada correctamente`);
      await fetchVehiculos();
      closeConfirmModal();
    } catch (error: any) {
      // Si NestJS lanza un 403 Forbidden, se mostrará aquí gracias a nuestro interceptor
      toast.error(error.message || "Error al eliminar la unidad");
      setIsDeleting(false); // Solo quitamos el loading si hay error (si hay éxito, el modal se cierra)
    }
  };

  return {
    vehiculos,
    isLoading,
    // Exportes del formulario
    isModalOpen,
    selectedVehiculo,
    openNewModal,
    openEditModal,
    closeModal,
    fetchVehiculos,
    // Exportes de confirmación
    isConfirmOpen,
    vehiculoToDelete,
    isDeleting,
    confirmDelete,
    closeConfirmModal,
    executeDelete
  };
};