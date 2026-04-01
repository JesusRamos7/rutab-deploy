import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoutes } from '../hooks/useRoutes';

// Datos estáticos de prueba (Mock)
const PEDIDOS_MOCK = [
  {
    id: 'PED-001',
    cliente: 'Empresa Logística S.A.',
    direccion: 'Av. Paseo de la Reforma 222, CDMX',
    lat: 19.427,
    lng: -99.1676,
    estado: 'pendiente',
  },
  {
    id: 'PED-002',
    cliente: 'Tiendas Neto Centro',
    direccion: 'Calle Mesones 123, Col. Centro',
    lat: 19.429,
    lng: -99.135,
    estado: 'pendiente',
  },
  {
    id: 'PED-003',
    cliente: 'Distribuidora Oriente',
    direccion: 'Calzada de Tlalpan 500',
    lat: 19.35,
    lng: -99.14,
    estado: 'pendiente',
  },
];

export const RoutesScreen = () => {
  const { usuario } = useRoutes();

  const handleAbrirMaps = (lat: number, lng: number, cliente: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir Google Maps en este dispositivo');
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header Resumido */}
        <View className="bg-primary px-6 pb-12 pt-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-white/70">
            Ruta del Día
          </Text>
          <Text className="mt-1 text-2xl font-bold text-white">
            {PEDIDOS_MOCK.length} Pedidos Pendientes
          </Text>
        </View>

        <View className="-mt-6 px-6">
          {PEDIDOS_MOCK.map((pedido, index) => {
            const isFirst = index === 0;

            return (
              <View
                key={pedido.id}
                className={`mb-4 rounded-3xl border p-5 shadow-sm ${
                  isFirst
                    ? 'border-primary/20 shadow-primary/10 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                }`}>
                {/* Indicador de Posición */}
                <View className="mb-3 flex-row items-start justify-between">
                  <View
                    className={`rounded-full px-3 py-1 ${isFirst ? 'bg-primary' : 'bg-gray-400'}`}>
                    <Text className="text-[10px] font-bold text-white">ORDEN #{index + 1}</Text>
                  </View>
                  <Text className="font-mono text-xs text-gray-400">{pedido.id}</Text>
                </View>

                {/* Info Cliente */}
                <View className="mb-4 flex-row items-center">
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-2xl ${isFirst ? 'bg-primary/10' : 'bg-gray-200'}`}>
                    <MaterialCommunityIcons
                      name={isFirst ? 'truck-delivery' : 'package-variant-closed'}
                      size={24}
                      color={isFirst ? '#123a5d' : '#9CA3AF'}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-dark text-lg font-bold leading-5">{pedido.cliente}</Text>
                    <Text className="mt-1 text-xs text-gray-500" numberOfLines={1}>
                      {pedido.direccion}
                    </Text>
                  </View>
                </View>

                {/* Acciones: Solo visibles para el primero de la pila */}
                {isFirst && (
                  <View className="mt-2 flex-row space-x-3">
                    <TouchableOpacity
                      onPress={() => handleAbrirMaps(pedido.lat, pedido.lng, pedido.cliente)}
                      className="bg-primary shadow-primary/20 flex-1 flex-row items-center justify-center rounded-2xl py-4 shadow-lg">
                      <MaterialCommunityIcons name="google-maps" size={20} color="white" />
                      <Text className="ml-2 font-bold text-white">Ir a Entregar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      disabled={true} // Se habilitará por proximidad GPS después
                      className="items-center justify-center rounded-2xl bg-gray-100 px-5 opacity-50">
                      <MaterialCommunityIcons name="camera" size={24} color="#123a5d" />
                    </TouchableOpacity>
                  </View>
                )}

                {!isFirst && (
                  <View className="mt-2 flex-row items-center border-t border-gray-200 pt-3">
                    <MaterialCommunityIcons name="lock-clock" size={16} color="#9CA3AF" />
                    <Text className="ml-2 text-xs font-medium text-gray-400">
                      Debes completar el pedido anterior para desbloquear
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
