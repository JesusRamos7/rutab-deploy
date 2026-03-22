// src/features/dashboard/screens/DashboardScreen.tsx

import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDashboard } from "../hooks/useDashboard";

export const DashboardScreen = () => {
  const { usuario, handleLogout } = useDashboard();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Cabecera de Bienvenida */}
        <View className="mb-8">
          <Text className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            Panel Principal
          </Text>
          <Text className="text-3xl font-bold text-gray-900 mt-1">
            Hola, {usuario?.nombre} 👋
          </Text>
          <Text className="text-gray-600 mt-1">
            {usuario?.licencia
              ? `Licencia: ${usuario.licencia}`
              : "Chofer Verificado"}
          </Text>
        </View>

        {/* Espacio para futuros módulos (Tarjetas) */}
        <View className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6">
          <Text className="text-lg font-bold text-gray-800">
            Próximos Viajes
          </Text>
          <Text className="text-gray-500 mt-2">
            No tienes viajes asignados para hoy.
          </Text>
        </View>

        {/* Botón de Salida */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 py-4 rounded-2xl border border-red-100 items-center"
        >
          <Text className="text-red-600 font-bold text-base">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
