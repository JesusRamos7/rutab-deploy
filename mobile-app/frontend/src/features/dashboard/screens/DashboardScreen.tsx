// src/features/dashboard/screens/DashboardScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDashboard } from '../hooks/useDashboard';

export const DashboardScreen = () => {
  // Ahora tenemos acceso a todo desde un solo lugar
  const { usuario, handleVerDetalle, handleLogout } = useDashboard();

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="mb-2 text-gray-500">Bienvenido,</Text>
      <Text className="mb-6 text-2xl font-bold text-gray-800">{usuario?.nombre || 'Chofer'}</Text>

      <View className="w-full space-y-4">
        <TouchableOpacity
          onPress={() => handleVerDetalle('VIAJE-123')}
          className="rounded-xl bg-blue-600 px-6 py-4 shadow-sm active:bg-blue-700">
          <Text className="text-center font-bold text-white">Ver Detalle de Ruta</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          onPress={handleLogout}
          className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 active:bg-red-100">
          <Text className="text-center font-bold text-red-600">Cerrar Sesión</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};
