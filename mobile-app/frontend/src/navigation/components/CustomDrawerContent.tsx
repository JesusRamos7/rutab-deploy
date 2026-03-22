// src/navigation/components/CustomDrawerContent.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useAuth } from "../../core/context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { usuario, logout } = useAuth();

  return (
    <View className="flex-1">
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Header con información del Chofer */}
        <View className="bg-blue-600 p-6 pt-12 mb-2">
          <View className="h-16 w-16 rounded-full bg-white items-center justify-center mb-3 overflow-hidden">
            {usuario?.foto_perfil_url ? (
              <Image 
                source={{ uri: usuario.foto_perfil_url }} 
                className="h-16 w-16"
              />
            ) : (
              <MaterialCommunityIcons name="account" size={40} color="#2563EB" />
            )}
          </View>
          <Text className="text-white font-bold text-lg" numberOfLines={1}>
            {usuario?.nombre || "Chofer"}
          </Text>
          <Text className="text-blue-100 text-sm" numberOfLines={1}>
            {usuario?.correo}
          </Text>
        </View>

        {/* Lista de módulos (se inyectan automáticamente desde el Navigator) */}
        <View className="flex-1 px-2">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Botón de Cerrar Sesión al final */}
      <View className="border-t border-gray-200 p-4 mb-4">
        <TouchableOpacity
          onPress={logout}
          className="flex-row items-center p-3 rounded-lg"
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
          <Text className="ml-3 text-red-500 font-semibold">Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};