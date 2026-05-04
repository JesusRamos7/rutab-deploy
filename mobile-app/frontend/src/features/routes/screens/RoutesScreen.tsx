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
    handleReportFailedRoute, // <-- NUEVO: Función para reportar
    validatedPedidoId,
    isCheckingLocation,
    isStarting,
    isReporting, // <-- NUEVO: Estado de carga
  } = useRoutes();

  // EFECTOS
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useFocusEffect(
    useCallback(() => {
      if (routeData?.estatus_ruta === 'en_proceso' && routeData?.pedidos?.length > 0) {
        checkProximitySilently(routeData.pedidos[0]);
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

  const isInProgress = routeData?.estatus_ruta === 'en_proceso';
  const hasNoPedidos = routeData?.pedidos?.length === 0;

  if (routeData && hasNoPedidos && isInProgress) {
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
          pedidosCount={routeData?.pedidos?.length || 0}
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

          {routeData?.pedidos.map((pedido: any, index: number) => (
            <PedidoCard
              key={pedido.pedidoId}
              pedido={pedido}
              index={index}
              isInProgress={isInProgress}
              isCheckingLocation={isCheckingLocation}
              isValidated={validatedPedidoId === pedido.pedidoId}
              onPressMaps={handleAbrirMaps}
              onPressDelivery={(p) => handlePressEntrega(p, navigation)}
            />
          ))}

          {/* NUEVO: Botón de ruta fallida por falta de tiempo al final de la lista */}
          {isInProgress && routeData?.pedidos?.length > 0 && (
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
