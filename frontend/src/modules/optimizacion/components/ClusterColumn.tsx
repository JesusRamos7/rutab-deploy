import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ClusterResponse } from "../types/optimizacion.types";
import { PedidoCard } from "./PedidoCard";
import { Truck } from "lucide-react";

interface Props {
  cluster: ClusterResponse;
  color: string;
  onPedidoHover: (id: string | null) => void;
}

export const ClusterColumn = ({ cluster, color, onPedidoHover }: Props) => {
  const { setNodeRef, isOver }: any = useDroppable({
    id: cluster.clusterId.toString(),
  });

  const cantidad = cluster.pedidos.length;

  return (
    <div
      className={`flex flex-col flex-shrink-0 w-72 bg-gray-100/50 rounded-2xl border-2 transition-colors ${
        isOver ? "border-blue-400 bg-blue-50/50" : "border-transparent"
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-bold text-gray-700 text-sm">
            Grupo {cluster.clusterId + 1}
          </h3>
        </div>
        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
            cantidad >= 20
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {cantidad}/20
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="p-2 flex-1 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        <SortableContext
          items={cluster.pedidos.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {cluster.pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              color={color}
              onHover={onPedidoHover}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
