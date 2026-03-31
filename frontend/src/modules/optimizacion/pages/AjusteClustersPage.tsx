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
import { ClusterResponse, PuntoPedido } from "../types/optimizacion.types";
import { ClusterColumn } from "../components/ClusterColumn";
import { PedidoCard } from "../components/PedidoCard";

// Props temporales simulando la entrada desde la vista anterior (Selección de Vehículo)
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

    // Si soltamos sobre una columna directamente o sobre un item de otra columna
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
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Ajuste de Grupos Geográficos
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Revisa los grupos sugeridos. Puedes arrastrar pedidos entre columnas
            si lo consideras necesario.
          </p>
        </div>
        <button
          onClick={() => onContinuarPaso2(clusters)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Confirmar y Calcular Rutas
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {clusters.map((cluster) => (
            <ClusterColumn key={cluster.clusterId} cluster={cluster} />
          ))}
        </div>

        {/* Overlay para mantener el diseño mientras se arrastra */}
        <DragOverlay>
          {activePedido ? <PedidoCard pedido={activePedido} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
