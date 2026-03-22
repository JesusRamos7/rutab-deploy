// src/navigation/components/CustomDrawerContent.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../core/context/AuthContext';

export const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        onPress: logout,
        style: 'destructive',
      },
    ]);
  };

  return (
    <View className="flex-1">
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* Header - Info del Chofer */}
        <View className="mb-2 bg-blue-800 p-6 pt-12">
          <View className="mb-3 h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/20">
            {usuario?.foto_perfil_url ? (
              <Image source={{ uri: usuario.foto_perfil_url }} className="h-16 w-16" />
            ) : (
              <MaterialCommunityIcons name="account" size={40} color="white" />
            )}
          </View>
          <Text className="text-lg font-bold leading-tight text-white" numberOfLines={1}>
            {usuario?.nombre || 'Chofer'}
          </Text>
          <Text className="text-xs text-blue-100 opacity-80" numberOfLines={1}>
            {usuario?.correo}
          </Text>
        </View>

        {/* Módulos */}
        <View className="px-2">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Footer - Logout */}
      <View className="mb-4 border-t border-gray-100 p-4">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center rounded-xl bg-red-50 p-3"
          activeOpacity={0.7}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text className="ml-3 font-bold text-red-600">Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
