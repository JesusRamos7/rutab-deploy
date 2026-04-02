import { useState, useEffect, useCallback, useMemo } from "react"; // Añadimos useMemo
import { toast } from "sonner";
import { Order } from "../types";
import { OrderService } from "../orders.service";

export const useOrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await OrderService.getAll();
      setOrders(data);
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un problema al cargar los pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // --- TRANSFORMACIÓN DE DATOS ---
  // Uso de useMemo para que no se recalculen en cada render, solo cuando 'orders' cambie
  const transformedOrders = useMemo(() => {
    return orders.map((order: any, index: number) => {
      const numeroPedido = (index + 1).toString().padStart(3, '0');
      const prioridades = ['Alta', 'Media', 'Baja'];
      const prioridadSimulada = prioridades[index % 3];

      return {
        ...order,
        id_generado: `PED-${numeroPedido}`,
        prioridad: prioridadSimulada,
      };
    });
  }, [orders]);

  // --- Lógica de Control ---
  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return {
    orders: transformedOrders, 
    isLoading,
    fetchOrders,
    isModalOpen,
    selectedOrder,
    openEditModal,
    closeModal,
  };
};