// src/features/dashboard/screens/DashboardDetailScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { DashboardStackParamList, DashboardRoutes } from '../../../navigation/navigation-types';

export const DashboardDetailScreen = () => {
  // Recuperamos los parámetros (como el ID del viaje) de forma tipada
  const route = useRoute<RouteProp<DashboardStackParamList, DashboardRoutes.DETAIL>>();
  const { id } = route.params;

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <Text className="text-2xl font-bold text-blue-900">Detalle del Viaje</Text>
      <Text className="mt-2 text-center text-gray-500">
        Gestionando la ruta con ID:
        <Text className="font-bold text-gray-800"> {id}</Text>
      </Text>
    </View>
  );
};
