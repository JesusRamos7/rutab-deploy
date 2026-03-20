// src/modules/management/vehicles/vehicles.service.ts

import { isAxiosError } from "axios";
import { api } from "../../../config/api";
import { VehicleFormData } from "./types";

/** Punto de entrada principal para el recurso de vehículos en la API */
const ENDPOINT = "/vehicles";

/**
 * Procesador central de excepciones para respuestas de NestJS.
 * Normaliza errores de validación (class-validator) y códigos de estado HTTP
 * para convertirlos en mensajes legibles por la interfaz de usuario.
 */
const handleNestError = (error: unknown) => {
  if (isAxiosError(error) && error.response) {
    const data = error.response.data;

    // NestJS puede devolver el mensaje en 'message' (array o string) o 'error'
    const message = data.message || data.error || error.response.statusText;
    const finalMessage = Array.isArray(message) ? message.join(", ") : message;

    // Gestión específica para restricciones de Guardia (RBAC) o Policies
    if (error.response.status === 403) {
      throw new Error(
        "No tienes permisos suficientes para realizar esta acción.",
      );
    }

    throw new Error(finalMessage || "Error en la petición al servidor");
  }
  throw new Error("Error de conexión con el servidor");
};

/**
 * Capa de servicio para operaciones CRUD de vehículos.
 * Implementa la comunicación asíncrona y la transformación de datos para el backend.
 */
export const VehicleService = {
  /** Recupera el listado completo de unidades registradas */
  getAll: async () => {
    try {
      const { data } = await api.get(ENDPOINT);
      return data;
    } catch (error) {
      handleNestError(error);
    }
  },

  /** * Registra una nueva unidad.
   * Realiza el parseo del rendimiento a número decimal antes del envío.
   */
  create: async (formData: VehicleFormData) => {
    try {
      const { data } = await api.post(ENDPOINT, {
        ...formData,
        // Sincronización de tipo: el backend espera un float/number
        rendimiento_combustible:
          parseFloat(formData.rendimiento_combustible) || 0,
      });
      return data;
    } catch (error) {
      handleNestError(error);
    }
  },

  /** * Actualiza parcialmente un registro existente mediante PATCH.
   */
  update: async (id: string | number, formData: VehicleFormData) => {
    try {
      const { data } = await api.patch(`${ENDPOINT}/${id}`, {
        ...formData,
        rendimiento_combustible:
          parseFloat(formData.rendimiento_combustible) || 0,
      });
      return data;
    } catch (error) {
      handleNestError(error);
    }
  },

  /** Elimina un registro de vehículo del sistema */
  delete: async (id: string | number) => {
    try {
      const { data } = await api.delete(`${ENDPOINT}/${id}`);
      return data;
    } catch (error) {
      handleNestError(error);
    }
  },
};
