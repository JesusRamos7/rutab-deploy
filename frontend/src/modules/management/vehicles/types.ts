// src/modules/management/vehicles/types.ts

/**
 * Representación del modelo de datos de un vehículo.
 * Corresponde a la estructura almacenada en la base de datos (Prisma).
 */
export interface Vehicle {
  /** Identificador único (UUID) */
  id: string;
  /** Identificación oficial de la unidad */
  placas: string;
  /** Fabricante del vehículo */
  marca: string;
  /** Línea o versión específica del vehículo */
  modelo: string;
  /** Eficiencia de consumo expresada en km/l */
  rendimiento_combustible: number;
  /** Estado operativo actual (ej. 'disponible', 'mantenimiento', 'en_ruta') */
  estatus: string;
}

/**
 * Estructura de datos para la gestión de estados en formularios.
 * Los campos numéricos se definen como string para facilitar la vinculación (binding) con inputs de texto.
 */
export interface VehicleFormData {
  placas: string;
  marca: string;
  modelo: string;
  /** Valor temporal en string antes de ser parseado a número para la API */
  rendimiento_combustible: string;
  estatus: string;
}

/**
 * Definición de propiedades para el componente de modal de formulario.
 */
export interface VehicleFormProps {
  /** Control de visibilidad del modal */
  isOpen: boolean;
  /** Callback para solicitar el cierre del modal */
  onClose: () => void;
  /** Callback ejecutado tras una operación de persistencia exitosa */
  onSuccess: () => void;
  /** Datos del vehículo en modo edición; si es null/undefined, el modo es 'Creación' */
  vehicle?: Vehicle | null;
}