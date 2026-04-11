// /mobile-app/frontend/src/features/routes/components/PedidoCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PedidoCardProps {
  pedido: any;
  index: number;
  isInProgress: boolean;
  isCheckingLocation: boolean;
  isValidated: boolean;
  onPressMaps: (lat: number, lng: number) => void;
  onPressDelivery: (pedido: any) => void;
}

export const PedidoCard = ({
  pedido,
  index,
  isInProgress,
  isCheckingLocation,
  isValidated,
  onPressMaps,
  onPressDelivery,
}: PedidoCardProps) => {
  const isFirst = index === 0;
  const canInteract = isInProgress && isFirst;

  return (
    <View
      className={`mb-4 rounded-3xl border p-5 shadow-sm ${
        canInteract
          ? 'border-primary/20 bg-white shadow-primary/10'
          : 'border-gray-100 bg-gray-50 opacity-60'
      }`}>
      {/* Badge de Parada y ID */}
      <View className="mb-4 flex-row items-start justify-between">
        <View className={`rounded-full px-3 py-1 ${canInteract ? 'bg-primary' : 'bg-gray-400'}`}>
          <Text className="text-[10px] font-extrabold uppercase text-white">
            Parada {pedido.orden}
          </Text>
        </View>
        <Text className="font-mono text-[10px] font-bold text-gray-400">
          {pedido.pedidoId.split('-')[0]}...
        </Text>
      </View>

      {/* Info del Cliente */}
      <View className="mb-5 flex-row items-center">
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl ${canInteract ? 'bg-primary/10' : 'bg-gray-200'}`}>
          <MaterialCommunityIcons
            name={canInteract ? 'truck-fast' : 'package-variant-closed'}
            size={24}
            color={canInteract ? '#123a5d' : '#9CA3AF'}
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-lg font-black leading-5 text-dark">{pedido.cliente}</Text>
          <Text className="mt-1 text-xs font-bold text-gray-500" numberOfLines={2}>
            {pedido.direccion}
          </Text>
        </View>
      </View>

      {/* Acciones e Instrucción */}
      {canInteract ? (
        <View>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => onPressMaps(pedido.latitude, pedido.longitude)}
              className="flex-1 flex-row items-center justify-center rounded-2xl bg-primary py-4 shadow-lg shadow-primary/20 active:opacity-90">
              <MaterialCommunityIcons name="google-maps" size={20} color="white" />
              <Text className="ml-2 font-black text-white">Navegar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onPressDelivery(pedido)}
              disabled={isCheckingLocation}
              className={`flex-1 flex-row items-center justify-center rounded-2xl py-4 shadow-lg active:opacity-90 ${
                isValidated ? 'bg-dark shadow-dark/20' : 'bg-gray-400 shadow-gray-400/20'
              }`}>
              {isCheckingLocation ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name={isValidated ? 'camera-plus' : 'map-marker-check'}
                    size={20}
                    color="white"
                  />
                  <Text className="ml-2 font-black text-white">
                    {isValidated ? 'Entregar' : 'Llegué'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Instrucción directa en negrita */}
          <View className="mt-3 flex-row items-center justify-center">
            <MaterialCommunityIcons
              name={isValidated ? 'check-circle' : 'information-outline'}
              size={14}
              color={isValidated ? '#16a34a' : '#9ca3af'}
            />
            <Text
              className={`ml-2 text-[11px] font-bold tracking-tight ${isValidated ? 'text-green-700' : 'text-gray-400'}`}>
              {isValidated ? 'Ubicación confirmada' : "Presiona 'Llegué' al estar en el sitio"}
            </Text>
          </View>
        </View>
      ) : (
        <View className="mt-2 flex-row items-center border-t border-gray-100 pt-4">
          <MaterialCommunityIcons name="lock" size={14} color="#9CA3AF" />
          <Text className="ml-2 text-[11px] font-bold italic text-gray-400">
            {!isInProgress ? 'INICIA RUTA PARA DESBLOQUEAR' : 'COMPLETA LA ENTREGA ANTERIOR'}
          </Text>
        </View>
      )}
    </View>
  );
};
