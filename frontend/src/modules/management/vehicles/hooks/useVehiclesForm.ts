// src/modules/management/vehicles/hooks/useVehiclesForm.ts

import { useState, useEffect, FormEvent } from "react";
import { Vehicle, VehicleFormData } from "../types";
import { VehicleService } from "../vehicles.service";
import { toast } from "sonner";

/**
 * Estado inicial para el formulario de vehículos.
 * Asegura que los campos controlados de React no inicien como undefined.
 */
const INITIAL_STATE: VehicleFormData = {
  placas: "",
  marca: "",
  modelo: "",
  rendimiento_combustible: "",
  estatus: "disponible",
};

/**
 * Hook personalizado para la gestión lógica de formularios de vehículos.
 * Maneja tanto la creación de nuevos registros como la actualización de existentes.
 */
export const useVehiclesForm = (
  vehicle: Vehicle | null | undefined,
  isOpen: boolean,
  onSuccess: () => void,
  onClose: () => void,
) => {
  const [formData, setFormData] = useState<VehicleFormData>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Efecto de Sincronización:
   * Rehidrata el formulario con los datos del vehículo si se entra en modo edición,
   * o resetea al estado inicial si se está creando uno nuevo.
   */
  useEffect(() => {
    if (vehicle) {
      setFormData({
        placas: vehicle.placas || "",
        marca: vehicle.marca || "",
        modelo: vehicle.modelo || "",
        // Conversión a string para compatibilidad con el input de texto
        rendimiento_combustible:
          vehicle.rendimiento_combustible?.toString() || "",
        estatus: vehicle.estatus || "disponible",
      });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [vehicle, isOpen]);

  /**
   * Actualizador dinámico de campos del formulario.
   * @param field - La propiedad de VehicleFormData a modificar.
   * @param value - El nuevo valor capturado del evento.
   */
  const handleChange = (field: keyof VehicleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Gestiona el envío de datos al servidor.
   * Determina automáticamente si debe ejecutar un 'create' o un 'update' basado en el ID.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (vehicle?.id) {
        // Operación de actualización para registros existentes
        await VehicleService.update(vehicle.id, formData);
        toast.success("Vehículo actualizado correctamente");
      } else {
        // Operación de creación para nuevos registros
        await VehicleService.create(formData);
        toast.success("Vehículo registrado exitosamente");
      }

      // Notificación al componente padre y cierre del flujo
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el vehículo");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleSubmit,
  };
};
