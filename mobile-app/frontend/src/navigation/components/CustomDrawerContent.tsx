//src/navigation/components/CustomDrawerContent.tsx

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
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir de la aplicación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        onPress: logout,
        style: 'destructive',
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
        className="flex-1">
        {/* Header - Perfil de Usuario */}
        <View className="bg-primary px-6 pb-8 pt-16">
          <View className="mb-4 h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10">
            {usuario?.foto_perfil_url ? (
              <Image
                source={{ uri: usuario.foto_perfil_url }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialCommunityIcons name="account" size={45} color="white" />
            )}
          </View>

          <View>
            <Text className="text-xl font-bold tracking-tight text-white" numberOfLines={1}>
              {usuario?.nombre || 'Usuario'}
            </Text>
            <Text className="text-sm text-white/60" numberOfLines={1}>
              {usuario?.correo || 'correo@ejemplo.com'}
            </Text>
          </View>
        </View>

        {/* Lista de Navegación */}
        <View className="mt-4 px-2">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Footer - Acción de Salida */}
      <View className="border-t border-gray-100 p-6">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center rounded-xl border border-gray-200 py-3 active:bg-gray-50"
          activeOpacity={0.7}>
          <MaterialCommunityIcons name="logout-variant" size={20} color="#000000" />
          <Text className="text-dark ml-3 font-semibold">Finalizar Sesión</Text>
        </TouchableOpacity>

        <Text className="mt-4 text-center text-[10px] uppercase tracking-widest text-gray-400">
          Versión 1.0.0
        </Text>
      </View>
    </View>
  );
};
