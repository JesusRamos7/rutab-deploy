// mobile-app/frontend/src/features/routes/screens/RoutesScreen.tsx

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RoutesStackParamList } from '../../../navigation/navigation-types';
import { useFetchRoutes } from '../hooks/useFetchRoutes';
import { useRoutes } from '../hooks/useRoutes';

// Sub-componentes modularizados
import { RoutesLoadingView } from '../components/RoutesLoadingView';
import { RoutesErrorView } from '../components/RoutesErrorView';
import { RoutesCompletedView } from '../components/RoutesCompletedView';
import { RouteHeader } from '../components/RouteHeader';
import { PedidoCard } from '../components/PedidoCard';

export const RoutesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RoutesStackParamList>>();
  const { routeData, loading, error, refresh } = useFetchRoutes();
  const {
    handleStartRouteConfirmation,
    handleFinishRoute,
    handleAbrirMaps,
    handlePressEntrega,
    checkProximitySilently,
    handleReportFailedRoute,
    validatedPedidoId,
    isCheckingLocation,
    isStarting,
    isReporting,
  } = useRoutes();

  // EFECTOS
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useFocusEffect(
    useCallback(() => {
      // Validación segura antes de acceder al índice [0]
      const pedidos = routeData?.pedidos;
      if (
        routeData?.estatus_ruta === 'en_proceso' &&
        Array.isArray(pedidos) &&
        pedidos.length > 0
      ) {
        checkProximitySilently(pedidos[0]);
      }
    }, [routeData, checkProximitySilently])
  );

  // MANEJADORES LOCALES
  const handleComenzarRuta = () => {
    if (routeData?.id) handleStartRouteConfirmation(routeData.id, refresh);
  };

  // RENDERIZADO CONDICIONAL DE ESTADOS
  if (loading) return <RoutesLoadingView />;
  if (error) return <RoutesErrorView error={error} onRefresh={refresh} />;

  // Si por alguna anomalía el backend devuelve 200 OK pero routeData es null
  if (!routeData) {
    return (
      <RoutesErrorView
        error="No se encontró información de la ruta. Por favor, actualiza la pantalla."
        onRefresh={refresh}
      />
    );
  }

  // Evaluaciones seguras
  const isInProgress = routeData.estatus_ruta === 'en_proceso';
  const pedidosArray = Array.isArray(routeData.pedidos) ? routeData.pedidos : [];
  const hasNoPedidos = pedidosArray.length === 0;

  // ESTADO: Ruta terminada / Sin pedidos restantes
  if (hasNoPedidos && isInProgress) {
    return (
      <RoutesCompletedView
        onFinish={() => handleFinishRoute(routeData.id, refresh)}
        onRefresh={refresh}
        isStarting={isStarting}
      />
    );
  }

  // PANTALLA PRINCIPAL
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} colors={['#123a5d']} />
        }>
        <RouteHeader
          placas={routeData?.vehiculos?.placas}
          pedidosCount={pedidosArray.length}
          isInProgress={isInProgress}
          isStarting={isStarting}
          onStartRoute={handleComenzarRuta}
        />

        <View className="-mt-6 px-6">
          {!isInProgress && (
            <View className="mb-4 items-center rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <Text className="text-center text-xs font-medium text-amber-700">
                Debes iniciar la ruta para poder navegar y registrar evidencias.
              </Text>
            </View>
          )}

          {/* Renderizado defensivo: mapeo seguro asegurando que usamos pedidosArray */}
          {pedidosArray.map((pedido: any, index: number) => (
            <PedidoCard
              key={pedido.pedidoId || index.toString()} // Fallback de key por seguridad
              pedido={pedido}
              index={index}
              isInProgress={isInProgress}
              isCheckingLocation={isCheckingLocation}
              isValidated={validatedPedidoId === pedido.pedidoId}
              onPressMaps={handleAbrirMaps}
              onPressDelivery={(p) => handlePressEntrega(p, navigation)}
            />
          ))}

          {/* Botón de ruta fallida por falta de tiempo al final de la lista */}
          {isInProgress && pedidosArray.length > 0 && (
            <TouchableOpacity
              onPress={() => handleReportFailedRoute(routeData.id, refresh)}
              disabled={isReporting}
              className="mb-6 mt-6 flex-row items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <View className="flex-1 flex-row items-center">
                {isReporting ? (
                  <ActivityIndicator color="#dc2626" className="mr-3" />
                ) : (
                  <MaterialCommunityIcons name="clock-alert-outline" size={28} color="#dc2626" />
                )}
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-red-700">¿El día no fue suficiente?</Text>
                  <Text className="mt-0.5 text-xs text-red-600/80">
                    Reportar fin de jornada y pedidos no entregados
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#dc2626" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
