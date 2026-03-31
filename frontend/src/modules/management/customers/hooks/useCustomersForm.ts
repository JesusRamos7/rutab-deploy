import { useState, useEffect, FormEvent } from "react";
import { Customer, CustomerFormData } from "../types";
import { CustomerService } from "../Customers.service";
import { toast } from "sonner";

const INITIAL_STATE: CustomerFormData = {
  nombre: "",
  telefono: "",
  correo: "",
  direccion: "",
  contacto: "",
  latitude: null,
  longitude: null,
  estatus: "Activo",
};

export const useCustomersForm = (
  customer: Customer | null | undefined,
  isOpen: boolean,
  onSuccess: () => void,
  onClose: () => void,
) => {
  const [formData, setFormData] = useState<CustomerFormData>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          nombre: customer.nombre || "",
          telefono: customer.telefono || "",
          correo: customer.correo || "",
          direccion: customer.direccion || "",
          contacto: customer.contacto || "",
          latitude: customer.latitude ?? null,
          longitude: customer.longitude ?? null,
          estatus: customer.estatus || "Activo",
        });
      } else {
        setFormData(INITIAL_STATE);
      }
    }
  }, [customer, isOpen]);

  // Manejador dinámico actualizado para aceptar números (coordenadas)
  const handleChange = (
    field: keyof CustomerFormData,
    value: string | number | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validación preventiva en el cliente
    if (
      !formData.direccion ||
      formData.latitude === null ||
      formData.longitude === null
    ) {
      toast.error("La dirección y las coordenadas son obligatorias");
      return;
    }

    setIsLoading(true);

    try {
      // Aseguramos que las coordenadas viajen como números al backend
      const payload = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
      };

      if (customer?.id) {
        await CustomerService.update(customer.id, payload);
        toast.success("Cliente actualizado correctamente");
      } else {
        await CustomerService.create(payload);
        toast.success("Cliente registrado exitosamente");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      // Capturamos el mensaje procesado por el servicio (handleNestError)
      toast.error(error.message || "Error al guardar el cliente");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    handleChange,
    handleSubmit,
  };
};
