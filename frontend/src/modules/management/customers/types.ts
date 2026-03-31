export interface Customer {
  id: string;
  nombre: string;
  telefono: string | null;
  correo: string;
  direccion: string; // Obligatorio
  latitude: number;  // Obligatorio para PostGIS
  longitude: number; // Obligatorio para PostGIS
  codigo?: string;
  contacto?: string | null;
  estatus?: 'Activo' | 'Inactivo';
  totalPedidos?: number;
}

/**
 * Representa los datos tal cual se manejan en el estado del formulario.
 * Usamos string para lat/long temporalmente para facilitar el manejo de inputs 
 * y luego los convertimos a number al enviar al servicio.
 */
export interface CustomerFormData {
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  latitude: number | null;
  longitude: number | null;
  contacto: string;
  estatus: 'Activo' | 'Inactivo';
}

export interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

/**
 * DTO para creación:
 * Omitimos campos generados por el servidor (id, codigo, totalPedidos).
 */
export type CreateCustomerDto = Omit<Customer, 'id' | 'codigo' | 'totalPedidos'>;

/**
 * DTO para actualización:
 * Ahora es un Partial de Customer pero omitiendo el 'id' (que viaja en la URL) 
 * y el 'codigo' (que es autogenerado). Esto permite actualizar el estatus.
 */
export type UpdateCustomerDto = Partial<Omit<Customer, 'id' | 'codigo' | 'totalPedidos'>>;