// src/features/profile/screens/ProfileScreen.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfile } from '../hooks/useProfile';

export const ProfileScreen = () => {
  const { infoChofer, logout } = useProfile();

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Cabecera de Perfil */}
      <View className="bg-primary items-center px-6 pb-20 pt-12">
        <View className="relative">
          <View className="h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/30 bg-white/20 shadow-2xl">
            {infoChofer.foto ? (
              <Image
                source={{ uri: infoChofer.foto }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialCommunityIcons name="account" size={70} color="white" />
            )}
          </View>
          {/* Badge de Estado */}
          <View className="border-primary absolute -bottom-2 -right-2 h-8 w-8 items-center justify-center rounded-full border-4 bg-green-500" />
        </View>

        <Text className="mt-6 text-2xl font-bold text-white">{infoChofer.nombre}</Text>
        <Text className="text-sm font-medium uppercase tracking-widest text-white/60">
          Conductor Verificado
        </Text>
      </View>

      {/* Cuerpo de Información */}
      <View className="-mt-10 px-6">
        <View className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-black/5">
          <Text className="text-dark mb-6 text-lg font-bold">Detalles de la Cuenta</Text>

          <View className="space-y-5">
            {/* Dato: Correo */}
            <View className="flex-row items-center border-b border-gray-50 pb-4">
              <View className="mr-4 rounded-xl bg-gray-50 p-3">
                <MaterialCommunityIcons name="email-outline" size={22} color="#123a5d" />
              </View>
              <View>
                <Text className="text-[10px] font-bold uppercase text-gray-400">
                  Correo Electrónico
                </Text>
                <Text className="text-dark text-base font-semibold">{infoChofer.correo}</Text>
              </View>
            </View>

            {/* Dato: Licencia */}
            <View className="flex-row items-center border-b border-gray-50 pb-4">
              <View className="mr-4 rounded-xl bg-gray-50 p-3">
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={22}
                  color="#123a5d"
                />
              </View>
              <View>
                <Text className="text-[10px] font-bold uppercase text-gray-400">
                  Licencia de Conducir
                </Text>
                <Text className="text-dark text-base font-semibold">{infoChofer.licencia}</Text>
              </View>
            </View>

            {/* Dato: Teléfono */}
            <View className="flex-row items-center">
              <View className="mr-4 rounded-xl bg-gray-50 p-3">
                <MaterialCommunityIcons name="phone-outline" size={22} color="#123a5d" />
              </View>
              <View>
                <Text className="text-[10px] font-bold uppercase text-gray-400">
                  Teléfono de Contacto
                </Text>
                <Text className="text-dark text-base font-semibold">{infoChofer.telefono}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección de Seguridad */}
        <View className="mb-12 mt-8">
          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.8}
            className="flex-row items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 py-5">
            <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#000000" />
            <Text className="text-dark ml-3 text-base font-bold">Cerrar Sesión Segura</Text>
          </TouchableOpacity>

          <Text className="mt-6 text-center text-[11px] leading-5 text-gray-400">
            Toda la información personal está protegida bajo las directivas de seguridad de la
            aplicación.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
