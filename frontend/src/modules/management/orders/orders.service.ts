import { isAxiosError } from "axios";
import { api } from "../../../config/api";
import { OrderFormData } from "./types";

const ENDPOINT = "/orders";

const handleNestError = (error: unknown) => {
    if(isAxiosError(error) && error.response) {
        const data = error.response.data;

        const message = data.message || data.error || error.response.statusText;
        const finalMessage = Array.isArray(message) ? message.join(" ,") : message;

        if (error.response.status === 403) {
            throw new Error(
                "No tienes permisos suficientes para realizar esta acción.",
            );
        }

        throw new Error(finalMessage || "Error en la petición al servidor.");
    }
    throw new Error("Error de conexión con el servidor");
};

export const OrderService = {
    getAll: async () => {
        try {
            const { data } = await api.get(ENDPOINT);
            return data;
        } catch (error) {
            handleNestError(error);
        }
    },

    create: async (FormData: OrderFormData) => {
        try {
            const { data } = await api.post(ENDPOINT, {
                ...FormData,
                cliente_id: FormData.cliente_id,
            });
            return data;
        } catch (error) {
            handleNestError(error);
        }
    },

    update: async (id: string, formData: OrderFormData) => {
        try {
            const { data } = await api.patch(`${ENDPOINT}/${id}`, {
                ...formData,
                cliente_id: formData.cliente_id,
            });
            return data;
        } catch (error) {
            handleNestError(error);
        }
    },

    delete: async (id: string) => {
        try {
            const { data } = await api.delete(`${ENDPOINT}/${id}`);
            return data;
        } catch (error) {
            handleNestError(error);
        }
    },
};



