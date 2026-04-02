import React, { useCallback } from 'react';
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

import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';
import { useFetchRoutes } from '../hooks/useFetchRoutes';

export const RoutesScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RoutesStackParamList>>();
  const { routeData, loading, error, refresh } = useFetchRoutes();

  // Actualización automática al ganar el foco (viniendo de otra pantalla)
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleAbrirMaps = (lat: number, lng: number) => {
    // URL universal para Google Maps
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    });
  };

  if (loading && !routeData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#123a5d" />
        <Text className="mt-4 font-medium text-gray-500">Cargando tu ruta...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-10">
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#9CA3AF" />
        <Text className="mt-4 text-center text-lg text-gray-500">{error}</Text>
        <TouchableOpacity onPress={refresh} className="bg-primary mt-6 rounded-xl px-8 py-3">
          <Text className="font-bold text-white">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Pantalla de "Ruta Completada" si no hay pedidos pendientes
  if (routeData && routeData.pedidos?.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center px-10">
          <View className="mb-6 rounded-full bg-green-100 p-6">
            <MaterialCommunityIcons name="check-all" size={50} color="#15803d" />
          </View>
          <Text className="text-dark text-center text-xl font-bold">¡Ruta completada!</Text>
          <Text className="mt-2 text-center text-gray-500">
            Has entregado todos los pedidos asignados a esta ruta.
          </Text>
          <TouchableOpacity
            onPress={refresh}
            className="bg-primary shadow-primary/30 mt-8 rounded-2xl px-10 py-4 shadow-lg">
            <Text className="text-lg font-bold text-white">Actualizar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={['#123a5d']}
            tintColor="#123a5d"
          />
        }>
        {/* Header Informativo */}
        <View className="bg-primary px-6 pb-12 pt-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-white/70">
            Vehículo: {routeData?.vehiculos?.placas || 'N/A'}
          </Text>
          <Text className="mt-1 text-2xl font-bold text-white">
            {routeData?.pedidos?.length || 0} Entregas Pendientes
          </Text>
        </View>

        <View className="-mt-6 px-6">
          {routeData?.pedidos.map((pedido: any, index: number) => {
            const isFirst = index === 0;

            return (
              <View
                key={pedido.pedidoId}
                className={`mb-4 rounded-3xl border p-5 shadow-sm ${
                  isFirst
                    ? 'border-primary/20 shadow-primary/10 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                }`}>
                <View className="mb-3 flex-row items-start justify-between">
                  <View
                    className={`rounded-full px-3 py-1 ${isFirst ? 'bg-primary' : 'bg-gray-400'}`}>
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
                    className={`h-12 w-12 items-center justify-center rounded-2xl ${
                      isFirst ? 'bg-primary/10' : 'bg-gray-200'
                    }`}>
                    <MaterialCommunityIcons
                      name={isFirst ? 'truck-fast' : 'package-variant-closed'}
                      size={24}
                      color={isFirst ? '#123a5d' : '#9CA3AF'}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-dark text-lg font-bold leading-5">{pedido.cliente}</Text>
                    <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
                      {pedido.direccion}
                    </Text>
                  </View>
                </View>

                {isFirst && (
                  <View className="mt-2 flex-row space-x-3">
                    <TouchableOpacity
                      onPress={() => handleAbrirMaps(pedido.latitude, pedido.longitude)}
                      className="bg-primary shadow-primary/20 flex-1 flex-row items-center justify-center rounded-2xl py-4 shadow-lg">
                      <MaterialCommunityIcons name="google-maps" size={20} color="white" />
                      <Text className="ml-2 font-bold text-white">Navegar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate(RoutesRoutes.DELIVERY_EVIDENCE, {
                          pedidoId: pedido.pedidoId,
                          cliente: pedido.cliente,
                        })
                      }
                      className="bg-dark items-center justify-center rounded-2xl px-5">
                      <MaterialCommunityIcons name="camera-plus" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                )}

                {!isFirst && (
                  <View className="mt-2 flex-row items-center border-t border-gray-100 pt-3">
                    <MaterialCommunityIcons name="lock" size={14} color="#9CA3AF" />
                    <Text className="ml-2 text-[11px] font-medium italic text-gray-400">
                      Completa la entrega actual para desbloquear
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
