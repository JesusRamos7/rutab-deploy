// types.ts
export interface Vehiculo {
  id: string;
  placas: string;
  marca: string;
  modelo: string;
  rendimiento_combustible: number;
  estatus: string;
}

export interface VehiculoFormData {
  placas: string;
  marca: string;
  modelo: string;
  rendimiento_combustible: string;
  estatus: string;
}

export interface VehiculoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehiculo?: Vehiculo | null;
}