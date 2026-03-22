// src/features/dashboard/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Definimos los tipos para TypeScript (Buena práctica)
type RootStackParamList = {
  DashboardHome: undefined;
  DashboardDetail: { id: string }; // Ejemplo pasando un ID
};

export const DashboardScreen = () => {
  // Tipamos el hook para tener autocompletado
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Esta función SOLO se ejecuta cuando el chofer pulsa el botón
  const handleVerDetalle = () => {
    navigation.navigate('DashboardDetail', { id: 'VIAJE-123' });
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="mb-4 text-xl font-bold text-gray-800">Panel del Chofer</Text>

      <TouchableOpacity
        onPress={handleVerDetalle}
        className="rounded-xl bg-blue-900 px-6 py-3 active:bg-blue-700">
        <Text className="font-semibold text-white">Ver Detalle de Ruta</Text>
      </TouchableOpacity>
    </View>
  );
};
