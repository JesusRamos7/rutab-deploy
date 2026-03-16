// vehiculos.service.ts
import { VehiculoFormData } from "../types";

const API_URL = "http://localhost:3000/vehiculos";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const vehiculosService = {
  
  create: async (data: VehiculoFormData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        rendimiento_combustible: parseFloat(data.rendimiento_combustible) || 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al crear el vehículo");
    }
    return response.json();
  },

  update: async (id: string | number, data: VehiculoFormData) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...data,
        rendimiento_combustible: parseFloat(data.rendimiento_combustible) || 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al actualizar el vehículo");
    }
    return response.json();
  },


  getAll: async () => {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener los vehículos");
    return response.json();
  },

  delete: async (id: string | number) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar el vehículo");

    // Algunos backends no devuelven body en un DELETE (204 No Content)
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  },
  
};
