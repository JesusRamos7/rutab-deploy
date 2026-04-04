// /frontend/src/modules/optimizacion/components/ClusterColumn.tsx

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ClusterResponse } from "../types/optimizacion.types";
import { PedidoCard } from "./PedidoCard";
import { PackageSearch } from "lucide-react";

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
  const esLimite = cantidad >= 20;

  return (
    <div
      className={`flex flex-col flex-shrink-0 w-72 bg-slate-50/50 rounded-2xl border-2 transition-all duration-300 ${
        isOver
          ? "border-blue-500/20 bg-blue-50/50 shadow-sm"
          : "border-transparent"
      }`}
    >
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-slate-700 text-sm tracking-tight">
            Grupo {cluster.clusterId + 1}
          </h3>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
            esLimite
              ? "bg-red-50 text-red-600 border border-red-100"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          {cantidad} / 20
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="px-2 pb-3 flex-1 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
      >
        <SortableContext
          items={cluster.pedidos.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {cluster.pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                color={color}
                onHover={onPedidoHover}
              />
            ))}
          </div>
        </SortableContext>

        {cantidad === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 rounded-xl mt-1 animate-in fade-in duration-500">
            <PackageSearch
              size={20}
              className="text-slate-300 mb-2"
              strokeWidth={1.5}
            />
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">
              Vacío
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
