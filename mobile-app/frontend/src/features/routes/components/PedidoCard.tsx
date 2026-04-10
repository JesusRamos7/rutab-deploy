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
      <View className="mb-3 flex-row items-start justify-between">
        <View className={`rounded-full px-3 py-1 ${canInteract ? 'bg-primary' : 'bg-gray-400'}`}>
          <Text className="text-[10px] font-bold uppercase text-white">Parada {pedido.orden}</Text>
        </View>
        <Text className="font-mono text-[10px] text-gray-400">
          {pedido.pedidoId.split('-')[0]}...
        </Text>
      </View>

      {/* Info del Cliente */}
      <View className="mb-4 flex-row items-center">
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl ${
            canInteract ? 'bg-primary/10' : 'bg-gray-200'
          }`}>
          <MaterialCommunityIcons
            name={canInteract ? 'truck-fast' : 'package-variant-closed'}
            size={24}
            color={canInteract ? '#123a5d' : '#9CA3AF'}
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold leading-5 text-dark">{pedido.cliente}</Text>
          <Text className="mt-1 text-xs text-gray-500" numberOfLines={2}>
            {pedido.direccion}
          </Text>
        </View>
      </View>

      {/* Acciones (Navegar / Cámara) */}
      {canInteract && (
        <View className="mt-2 flex-row space-x-3">
          <TouchableOpacity
            onPress={() => onPressMaps(pedido.latitude, pedido.longitude)}
            className="flex-1 flex-row items-center justify-center rounded-2xl bg-primary py-4 shadow-lg shadow-primary/20 active:opacity-90">
            <MaterialCommunityIcons name="google-maps" size={20} color="white" />
            <Text className="ml-2 font-bold text-white">Navegar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onPressDelivery(pedido)}
            disabled={isCheckingLocation}
            className={`min-w-[75px] items-center justify-center rounded-2xl px-6 ${
              isValidated ? 'bg-dark' : 'bg-gray-400'
            }`}>
            {isCheckingLocation ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialCommunityIcons
                name={isValidated ? 'camera-plus' : 'map-marker-check'}
                size={24}
                color="white"
              />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Footer Informativo del Card */}
      {canInteract ? (
        <View
          className={`mt-4 flex-row items-center justify-center rounded-2xl border px-4 py-3 ${
            isValidated ? 'border-green-100 bg-green-50' : 'border-blue-100 bg-blue-50'
          }`}>
          <MaterialCommunityIcons
            name={isValidated ? 'check-decagram' : 'information-outline'}
            size={16}
            color={isValidated ? '#16a34a' : '#123a5d'}
          />
          <Text
            className={`ml-2 text-[11px] font-bold uppercase tracking-tight ${
              isValidated ? 'text-green-700' : 'text-primary'
            }`}>
            {isValidated ? 'Ubicación confirmada. Toma la foto' : 'Valida tu llegada para entregar'}
          </Text>
        </View>
      ) : (
        <View className="mt-2 flex-row items-center border-t border-gray-100 pt-3">
          <MaterialCommunityIcons
            name={!isInProgress ? 'play-circle-outline' : 'lock'}
            size={14}
            color="#9CA3AF"
          />
          <Text className="ml-2 text-[11px] font-medium italic text-gray-400">
            {!isInProgress
              ? 'Inicia la jornada para desbloquear'
              : 'Completa la entrega anterior para continuar'}
          </Text>
        </View>
      )}
    </View>
  );
};
