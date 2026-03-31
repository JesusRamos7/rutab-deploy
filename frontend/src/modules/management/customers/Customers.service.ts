import { isAxiosError } from "axios";
import { api } from "../../../config/api";
import { Customer, CreateCustomerDto, UpdateCustomerDto } from "./types";

const ENDPOINT = "/customers";

const handleNestError = (error: unknown) => {
  if (isAxiosError(error) && error.response) {
    const data = error.response.data;

    // Captura los mensajes de class-validator (que suelen venir como array)
    const message = data.message || data.error || error.response.statusText;
    const finalMessage = Array.isArray(message) ? message.join(", ") : message;

    if (error.response.status === 403) {
      throw new Error(
        "No tienes permisos suficientes para realizar esta acción.",
      );
    }

    throw new Error(finalMessage || "Error en la petición al servidor");
  }
  throw new Error("Error de conexión con el servidor");
};

export const CustomerService = {
  getAll: async (): Promise<Customer[]> => {
    try {
      const { data } = await api.get<Customer[]>(ENDPOINT);
      return data;
    } catch (error) {
      throw handleNestError(error);
    }
  },

  create: async (formData: CreateCustomerDto): Promise<Customer> => {
    try {
      const { data } = await api.post<Customer>(ENDPOINT, formData);
      return data;
    } catch (error) {
      throw handleNestError(error);
    }
  },

  update: async (
    id: string,
    formData: UpdateCustomerDto,
  ): Promise<Customer> => {
    try {
      const { data } = await api.patch<Customer>(`${ENDPOINT}/${id}`, formData);
      return data;
    } catch (error) {
      throw handleNestError(error);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${ENDPOINT}/${id}`);
    } catch (error) {
      throw handleNestError(error);
    }
  },
};
