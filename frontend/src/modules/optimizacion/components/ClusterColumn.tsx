// /frontend/src/modules/optimizacion/components/ClusterColumn.tsx

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
}

export const ClusterColumn = ({ cluster }: Props) => {
  const { setNodeRef, isOver }: any = useDroppable({
    id: cluster.clusterId.toString(),
  });

  const cantidad = cluster.pedidos.length;
  const alLimite = cantidad >= 20;

  return (
    <div
      className={`flex flex-col flex-shrink-0 w-80 bg-gray-50 rounded-xl border ${
        isOver ? "border-blue-400 bg-blue-50/50" : "border-gray-200"
      }`}
    >
      {/* Cabecera del Cluster */}
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Truck size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">
            Grupo {cluster.clusterId + 1}
          </h3>
        </div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            alLimite ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {cantidad} / 20
        </span>
      </div>

      {/* Contenedor de elementos arrastrables */}
      <div
        ref={setNodeRef}
        className="p-3 flex-1 overflow-y-auto min-h-[150px]"
      >
        <SortableContext
          items={cluster.pedidos.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {cluster.pedidos.map((pedido) => (
            <PedidoCard key={pedido.id} pedido={pedido} />
          ))}
        </SortableContext>
        {cantidad === 0 && (
          <p className="text-center text-sm text-gray-400 mt-4 italic">
            Arrastra pedidos aquí
          </p>
        )}
      </div>
    </div>
  );
};
