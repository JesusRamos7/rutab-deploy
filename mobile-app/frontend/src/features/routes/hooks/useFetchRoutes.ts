import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../../core/api/apiClient';

export const useFetchRoutes = () => {
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveRoute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Consumimos el endpoint que acabamos de crear en el backend
      const response = await apiClient.get('/mobile-app/routes/active');
      setRouteData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo cargar la ruta');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveRoute();
  }, [fetchActiveRoute]);

  return { routeData, loading, error, refresh: fetchActiveRoute };
};
