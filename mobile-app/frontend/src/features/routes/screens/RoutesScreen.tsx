import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Importamos los tipos actualizados
import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';

const PEDIDOS_MOCK = [
  {
    id: 'PED-001',
    cliente: 'Empresa Logística S.A.',
    direccion: 'Av. Paseo de la Reforma 222, CDMX',
    lat: 19.427,
    lng: -99.1676,
  },
  {
    id: 'PED-002',
    cliente: 'Tiendas Neto Centro',
    direccion: 'Calle Mesones 123, Col. Centro',
    lat: 19.429,
    lng: -99.135,
  },
  {
    id: 'PED-003',
    cliente: 'Distribuidora Oriente',
    direccion: 'Calzada de Tlalpan 500',
    lat: 19.35,
    lng: -99.14,
  },
];

export const RoutesScreen = () => {
  // Tipado de navegación para evitar errores de 'never'
  const navigation = useNavigation<NativeStackNavigationProp<RoutesStackParamList>>();

  const handleAbrirMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 30 }}>
        <View className="bg-primary px-6 pb-12 pt-8">
          <Text className="text-xs font-bold uppercase tracking-widest text-white/70">
            Ruta Activa
          </Text>
          <Text className="mt-1 text-2xl font-bold text-white">
            {PEDIDOS_MOCK.length} Entregas Pendientes
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
                <View className="mb-3 flex-row items-start justify-between">
                  <View
                    className={`rounded-full px-3 py-1 ${isFirst ? 'bg-primary' : 'bg-gray-400'}`}>
                    <Text className="text-[10px] font-bold text-white">ORDEN #{index + 1}</Text>
                  </View>
                  <Text className="font-mono text-xs text-gray-400">{pedido.id}</Text>
                </View>

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

                {isFirst && (
                  <View className="mt-2 flex-row space-x-3">
                    <TouchableOpacity
                      onPress={() => handleAbrirMaps(pedido.lat, pedido.lng)}
                      className="bg-primary shadow-primary/20 flex-1 flex-row items-center justify-center rounded-2xl py-4 shadow-lg">
                      <MaterialCommunityIcons name="google-maps" size={20} color="white" />
                      <Text className="ml-2 font-bold text-white">Navegar</Text>
                    </TouchableOpacity>

                    {/* BOTÓN DE EVIDENCIA: Ahora habilitado y funcional */}
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate(RoutesRoutes.DELIVERY_EVIDENCE, {
                          pedidoId: pedido.id,
                          cliente: pedido.cliente,
                        })
                      }
                      activeOpacity={0.7}
                      className="bg-dark items-center justify-center rounded-2xl px-5 shadow-lg shadow-black/10">
                      <MaterialCommunityIcons name="camera-plus" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                )}

                {!isFirst && (
                  <View className="mt-2 flex-row items-center border-t border-gray-200 pt-3">
                    <MaterialCommunityIcons name="lock-clock" size={16} color="#9CA3AF" />
                    <Text className="ml-2 text-xs font-medium text-gray-400">
                      Bloqueado hasta completar entrega anterior
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
