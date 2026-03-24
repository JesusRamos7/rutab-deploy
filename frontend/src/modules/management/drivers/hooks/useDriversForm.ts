import { useState, useEffect, FormEvent } from "react";
import { Driver, DriverFormData } from "../types";
import {DriverService} from "../drivers.service";
import { toast } from "sonner";


const INITIAL_STATE: DriverFormData = {
    nombre: "",
    licencia: "",
    correo: "",
    password: "",
    telefono: "",
    foto_perfil_url: "",
};


export const useDriverForm = (
    driver: Driver | null | undefined,
    isOpen: boolean,
    onSuccess: () => void, 
    onClose: () => void,
) => {
    const [formData, setFormData] = useState<DriverFormData>(INITIAL_STATE);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (driver) {
            setFormData({
                nombre: driver.nombre || "",
                licencia: driver.licencia || "",
                correo: driver.correo || "",
                password: driver.password || "",
                telefono: driver.telefono || "",
                foto_perfil_url: driver.foto_perfil_url || "",
            });
        } else {
            setFormData(INITIAL_STATE);
        }
    }, [driver, isOpen]);

    /**
   * Actualizador dinámico de campos del formulario.
   * @param field - La propiedad de DriverFormData a modificar.
   * @param value - El nuevo valor capturado del evento.
   */
  const handleChange = (field: keyof DriverFormData, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        if (driver?.id) {
            await DriverService.update(driver.id, formData);
            toast.success("Chofer actualizado correctamente");
        } else {
            await DriverService.create(formData);
            toast.success("Chofer registrado exitosamente.");
        }
        onSuccess();
        onClose();
    } catch (error: any) {
        toast.error(error.message || "Error al guardar el chofer.");
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

