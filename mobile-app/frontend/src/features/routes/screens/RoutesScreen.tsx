// /mobile-app/frontend/src/features/routes/screens/RoutesScreen.tsx

import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Imports para Animaciones
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';

import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';
import { useFetchRoutes } from '../hooks/useFetchRoutes';
import { useRoutes } from '../hooks/useRoutes';

export const RoutesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RoutesStackParamList>>();
  const { routeData, loading, error, refresh } = useFetchRoutes();
  const {
    handleStartRouteConfirmation,
    handleFinishRoute,
    validateProximity,
    checkProximitySilently,
    isCheckingLocation,
    validatedPedidoId,
    isStarting,
  } = useRoutes();

  // --- LÓGICA DE ANIMACIONES ---
  const errorOpacity = useSharedValue(0);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    if (error) {
      errorOpacity.value = withTiming(1, { duration: 600 });
      iconScale.value = withRepeat(
        withTiming(1.15, { duration: 800, easing: Easing.bezier(0.42, 0, 0.58, 1) }),
        -1,
        true
      );
    } else {
      errorOpacity.value = withTiming(0, { duration: 300 });
      iconScale.value = 1;
    }
  }, [error]);

  const animatedErrorStyle = useAnimatedStyle(() => {
    return {
      opacity: errorOpacity.value,
      transform: [{ translateY: interpolate(errorOpacity.value, [0, 1], [20, 0]) }],
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    };
  });

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // EFECTO DE AUTO-COMPROBACIÓN AL GANAR FOCO
  useFocusEffect(
    useCallback(() => {
      // Si hay una ruta en proceso y hay pedidos, comprobamos el primero automáticamente
      if (routeData?.estatus_ruta === 'en_proceso' && routeData?.pedidos?.length > 0) {
        checkProximitySilently(routeData.pedidos[0]);
      }
    }, [routeData, checkProximitySilently])
  );

  const handleComenzarRuta = () => {
    if (routeData?.id) {
      handleStartRouteConfirmation(routeData.id, refresh);
    }
  };

  const handleAbrirMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    });
  };

  const handlePressEntrega = async (pedido: any) => {
    // ELIMINAMOS EL SHORTCUT: Siempre validamos al presionar, no importa el estado previo.
    const isNear = await validateProximity(pedido.pedidoId, pedido.latitude, pedido.longitude);

    if (isNear) {
      navigation.navigate(RoutesRoutes.DELIVERY_EVIDENCE, {
        pedidoId: pedido.pedidoId,
        cliente: pedido.cliente,
      });
    } else {
      // Si se alejó, el hook ya puso el botón en gris, y aquí lanzamos la advertencia.
      Alert.alert(
        'Acceso Restringido',
        'Te has alejado del punto de entrega. Por seguridad, debes estar en el domicilio del cliente para continuar.'
      );
    }
  };

  // --- PRIORIDAD 1: CARGANDO (Elimina el parpadeo al reintentar) ---
  // Si loading es true, no mostramos nada más, independientemente de si hay routeData o no.
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#123a5d" />
        <Text className="mt-4 font-medium text-gray-500">Actualizando información...</Text>
      </View>
    );
  }

  // --- PRIORIDAD 2: ERROR ---
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-10">
        <Animated.View style={[animatedErrorStyle, { alignItems: 'center' }]}>
          <Animated.View style={animatedIconStyle}>
            <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#9CA3AF" />
          </Animated.View>
          <Text className="mt-6 text-center text-xl font-bold text-gray-700">Algo salió mal</Text>
          <Text className="mt-2 text-center text-gray-500">{error}</Text>
          <TouchableOpacity
            onPress={refresh}
            className="mt-8 rounded-2xl bg-primary px-10 py-4 shadow-lg shadow-primary/30 active:scale-95">
            <Text className="text-lg font-bold text-white">Reintentar Búsqueda</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  // --- PRIORIDAD 3: RUTA COMPLETADA (ACCIONES DE CIERRE) ---
  if (routeData && routeData.pedidos?.length === 0 && routeData.estatus_ruta === 'en_proceso') {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-10">
          <View className="shadow-inner mb-6 rounded-full bg-green-100 p-8">
            <MaterialCommunityIcons name="flag-checkered" size={60} color="#15803d" />
          </View>
          <Text className="text-center text-2xl font-black text-dark">¡Entregas Finalizadas!</Text>
          <Text className="mt-4 text-center text-base leading-6 text-gray-500">
            Has completado todos los pedidos de tu lista. Debes finalizar la jornada para procesar
            tu trayecto y desactivar el GPS.
          </Text>

          <TouchableOpacity
            onPress={() => routeData.id && handleFinishRoute(routeData.id, refresh)}
            disabled={isStarting}
            className="mt-12 w-full flex-row items-center justify-center rounded-3xl bg-dark py-5 shadow-xl shadow-black/20 active:scale-95">
            {isStarting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="stop-circle" size={24} color="white" />
                <Text className="ml-2 text-lg font-bold uppercase tracking-tighter text-white">
                  Finalizar Jornada Oficialmente
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={refresh} className="mt-6 p-2">
            <Text className="font-bold text-gray-400">Actualizar datos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isInProgress = routeData?.estatus_ruta === 'en_proceso';

  // --- PRIORIDAD 4: LISTA DE PEDIDOS ---
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} colors={['#123a5d']} />
        }>
        {/* Header Informativo */}
        <View className="bg-primary px-6 pb-12 pt-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-white/70">
            Vehículo: {routeData?.vehiculos?.placas || 'N/A'}
          </Text>
          <Text className="mt-1 text-2xl font-bold text-white">
            {routeData?.pedidos?.length || 0} Entregas Pendientes
          </Text>

          {!isInProgress && (
            <TouchableOpacity
              onPress={handleComenzarRuta}
              disabled={isStarting}
              className="mt-6 flex-row items-center justify-center rounded-2xl bg-white py-4 shadow-xl active:opacity-90">
              {isStarting ? (
                <ActivityIndicator color="#123a5d" />
              ) : (
                <>
                  <MaterialCommunityIcons name="play-circle" size={24} color="#123a5d" />
                  <Text className="ml-2 text-lg font-black text-primary">COMENZAR RUTA</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View className="-mt-6 px-6">
          {!isInProgress && (
            <View className="mb-4 items-center rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <Text className="text-center text-xs font-medium text-amber-700">
                Debes iniciar la ruta para poder navegar y registrar evidencias.
              </Text>
            </View>
          )}

          {routeData?.pedidos.map((pedido: any, index: number) => {
            const isFirst = index === 0;
            const canInteract = isInProgress && isFirst;

            // EL BOTÓN ES NEGRO SOLO SI YA SE VALIDÓ
            const isAlreadyValidated = validatedPedidoId === pedido.pedidoId;

            return (
              <View
                key={pedido.pedidoId}
                className={`mb-4 rounded-3xl border p-5 shadow-sm ${
                  canInteract
                    ? 'border-primary/20 bg-white shadow-primary/10'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                }`}>
                <View className="mb-3 flex-row items-start justify-between">
                  <View
                    className={`rounded-full px-3 py-1 ${canInteract ? 'bg-primary' : 'bg-gray-400'}`}>
                    <Text className="text-[10px] font-bold uppercase text-white">
                      Parada {pedido.orden}
                    </Text>
                  </View>
                  <Text className="font-mono text-[10px] text-gray-400">
                    {pedido.pedidoId.split('-')[0]}...
                  </Text>
                </View>

                <View className="mb-4 flex-row items-center">
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-2xl ${canInteract ? 'bg-primary/10' : 'bg-gray-200'}`}>
                    <MaterialCommunityIcons
                      name={canInteract ? 'truck-fast' : 'package-variant-closed'}
                      size={24}
                      color={canInteract ? '#123a5d' : '#9CA3AF'}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-bold leading-5 text-dark">{pedido.cliente}</Text>
                    <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
                      {pedido.direccion}
                    </Text>
                  </View>
                </View>

                {canInteract && (
                  <View className="mt-2 flex-row space-x-3">
                    <TouchableOpacity
                      onPress={() => handleAbrirMaps(pedido.latitude, pedido.longitude)}
                      className="flex-1 flex-row items-center justify-center rounded-2xl bg-primary py-4 shadow-lg shadow-primary/20 active:opacity-90">
                      <MaterialCommunityIcons name="google-maps" size={20} color="white" />
                      <Text className="ml-2 font-bold text-white">Navegar</Text>
                    </TouchableOpacity>

                    {/* BOTÓN DE CÁMARA */}
                    <TouchableOpacity
                      onPress={() => handlePressEntrega(pedido)}
                      disabled={isCheckingLocation}
                      // DINAMISMO DE COLOR: Gris si no se ha validado, Negro (bg-dark) si sí.
                      className={`min-w-[75px] items-center justify-center rounded-2xl px-6 ${
                        isAlreadyValidated ? 'bg-dark' : 'bg-gray-400'
                      }`}>
                      {isCheckingLocation ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <MaterialCommunityIcons
                          name={isAlreadyValidated ? 'camera-plus' : 'map-marker-check'}
                          size={24}
                          color="white"
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {/* Texto dinámico según el estado */}
                {canInteract && (
                  <View
                    className={`mt-4 flex-row items-center justify-center rounded-2xl border px-4 py-3 ${
                      isAlreadyValidated
                        ? 'border-green-100 bg-green-50'
                        : 'border-blue-100 bg-blue-50'
                    }`}>
                    <MaterialCommunityIcons
                      name={isAlreadyValidated ? 'check-decagram' : 'information-outline'}
                      size={16}
                      color={isAlreadyValidated ? '#16a34a' : '#123a5d'}
                    />

                    <Text
                      className={`ml-2 text-[11px] font-bold uppercase tracking-tight ${
                        isAlreadyValidated ? 'text-green-700' : 'text-primary'
                      }`}>
                      {isAlreadyValidated ? (
                        <>
                          Ubicación confirmada. Presiona el icono de{' '}
                          <MaterialCommunityIcons name="camera-plus" size={12} /> para entregar
                        </>
                      ) : (
                        <>
                          Presiona el icono de{' '}
                          <MaterialCommunityIcons name="map-marker-check" size={12} /> para validar
                          tu llegada
                        </>
                      )}
                    </Text>
                  </View>
                )}

                {!canInteract && (
                  <View className="mt-2 flex-row items-center border-t border-gray-100 pt-3">
                    <MaterialCommunityIcons
                      name={!isInProgress ? 'play-circle-outline' : 'lock'}
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text className="ml-2 text-[11px] font-medium italic text-gray-400">
                      {!isInProgress
                        ? 'Inicia la jornada para desbloquear'
                        : 'Completa la entrega anterior para continuar'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
