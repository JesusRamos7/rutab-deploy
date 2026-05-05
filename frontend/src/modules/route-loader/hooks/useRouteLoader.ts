// /src/modules/route-loader/hooks/useRouteLoaderPage.tsx

import { useState } from "react";
import { api } from "../../../config/api";
import { toast } from "sonner";

export const useRouteLoader = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, endpoint: string) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const { data } = await api.post(`/route-loader/${endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`Carga exitosa: ${data.count} registros procesados.`);
      return true;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Error al procesar el archivo";
      toast.error(errorMsg);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
