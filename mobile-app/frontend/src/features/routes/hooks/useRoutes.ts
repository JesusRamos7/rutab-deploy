// /mobile-app/frontend/src/features/routes/hooks/useRoutes.ts

import { useState } from 'react';
import { Alert, Linking } from 'react-native'; // <-- Añadimos Linking
import * as Location from 'expo-location';
import { apiClient } from '../../../core/api/apiClient';
import { useAuth } from '../../../core/context/AuthContext';
import { LocationService, getDistance } from '../../../core/services/locationService';
import { RoutesRoutes } from '../../../navigation/navigation-types'; // <-- Importa tus constantes de ruta

export const useRoutes = () => {
  const { logout } = useAuth();
  const [isStarting, setIsStarting] = useState(false);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const [validatedPedidoId, setValidatedPedidoId] = useState<string | null>(null);

  const PROXIMITY_THRESHOLD = 150;

  // --- LÓGICA DE MAPAS MOVIDA AQUÍ ---
  const handleAbrirMaps = (lat: number, lng: number) => {
    const url = `http://maps.google.com/?q=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    });
  };

  // --- LÓGICA DE ENTREGA MOVIDA AQUÍ ---
  const handlePressEntrega = async (pedido: any, navigation: any) => {
    const isNear = await validateProximity(pedido.pedidoId, pedido.latitude, pedido.longitude);

    if (isNear) {
      navigation.navigate(RoutesRoutes.DELIVERY_EVIDENCE, {
        pedidoId: pedido.pedidoId,
        cliente: pedido.cliente,
      });
    } else {
      Alert.alert(
        'Acceso Restringido',
        'Te has alejado del punto de entrega. Por seguridad, debes estar en el domicilio del cliente para continuar.'
      );
    }
  };

  /**
   * Validación ultra rápida de proximidad
   */
  const validateProximity = async (
    pedidoId: string,
    clientLat: number,
    clientLng: number
  ): Promise<boolean> => {
    try {
      setIsCheckingLocation(true);

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Se requiere GPS para habilitar la entrega.');
        return false;
      }

      // Usamos getLastKnownPositionAsync para que sea instantáneo y no sufra el lag de 20s
      let location = await Location.getLastKnownPositionAsync();

      if (!location) {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      const distance = getDistance(
        location.coords.latitude,
        location.coords.longitude,
        clientLat,
        clientLng
      );

      const isNear = distance <= PROXIMITY_THRESHOLD;

      // --- LÓGICA DE RE-VALIDACIÓN ---
      if (isNear) {
        setValidatedPedidoId(pedidoId); // Desbloquea (Botón Negro)
      } else {
        setValidatedPedidoId(null); // Bloquea de nuevo si se alejó (Botón Gris)
      }

      return isNear;
    } catch (error) {
      console.error('Error GPS:', error);
      return false;
    } finally {
      setIsCheckingLocation(false);
    }
  };

  /**
   * Función para verificar proximidad de forma silenciosa (para el OnFocus)
   */
  const checkProximitySilently = async (pedido: any) => {
    if (!pedido) return;

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getLastKnownPositionAsync();
      if (!location) return;

      const distance = getDistance(
        location.coords.latitude,
        location.coords.longitude,
        pedido.latitude,
        pedido.longitude
      );

      if (distance <= PROXIMITY_THRESHOLD) {
        setValidatedPedidoId(pedido.pedidoId);
      } else {
        setValidatedPedidoId(null);
      }
    } catch (e) {
      // Silencioso, no queremos alertas aquí
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, salir', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

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

  const executeStartRoute = async (rutaId: string, onSuccess: () => void) => {
    try {
      setIsStarting(true);
      await apiClient.patch(`/mobile-app/routes/${rutaId}/start`);
      try {
        await LocationService.startTracking(rutaId);
      } catch (locationError: any) {
        Alert.alert('Aviso de Ubicación', 'La ruta inició, pero el GPS no pudo activarse.');
      }
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo iniciar la ruta');
    } finally {
      setIsStarting(false);
    }
  };

  const handleFinishRoute = async (rutaId: string, onSuccess: () => void) => {
    try {
      setIsStarting(true);
      await apiClient.patch(`/mobile-app/routes/${rutaId}/finish`);
      await LocationService.stopTracking();
      Alert.alert('¡Ruta Finalizada!', 'Trayecto guardado con éxito.');
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo finalizar la ruta');
    } finally {
      setIsStarting(false);
    }
  };

  return {
    handleLogout,
    handleStartRouteConfirmation,
    handleFinishRoute,
    handleAbrirMaps,
    handlePressEntrega,
    checkProximitySilently,
    validatedPedidoId,
    isCheckingLocation,
    isStarting,
  };
};
