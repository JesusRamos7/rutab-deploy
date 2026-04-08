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

  // --- NUEVA LÓGICA DE CONFIRMACIÓN (UX Mejorada) ---
  // Función que se expone a la vista. Muestra un Alert antes de proceder.
  const handleStartRouteConfirmation = (rutaId: string, onSuccess: () => void) => {
    Alert.alert(
      '¿Comenzar Jornada?', // Título del mensaje (coincide con la imagen)
      'Se activará el rastreo GPS en segundo plano', // Mensaje descriptivo
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, comenzar',
          style: 'default',
          onPress: () => executeStartRoute(rutaId, onSuccess), // Solo llamamos al API si aceptan
        },
      ]
    );
  };

  // Función privada/interna que hace la llamada real al servidor (antes startRoute)
  const executeStartRoute = async (rutaId: string, onSuccess: () => void) => {
    try {
      setIsStarting(true);
      await apiClient.patch(`/mobile-app/routes/${rutaId}/start`);
      // Mostramos éxito después de que el API responde
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
    handleStartRouteConfirmation, // <--- Exponemos esta nueva función
    isStarting,
  };
};
