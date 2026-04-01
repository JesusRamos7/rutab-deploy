// src/features/dashboard/screens/DashboardDetailScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardStackParamList, DashboardRoutes } from '../../../navigation/navigation-types';

export const DashboardDetailScreen = () => {
  const route = useRoute<RouteProp<DashboardStackParamList, DashboardRoutes.DETAIL>>();
  const { id } = route.params;

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Resumen del Viaje */}
      <View className="bg-primary px-6 pb-10 pt-6">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-white/70">
              ID del Viaje
            </Text>
            <Text className="text-3xl font-bold text-white">{id}</Text>
          </View>
          <View className="rounded-2xl border border-white/30 bg-white/20 px-4 py-2">
            <Text className="font-bold text-white">En curso</Text>
          </View>
        </View>
      </View>

      {/* Contenido Detallado */}
      <View className="-mt-6 px-6">
        {/* Card: Información General */}
        <View className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-black/5">
          <Text className="text-dark mb-4 text-lg font-bold">Información de Entrega</Text>

          <View className="space-y-6">
            {/* Punto A */}
            <View className="flex-row items-start">
              <View className="mr-4 items-center">
                <View className="border-primary h-6 w-6 items-center justify-center rounded-full border-2 bg-white">
                  <View className="bg-primary h-2 w-2 rounded-full" />
                </View>
                <View className="h-10 w-[2px] bg-gray-200" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase text-gray-400">Origen</Text>
                <Text className="text-dark text-base font-semibold">Almacén Central Norte</Text>
              </View>
            </View>

            {/* Punto B */}
            <View className="flex-row items-start">
              <View className="mr-4 items-center">
                <View className="bg-primary h-6 w-6 items-center justify-center rounded-full">
                  <MaterialCommunityIcons name="map-marker" size={14} color="white" />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase text-gray-400">Destino</Text>
                <Text className="text-dark text-base font-semibold">
                  Sucursal Av. Libertad #450
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card: Especificaciones del Paquete */}
        <View className="mt-6 flex-row space-x-4">
          <View className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <MaterialCommunityIcons name="weight-kilogram" size={20} color="#123a5d" />
            <Text className="mt-2 text-[10px] font-bold uppercase text-gray-400">Peso Total</Text>
            <Text className="text-dark text-base font-bold">45.5 kg</Text>
          </View>

          <View className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <MaterialCommunityIcons name="package-variant" size={20} color="#123a5d" />
            <Text className="mt-2 text-[10px] font-bold uppercase text-gray-400">Cajas</Text>
            <Text className="text-dark text-base font-bold">12 unidades</Text>
          </View>
        </View>

        {/* Botón de Acción de Ruta */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-dark mt-8 items-center rounded-2xl py-5 shadow-lg shadow-black/20">
          <Text className="text-lg font-bold text-white">Iniciar Navegación GPS</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4 items-center rounded-2xl border border-gray-200 py-4">
          <Text className="font-semibold text-gray-500">Reportar Incidencia</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
