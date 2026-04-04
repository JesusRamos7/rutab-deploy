// /frontend/src/modules/optimizacion/components/PedidoCard.tsx

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MapPin, Hash } from "lucide-react";
import { PuntoPedido } from "../types/optimizacion.types";

interface Props {
  pedido: PuntoPedido;
  color: string;
  onHover: (id: string | null) => void;
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
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => onHover(pedido.id)}
      onMouseLeave={() => onHover(null)}
      className={`group flex items-start gap-3 p-3 bg-white border rounded-xl transition-all duration-200 ${
        isDragging
          ? "border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02] ring-1 ring-blue-500/20"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div
        className="w-1 h-8 rounded-full shrink-0 mt-0.5"
        style={{ backgroundColor: color }}
      />

      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400 transition-colors"
      >
        <GripVertical size={16} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-slate-700 truncate leading-tight">
            {pedido.cliente}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-400">
              <Hash size={10} strokeWidth={2.5} />
              <span className="text-[9px] font-mono font-bold tracking-tight uppercase">
                {pedido.codigoRastreo}
              </span>
            </div>
          </div>

          <div className="flex items-center text-[10px] text-slate-400 mt-1.5">
            <MapPin size={10} className="mr-1 opacity-70" />
            <span className="truncate tracking-wide font-medium">
              {pedido.lat.toFixed(4)}, {pedido.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
