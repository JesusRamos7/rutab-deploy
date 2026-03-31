// /frontend/src/modules/optimizacion/components/PedidoCard.tsx

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin } from "lucide-react";
import { PuntoPedido } from "../types/optimizacion.types";

interface Props {
  pedido: PuntoPedido;
}

export const PedidoCard = ({ pedido }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pedido.id, data: pedido });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm mb-2 ${
        isDragging ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
      }`}
    >
      {/* El manejador de arrastre */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {pedido.cliente}
        </p>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <MapPin size={12} className="mr-1" />
          <span className="truncate">
            {pedido.lat !== null && pedido.lng !== null
              ? `${pedido.lat.toFixed(4)}, ${pedido.lng.toFixed(4)}`
              : "Sin dirección"}
          </span>
        </div>
      </div>
    </div>
  );
};
