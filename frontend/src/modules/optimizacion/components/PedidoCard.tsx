// /frontend/src/modules/optimizacion/components/PedidoCard.tsx

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin } from "lucide-react";
import { PuntoPedido } from "../types/optimizacion.types";

interface Props {
  pedido: PuntoPedido;
  color: string; // Color del cluster actual
  onHover: (id: string | null) => void; // Para el efecto focus
}

export const PedidoCard = ({ pedido, color, onHover }: Props) => {
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
      onMouseEnter={() => onHover(pedido.id)}
      onMouseLeave={() => onHover(null)}
      className={`group flex items-center gap-3 p-3 bg-white border rounded-lg shadow-sm mb-2 transition-all hover:shadow-md ${
        isDragging ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
      }`}
    >
      {/* Indicador de Color del Cluster */}
      <div
        className="w-1.5 h-10 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Manejador de arrastre */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-500 transition-colors"
      >
        <GripVertical size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">
          {pedido.cliente}
        </p>
        <div className="flex items-center text-[10px] text-gray-400 mt-0.5">
          <MapPin size={10} className="mr-1" />
          <span className="truncate uppercase tracking-tighter">
            {pedido.lat.toFixed(4)}, {pedido.lng.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
};
