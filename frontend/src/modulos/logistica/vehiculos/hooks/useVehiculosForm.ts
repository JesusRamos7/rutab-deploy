// useVehiculosForm.ts
import { useState, useEffect, FormEvent } from 'react';
import { Vehiculo, VehiculoFormData } from '../types';
import { vehiculosService } from '../services/vehiculo.service';

const INITIAL_STATE: VehiculoFormData = {
  placas: '',
  marca: '',
  modelo: '',
  rendimiento_combustible: '',
  estatus: 'disponible'
};

export const useVehiculosForm = (
  vehiculo: Vehiculo | null | undefined,
  isOpen: boolean,
  onSuccess: () => void,
  onClose: () => void
) => {
  const [formData, setFormData] = useState<VehiculoFormData>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar el estado cuando se abre el modal o cambia el vehículo
  useEffect(() => {
    if (vehiculo) {
      setFormData({
        placas: vehiculo.placas || '',
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        rendimiento_combustible: vehiculo.rendimiento_combustible?.toString() || '',
        estatus: vehiculo.estatus || 'disponible'
      });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [vehiculo, isOpen]);

  // Manejador dinámico para los inputs
  const handleChange = (field: keyof VehiculoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (vehiculo?.id) {
        await vehiculosService.update(vehiculo.id, formData);
      } else {
        await vehiculosService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleSubmit
  };
};