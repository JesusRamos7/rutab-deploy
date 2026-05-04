// /mobile-app/frontend/src/features/routes/hooks/useFetchRoutes.ts

import { useState, useEffect, useCallback } from 'react';
import { apiClient, getErrorMessage } from '../../../core/api/apiClient';

export const useFetchRoutes = () => {
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveRoute = useCallback(async () => {
    let isMounted = true;

    try {
      setLoading(true);
      setError(null);

      // Consumimos el endpoint de rutas activas
      const response = await apiClient.get('/mobile-app/routes/active');

      if (isMounted) {
        setRouteData(response.data);
      }
    } catch (err: any) {
      if (isMounted) {
        // Usamos el helper global que ya normaliza arrays y errores de red
        const message = getErrorMessage(err);

        // Manejo específico: Si es 404, no siempre es un "error crítico",
        // puede ser simplemente que no tiene trabajo asignado aún.
        if (err.response?.status === 404) {
          setError(message);
          setRouteData(null);
        } else {
          setError(`Fallo de conexión: ${message}`);
        }
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Ejecución inicial
    fetchActiveRoute();
  }, [fetchActiveRoute]);

  return {
    routeData,
    loading,
    error,
    refresh: fetchActiveRoute,
  };
};
