// src/features/profile/screens/ProfileScreen.tsx

import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useProfile } from "../hooks/useProfile";

export const ProfileScreen = () => {
  const { infoChofer, logout } = useProfile();

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center pt-10 pb-6 bg-gray-50">
        <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center border-4 border-white shadow-sm">
          {infoChofer.foto ? (
            <Image
              source={{ uri: infoChofer.foto }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <Text className="text-blue-600 text-3xl font-bold">
              {infoChofer.nombre.charAt(0)}
            </Text>
          )}
        </View>
        <Text className="text-xl font-bold text-gray-900 mt-4">
          {infoChofer.nombre}
        </Text>
        <Text className="text-gray-500">{infoChofer.correo}</Text>
      </View>

      <View className="px-6 mt-6 space-y-4">
        <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <Text className="text-xs text-gray-400 font-bold uppercase">
            Licencia de Conducir
          </Text>
          <Text className="text-base text-gray-800 mt-1">
            {infoChofer.licencia}
          </Text>
        </View>

        <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <Text className="text-xs text-gray-400 font-bold uppercase">
            Teléfono de Contacto
          </Text>
          <Text className="text-base text-gray-800 mt-1">
            {infoChofer.telefono}
          </Text>
        </View>

        <TouchableOpacity
          onPress={logout}
          className="mt-10 bg-red-50 py-4 rounded-2xl border border-red-100 items-center"
        >
          <Text className="text-red-600 font-bold">Cerrar Sesión Segura</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
