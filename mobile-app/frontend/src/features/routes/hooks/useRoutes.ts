// mobile-app/frontend/src/features/routes/hooks/useRoutes.ts

import { useState } from 'react';
import { Alert } from 'react-native';
import { apiClient } from '../../../core/api/apiClient';
import { useAuth } from '../../../core/context/AuthContext';

export const useRoutes = () => {
  const { logout } = useAuth();
  const [isStarting, setIsStarting] = useState(false);

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, salir', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

  // Función para cambiar el estado de la ruta en el servidor
  const startRoute = async (rutaId: string, onSuccess: () => void) => {
    try {
      setIsStarting(true);
      await apiClient.patch(`/mobile-app/routes/${rutaId}/start`);
      Alert.alert('¡Éxito!', 'La ruta ha comenzado. El seguimiento GPS está activo.');
      onSuccess(); // Refrescar los datos de la ruta
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo iniciar la ruta';
      Alert.alert('Error', msg);
    } finally {
      setIsStarting(false);
    }
  };

  return {
    handleLogout,
    startRoute,
    isStarting,
  };
};
