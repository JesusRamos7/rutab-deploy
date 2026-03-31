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
import { Map as MapIcon, Info } from "lucide-react";

import { ClusterResponse, PuntoPedido } from "../types/optimizacion.types";
import { ClusterColumn } from "../components/ClusterColumn";
import { PedidoCard } from "../components/PedidoCard";
import { VisorMapa } from "../components/VisorMapa";

interface Props {
  clustersIniciales: ClusterResponse[];
  onContinuarPaso2: (clustersAjustados: ClusterResponse[]) => void;
}

export const AjusteClustersPage = ({
  clustersIniciales,
  onContinuarPaso2,
}: Props) => {
  const [clusters, setClusters] =
    useState<ClusterResponse[]>(clustersIniciales);
  const [activePedido, setActivePedido] = useState<PuntoPedido | null>(null);

  // Configuración de sensores para ratón y teclado
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

    // REGLA DE NEGOCIO: Límite de 20 pedidos por cluster
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
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* HEADER DE ACCIONES */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <MapIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Ajuste de Grupos Geográficos
            </h2>
            <p className="text-gray-500 text-xs flex items-center gap-1">
              <Info size={12} />
              Los cambios en las columnas se reflejan automáticamente en el
              mapa.
            </p>
          </div>
        </div>

        <button
          onClick={() => onContinuarPaso2(clusters)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
        >
          Confirmar y Calcular Rutas
        </button>
      </div>

      {/* ÁREA DE TRABAJO DIVIDIDA */}
      <div className="flex flex-1 overflow-hidden bg-gray-100">
        {/* PANEL IZQUIERDO: VISUALIZACIÓN (Solo Desktop) */}
        <div className="hidden lg:block w-1/2 p-4 h-full">
          <div className="bg-white h-full rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            <VisorMapa clusters={clusters} />
          </div>
        </div>

        {/* PANEL DERECHO: GESTIÓN (Drag and Drop) */}
        <div className="w-full lg:w-1/2 p-4 overflow-hidden flex flex-col">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
              {clusters.map((cluster) => (
                <ClusterColumn key={cluster.clusterId} cluster={cluster} />
              ))}
            </div>

            {/* Overlay para mantener el diseño mientras se arrastra */}
            <DragOverlay dropAnimation={null}>
              {activePedido ? (
                <div className="w-72 rotate-3 shadow-2xl">
                  <PedidoCard pedido={activePedido} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};
