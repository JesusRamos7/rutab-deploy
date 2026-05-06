import { useState, useEffect, useCallback } from "react";
import { api } from "../../../config/api";
import { toast } from "sonner";

export interface FailedOrder {
  codigo_rastreo: string;
  descripcion: string;
  fecha: string;
  cliente: string;
  telefono: string;
  direccion: string;
  correo_cliente: string;
  codigo_cliente: string;
}

export const useFailedDeliveries = () => {
  const [orders, setOrders] = useState<FailedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false); // Nuevo estado para el botón

  const [past, setPast] = useState<FailedOrder[][]>([]);
  const [future, setFuture] = useState<FailedOrder[][]>([]);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<FailedOrder[]>("/failed-deliveries/list");
      setOrders(data);
      setPast([]);
      setFuture([]);
    } catch (error) {
      toast.error("Error al cargar los pedidos fallidos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeOrder = useCallback((codigo: string) => {
    setOrders((currentOrders) => {
      setPast((prevPast) => [...prevPast, currentOrders]);
      setFuture([]);
      return currentOrders.filter((o) => o.codigo_rastreo !== codigo);
    });
    toast.success("Pedido retirado de la lista");
  }, []);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prevFuture) => [orders, ...prevFuture]);
    setOrders(previous);
  }, [past, orders]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prevPast) => [...prevPast, orders]);
    setFuture(newFuture);
    setOrders(next);
  }, [future, orders]);

  // --- MODIFICADO PARA SER ASÍNCRONO ---
  const exportToCSV = async () => {
    if (orders.length === 0) return;

    try {
      setIsExporting(true); // Bloqueamos el botón mientras procesa

      // 1. Generar y descargar el CSV
      const headers = [
        "Codigo Rastreo",
        "Cliente",
        "Telefono",
        "Direccion",
        "Correo",
        "Descripcion",
        "Fecha",
      ];
      const rows = orders.map((o) => [
        o.codigo_rastreo,
        o.cliente,
        o.telefono,
        o.direccion.replace(/,/g, " "),
        o.correo_cliente,
        o.descripcion,
        new Date(o.fecha).toLocaleDateString(),
      ]);

      const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `pedidos_fallidos_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 2. Extraer los códigos para enviarlos al backend
      const codigosExtraidos = orders.map((o) => o.codigo_rastreo);

      // 3. Notificar al backend que estos pedidos ya fueron extraídos
      await api.patch("/failed-deliveries/mark-extracted", {
        codigos: codigosExtraidos,
      });

      toast.success("Archivo generado y pedidos marcados como extraídos");

      // 4. Recargar la lista (que ahora debería estar vacía o con los nuevos fallidos)
      await fetchOrders();
    } catch (error) {
      console.error(error);
      toast.error(
        "El archivo se generó, pero hubo un error al actualizar los estados en la base de datos.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    isExporting, // Exportamos el nuevo estado
    removeOrder,
    exportToCSV,
    fetchOrders,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
};
