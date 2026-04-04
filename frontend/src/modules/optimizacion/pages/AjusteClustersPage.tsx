// /frontend/src/modules/optimizacion/pages/AjusteClustersPage.tsx

import { useState } from "react";
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
import { toast } from "sonner";
import { Map as MapIcon, Info, LayoutPanelLeft } from "lucide-react";

import { ClusterResponse, PuntoPedido } from "../types/optimizacion.types";
import { ClusterColumn } from "../components/ClusterColumn";
import { PedidoCard } from "../components/PedidoCard";
import { VisorMapa } from "../components/VisorMapa";

interface Props {
  clustersIniciales: ClusterResponse[];
  onContinuarPaso2: (clustersAjustados: ClusterResponse[]) => void;
}

// Paleta de colores consistente para marcadores y tarjetas
const CLUSTER_COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#EC4899", // Pink
  "#06B6D4", // Cyan
];

export const AjusteClustersPage = ({
  clustersIniciales,
  onContinuarPaso2,
}: Props) => {
  const [clusters, setClusters] =
    useState<ClusterResponse[]>(clustersIniciales);
  const [activePedido, setActivePedido] = useState<PuntoPedido | null>(null);

  // Estado para la sincronización visual con el mapa
  const [hoveredPedidoId, setHoveredPedidoId] = useState<string | null>(null);

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

    const sourceClusterIndex = clusters.findIndex((c) =>
      c.pedidos.some((p) => p.id === activeId),
    );

    const destClusterIndex = clusters.findIndex(
      (c) =>
        c.clusterId.toString() === overId ||
        c.pedidos.some((p) => p.id === overId),
    );

    if (sourceClusterIndex === destClusterIndex || destClusterIndex === -1)
      return;

    if (clusters[destClusterIndex].pedidos.length >= 20) {
      toast.error("Este grupo ya alcanzó el límite máximo de 20 pedidos.");
      return;
    }

    setClusters((prev) => {
      const sourceItems = [...prev[sourceClusterIndex].pedidos];
      const destItems = [...prev[destClusterIndex].pedidos];

      const activeItemIndex = sourceItems.findIndex((p) => p.id === activeId);
      const [movedItem] = sourceItems.splice(activeItemIndex, 1);

      destItems.push(movedItem);

      const newClusters = [...prev];
      newClusters[sourceClusterIndex] = {
        ...newClusters[sourceClusterIndex],
        pedidos: sourceItems,
      };
      newClusters[destClusterIndex] = {
        ...newClusters[destClusterIndex],
        pedidos: destItems,
      };

      return newClusters;
    });
  };

  const handleDragEnd = () => {
    setActivePedido(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] overflow-hidden">
      {/* HEADER DE ACCIONES REDISEÑADO */}
      <div className="bg-white border-b px-8 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gray-900 p-2.5 rounded-xl text-white shadow-lg shadow-gray-200">
            <LayoutPanelLeft size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Ajuste de Grupos Geográficos
            </h2>
            <p className="text-gray-400 text-xs flex items-center gap-1.5 font-medium">
              <Info size={14} className="text-blue-500" />
              Arrastra pedidos entre columnas para equilibrar las zonas de
              entrega.
            </p>
          </div>
        </div>

        <button
          onClick={() => onContinuarPaso2(clusters)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all active:scale-95 text-sm"
        >
          Confirmar y Calcular Rutas
        </button>
      </div>

      {/* ÁREA DE TRABAJO DIVIDIDA */}
      <div className="flex flex-1 overflow-hidden bg-white">
        {/* PANEL IZQUIERDO: VISOR DE MAPA PREMIUM */}
        <div className="hidden lg:block w-3/5 p-6 h-full">
          <div className="bg-gray-50 h-full rounded-[2.5rem] shadow-inner border-8 border-gray-50 overflow-hidden relative">
            <VisorMapa clusters={clusters} hoveredPedidoId={hoveredPedidoId} />
          </div>
        </div>

        {/* PANEL DERECHO: GESTIÓN (Drag and Drop) */}
        <div className="w-full lg:w-2/5 flex flex-col bg-gray-50/50 border-l border-gray-100">
          <div className="px-6 py-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
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
              <div className="flex gap-4 overflow-x-auto px-6 pb-8 h-full items-start scrollbar-thin scrollbar-thumb-gray-200">
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
                  <div className="w-72 rotate-3 shadow-2xl opacity-90">
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
