// /mobile-app/frontend/src/features/routes/hooks/useRoutes.ts

import { useState } from 'react';
import { Alert } from 'react-native';
import { apiClient } from '../../../core/api/apiClient';
import { useAuth } from '../../../core/context/AuthContext';
import { LocationService } from '../../../core/services/locationService';

export const useRoutes = () => {
  const { logout } = useAuth();
  const [isStarting, setIsStarting] = useState(false);

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, salir', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

  /**
   * Muestra un Alert de confirmación antes de proceder a iniciar la jornada.
   */
  const handleStartRouteConfirmation = (rutaId: string, onSuccess: () => void) => {
    Alert.alert(
      '¿Comenzar Jornada?',
      'Se activará el rastreo GPS en segundo plano y se notificará el inicio del trayecto.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, comenzar',
          style: 'default',
          onPress: () => executeStartRoute(rutaId, onSuccess),
        },
      ]
    );
  };

  /**
   * Proceso interno: Llama al API y activa el tracking de GPS.
   */
  const executeStartRoute = async (rutaId: string, onSuccess: () => void) => {
    try {
      setIsStarting(true);

      // 1. Notificamos al servidor el cambio de estado de la ruta
      await apiClient.patch(`/mobile-app/routes/${rutaId}/start`);

      // 2. Intentamos iniciar el servicio de ubicación en segundo plano
      try {
        await LocationService.startTracking(rutaId);
      } catch (locationError: any) {
        Alert.alert(
          'Aviso de Ubicación',
          'La ruta inició, pero el GPS no pudo activarse. Por favor, verifica los permisos de ubicación "Siempre" en los ajustes de tu teléfono.'
        );
      }

      Alert.alert('¡Éxito!', 'La ruta ha comenzado correctamente.');
      onSuccess();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo iniciar la ruta';
      Alert.alert('Error', msg);
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * NUEVO: Finaliza formalmente la ruta.
   * Procesa el trayecto en el servidor y detiene el GPS en el móvil.
   */
  const handleFinishRoute = async (rutaId: string, onSuccess: () => void) => {
    try {
      setIsStarting(true); // Reutilizamos el estado de carga para el botón

      // 1. Backend: Compila puntos de Redis, genera el LineString y cierra la ruta en DB
      await apiClient.patch(`/mobile-app/routes/${rutaId}/finish`);

      // 2. Mobile: Detenemos el TaskManager y limpiamos el almacenamiento local de ubicación
      await LocationService.stopTracking();

      Alert.alert(
        '¡Ruta Finalizada!',
        'Tu trayecto ha sido guardado con éxito y el GPS se ha desactivado.'
      );

      onSuccess(); // Refresca para mostrar la pantalla de "Sin rutas" o "Ruta completada"
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se pudo finalizar la ruta';
      Alert.alert('Error', msg);
    } finally {
      setIsStarting(false);
    }
  };

  return {
    handleLogout,
    handleStartRouteConfirmation,
    handleFinishRoute, // <--- Nueva función expuesta
    isStarting,
  };
};
