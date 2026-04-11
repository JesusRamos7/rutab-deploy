// /mobile-app/frontend/src/features/routes/components/RoutesCompletedView.tsx

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onFinish: () => void;
  onRefresh: () => void;
  isStarting: boolean;
}

export const RoutesCompletedView = ({ onFinish, onRefresh, isStarting }: Props) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-10">
        <View className="shadow-inner mb-6 rounded-full bg-green-100 p-8">
          <MaterialCommunityIcons name="flag-checkered" size={60} color="#15803d" />
        </View>

        <Text className="text-center text-2xl font-black text-dark">¡Entregas Finalizadas!</Text>

        <Text className="mt-4 text-center text-base leading-6 text-gray-500">
          Has completado todos los pedidos de tu lista. Debes finalizar la jornada para procesar tu
          trayecto y desactivar el GPS.
        </Text>

        <TouchableOpacity
          onPress={onFinish}
          disabled={isStarting}
          className="mt-12 w-full flex-row items-center justify-center rounded-3xl bg-dark py-5 shadow-xl shadow-black/20 active:scale-95">
          {isStarting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialCommunityIcons name="stop-circle" size={24} color="white" />
              <Text className="ml-2 text-lg font-bold uppercase tracking-tighter text-white">
                Finalizar Jornada Oficialmente
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onRefresh} className="mt-6 p-2">
          <Text className="font-bold text-gray-400">Actualizar datos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
