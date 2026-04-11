// /mobile-app/frontend/src/features/routes/components/RouteHeader.tsx

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  placas: string;
  pedidosCount: number;
  isInProgress: boolean;
  isStarting: boolean;
  onStartRoute: () => void;
}

export const RouteHeader = ({
  placas,
  pedidosCount,
  isInProgress,
  isStarting,
  onStartRoute,
}: Props) => {
  return (
    <View className="bg-primary px-6 pb-12 pt-8">
      <Text className="text-xs font-bold uppercase tracking-widest text-white/70">
        Vehículo: {placas || 'N/A'}
      </Text>

      <Text className="mt-1 text-2xl font-bold text-white">{pedidosCount} Entregas Pendientes</Text>

      {!isInProgress && (
        <TouchableOpacity
          onPress={onStartRoute}
          disabled={isStarting}
          className="mt-6 flex-row items-center justify-center rounded-2xl bg-white py-4 shadow-xl active:opacity-90">
          {isStarting ? (
            <ActivityIndicator color="#123a5d" />
          ) : (
            <>
              <MaterialCommunityIcons name="play-circle" size={24} color="#123a5d" />
              <Text className="ml-2 text-lg font-black text-primary">COMENZAR RUTA</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};
