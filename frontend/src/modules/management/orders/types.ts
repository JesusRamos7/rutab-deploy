export interface Order {
  id: string; 
  id_generado?: string; // Tipo PED-001
  cliente_id: string;
  descripcion_carga: string;
  codigo_rastreo: string;
  estado_pedido: string;
  // Relación con el modelo clientes de Prisma
  clientes?: {
    nombre: string;
    direccion: string;
  };
  // Campos simulados
  prioridad?: string;
}

export interface OrderFormData {
    cliente_id: string;
    descripcion_carga: string;
    codigo_rastreo: string;
    estado_pedido: string;
    prioridad?: string;
}

export interface OrderProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    order?: Order | null; 
}