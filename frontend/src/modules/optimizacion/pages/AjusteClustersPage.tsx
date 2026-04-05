// /frontend/src/modules/optimizacion/pages/AjusteClustersPage.tsx

import { useState, useEffect } from "react";
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
} from "lucide-react";

import { ClusterResponse, PuntoPedido } from "../types/optimizacion.types";
import { ClusterColumn } from "../components/ClusterColumn";
import { PedidoCard } from "../components/PedidoCard";
import { VisorMapa } from "../components/VisorMapa";

interface Props {
  /** Sugerencia inicial de grupos proveniente del algoritmo */
  clustersIniciales: ClusterResponse[];
  /** Envía la distribución final de pedidos al siguiente paso */
  onContinuarPaso2: (clustersAjustados: ClusterResponse[]) => void;
  /** Retorna a la selección de vehículo */
  onVolver: () => void;
  /** Solicita al backend una nueva ejecución del algoritmo de clustering */
  onRegenerar: () => void;
  /** Indica si la petición de recalculo está en curso */
  isRegenerating: boolean;
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

/**
 * Página de ajuste manual de grupos.
 * Permite redistribuir pedidos entre rutas mediante Drag and Drop y visualización en tiempo real.
 */
export const AjusteClustersPage = ({
  clustersIniciales,
  onContinuarPaso2,
  onVolver,
  onRegenerar,
  isRegenerating,
}: Props) => {
  // Estado local para permitir la manipulación inmediata de los pedidos antes de persistir
  const [clusters, setClusters] =
    useState<ClusterResponse[]>(clustersIniciales);
  const [activePedido, setActivePedido] = useState<PuntoPedido | null>(null);
  const [hoveredPedidoId, setHoveredPedidoId] = useState<string | null>(null);

  /** * Sincroniza el estado local cuando el padre regenera los datos.
   * Evita que el usuario visualice datos obsoletos tras recalcular el algoritmo.
   */
  useEffect(() => {
    setClusters(clustersIniciales);
  }, [clustersIniciales]);

  // Configuración de interacción: se requiere un desplazamiento de 5px para iniciar el drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  /** Identifica el pedido que se está arrastrando para renderizar el overlay visual */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const pedido = clusters
      .flatMap((c) => c.pedidos)
      .find((p) => p.id === active.id);
    if (pedido) setActivePedido(pedido);
  };

  /** * Gestiona el movimiento de pedidos entre diferentes columnas (clusters).
   * Implementa una restricción de capacidad máxima de 20 pedidos por grupo.
   */
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

    // Validación de carga máxima antes de procesar el movimiento
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
      {/* Cabecera de control y acciones principales */}
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

          {/* Permite descartar los cambios manuales y volver a la sugerencia base del algoritmo */}
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

      {/* Área de trabajo dual: Mapa para contexto espacial y Listas para gestión lógica */}
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
              {/* Contenedor horizontal de columnas de clusters */}
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

              {/* Mantiene la previsualización del pedido mientras se mueve entre columnas */}
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
