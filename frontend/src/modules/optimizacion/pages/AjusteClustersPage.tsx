// /frontend/src/modules/optimizacion/pages/AjusteClustersPage.tsx

import { useState, useEffect } from "react"; // Añadido useEffect
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  LayoutPanelLeft,
  Info,
  ArrowLeft,
  RotateCcw,
  Loader2,
} from "lucide-react"; // Añadidos iconos

import { ClusterResponse, PuntoPedido } from "../types/optimizacion.types";
import { ClusterColumn } from "../components/ClusterColumn";
import { PedidoCard } from "../components/PedidoCard";
import { VisorMapa } from "../components/VisorMapa";

interface Props {
  clustersIniciales: ClusterResponse[];
  onContinuarPaso2: (clustersAjustados: ClusterResponse[]) => void;
  onVolver: () => void;
  onRegenerar: () => void; // Nueva prop
  isRegenerating: boolean; // Nueva prop
}

const CLUSTER_COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
];

export const AjusteClustersPage = ({
  clustersIniciales,
  onContinuarPaso2,
  onVolver,
  onRegenerar,
  isRegenerating,
}: Props) => {
  const [clusters, setClusters] =
    useState<ClusterResponse[]>(clustersIniciales);
  const [activePedido, setActivePedido] = useState<PuntoPedido | null>(null);
  const [hoveredPedidoId, setHoveredPedidoId] = useState<string | null>(null);

  // Sincronizar el estado local si los clusters iniciales cambian (al regenerar)
  useEffect(() => {
    setClusters(clustersIniciales);
  }, [clustersIniciales]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const pedido = clusters
      .flatMap((c) => c.pedidos)
      .find((p) => p.id === active.id);
    if (pedido) setActivePedido(pedido);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const sourceIdx = clusters.findIndex((c) =>
      c.pedidos.some((p) => p.id === activeId),
    );
    const destIdx = clusters.findIndex(
      (c) =>
        c.clusterId.toString() === overId ||
        c.pedidos.some((p) => p.id === overId),
    );

    if (sourceIdx === -1 || destIdx === -1 || sourceIdx === destIdx) return;
    if (clusters[destIdx].pedidos.length >= 20) return;

    setClusters((prev) => {
      const sourceItems = [...prev[sourceIdx].pedidos];
      const destItems = [...prev[destIdx].pedidos];
      const itemIdx = sourceItems.findIndex((p) => p.id === activeId);
      const [movedItem] = sourceItems.splice(itemIdx, 1);
      destItems.push(movedItem);

      const next = [...prev];
      next[sourceIdx] = { ...next[sourceIdx], pedidos: sourceItems };
      next[destIdx] = { ...next[destIdx], pedidos: destItems };
      return next;
    });
  };

  const handleDragEnd = () => setActivePedido(null);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden bg-white">
      <div className="px-8 py-5 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 p-2 rounded-xl text-slate-500">
            <LayoutPanelLeft size={18} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
              Ajuste de Grupos
            </h2>
            <p className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
              <Info size={12} className="text-blue-500/70" />
              Organice los pedidos para equilibrar las rutas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onVolver}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={14} strokeWidth={3} />
            Regresar
          </button>

          {/* Botón de Regenerar Sugerencia */}
          <button
            onClick={onRegenerar}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all disabled:opacity-50"
          >
            {isRegenerating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RotateCcw size={14} strokeWidth={3} />
            )}
            Regenerar
          </button>

          <button
            onClick={() => onContinuarPaso2(clusters)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm shadow-slate-200"
          >
            Confirmar Grupos
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block w-[55%] p-4 h-full">
          <div className="bg-slate-50 h-full rounded-2xl border border-slate-100 overflow-hidden relative shadow-sm">
            <VisorMapa clusters={clusters} hoveredPedidoId={hoveredPedidoId} />
          </div>
        </div>

        <div className="w-full lg:w-[45%] flex flex-col bg-slate-50/30 border-l border-slate-50">
          <div className="px-6 py-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Distribución de Carga
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-4 overflow-x-auto px-6 pb-6 h-full items-start scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {clusters.map((cluster, idx) => (
                  <ClusterColumn
                    key={cluster.clusterId}
                    cluster={cluster}
                    color={CLUSTER_COLORS[idx % CLUSTER_COLORS.length]}
                    onPedidoHover={setHoveredPedidoId}
                  />
                ))}
              </div>

              <DragOverlay dropAnimation={null}>
                {activePedido ? (
                  <div className="w-72 opacity-90">
                    <PedidoCard
                      pedido={activePedido}
                      color={
                        CLUSTER_COLORS[
                          clusters.findIndex((c) =>
                            c.pedidos.some((p) => p.id === activePedido.id),
                          ) % CLUSTER_COLORS.length
                        ]
                      }
                      onHover={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
};
