import { useState, useEffect, FormEvent } from "react";
import { Order, OrderFormData } from "../types";
import { OrderService } from "../orders.service";
import { toast } from "sonner";

const INITIAL_STATE: OrderFormData = {
    cliente_id: "",
    descripcion_carga: "",
    codigo_rastreo: "",
    estado_pedido: "",
};

export const useOrderForm = (
    order: Order | null | undefined,
    isOpen: boolean,
    onSuccess: () => void,
    onClose: () => void,
) => {
    const [formData, setFormData] = useState<OrderFormData>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (order) {
            setFormData({
                cliente_id       : order.cliente_id || "",
                descripcion_carga: order.descripcion_carga || "",
                codigo_rastreo   : order.codigo_rastreo || "",
                estado_pedido    : order.estado_pedido || "",
            });
        } else {
            setFormData(INITIAL_STATE);
        }
    }, [order, isOpen]);

    const handleChange = (field: keyof OrderFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // Función para actualizar los datos editables (Estado, Descripción, etc.)
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!order?.id) return;

        setIsLoading(true);
        try {
            await OrderService.update(order.id, formData);
            toast.success("Pedido actualizado exitosamente.");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar el pedido.");
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * handleCancelOrder
     * Realiza el "borrado lógico" cambiando el estado a 'Cancelado'.
     */
    const handleCancelOrder = async () => {
        if (!order?.id) return;

        setIsLoading(true);
        try {
            // Enviamos solo el cambio de estado
            await OrderService.update(order.id, { 
                ...formData, 
                estado_pedido: "Cancelado" 
            });
            
            toast.success("El pedido ha sido cancelado y ya no será visible.");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "No se pudo cancelar el pedido.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        isLoading,
        handleChange,
        handleSubmit,
        handleCancelOrder, 
    };
};