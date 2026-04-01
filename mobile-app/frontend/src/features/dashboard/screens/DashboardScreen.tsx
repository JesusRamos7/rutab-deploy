// src/features/dashboard/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDashboard } from '../hooks/useDashboard';

export const DashboardScreen = () => {
  const { usuario, handleVerDetalle } = useDashboard();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Sección de Bienvenida */}
        <View className="bg-primary px-6 pb-12 pt-8">
          <Text className="text-sm font-medium uppercase tracking-wider text-white/70">
            Panel de Control
          </Text>
          <Text className="mt-1 text-3xl font-bold text-white">
            Hola, {usuario?.nombre?.split(' ')[0] || 'Chofer'}
          </Text>
          <Text className="mt-2 text-xs italic text-white/60">
            Tienes una ruta programada para hoy.
          </Text>
        </View>

        {/* Tarjetas de Resumen (Stats Rápidos) */}
        <View className="-mt-6 flex-row justify-between space-x-4 px-6">
          <View className="flex-1 items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <View className="mb-2 rounded-full bg-blue-50 p-2">
              <MaterialCommunityIcons name="map-marker-distance" size={24} color="#123a5d" />
            </View>
            <Text className="text-dark text-lg font-bold">0 km</Text>
            <Text className="text-[10px] font-bold uppercase text-gray-400">Recorridos</Text>
          </View>

          <View className="flex-1 items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <View className="mb-2 rounded-full bg-green-50 p-2">
              <MaterialCommunityIcons name="clock-outline" size={24} color="#10B981" />
            </View>
            <Text className="text-dark text-lg font-bold">Activo</Text>
            <Text className="text-[10px] font-bold uppercase text-gray-400">Estado</Text>
          </View>
        </View>

        {/* Cuerpo del Dashboard */}
        <View className="mt-8 px-6">
          <Text className="text-dark mb-4 text-lg font-bold">Acciones Principales</Text>

          {/* Tarjeta de Acción Principal: Ruta */}
          <TouchableOpacity
            onPress={() => handleVerDetalle('VIAJE-123')}
            activeOpacity={0.9}
            className="shadow-primary/10 flex-row items-center justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
            <View className="mr-4 flex-1">
              <View className="bg-primary/10 mb-3 self-start rounded-full px-3 py-1">
                <Text className="text-primary text-[10px] font-bold uppercase">Ruta en curso</Text>
              </View>
              <Text className="text-dark mb-1 text-xl font-bold">Viaje ID: #123</Text>
              <Text className="text-sm leading-5 text-gray-500">
                Presiona para ver los puntos de entrega y mapa de navegación.
              </Text>
            </View>

            <View className="bg-primary h-14 w-14 items-center justify-center rounded-2xl">
              <MaterialCommunityIcons name="chevron-right" size={32} color="white" />
            </View>
          </TouchableOpacity>

          {/* Card Secundaria (Ejemplo de historial o próximas tareas) */}
          <View className="mt-6 flex-row items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#9CA3AF" />
            <Text className="ml-3 font-medium text-gray-500">No hay viajes pendientes por hoy</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
