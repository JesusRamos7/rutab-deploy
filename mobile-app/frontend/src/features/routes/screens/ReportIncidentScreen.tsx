// /mobile-app/frontend/src/features/routes/screens/ReportIncidentScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';
import { apiClient } from '../../../core/api/apiClient';
import { getDistance } from '../../../core/services/locationService';

const TIPOS_INCIDENTE = [
  'Cliente ausente',
  'Dirección incorrecta',
  'Pedido rechazado',
  'Otro',
];

export const ReportIncidentScreen = () => {
  const route = useRoute<RouteProp<RoutesStackParamList, RoutesRoutes.REPORT_INCIDENT>>();
  const navigation = useNavigation<NativeStackNavigationProp<RoutesStackParamList>>();

  const { pedidoId, cliente, rutaId, clientLat, clientLng } = route.params;

  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSending, setIsSending] = useState(false);

  const PROXIMITY_THRESHOLD = 150;

  const handleSendIncident = async () => {
    if (!tipoSeleccionado || !descripcion) {
      Alert.alert('Campos incompletos', 'Por favor selecciona un tipo y escribe una descripción.');
      return;
    }

    try {
      setIsSending(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error de GPS', 'Se requiere acceso a la ubicación.');
        setIsSending(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      const distance = getDistance(latitude, longitude, clientLat, clientLng);

      if (distance > PROXIMITY_THRESHOLD) {
        Alert.alert('Fuera de Rango', `Estás a ${Math.round(distance)}m del destino.`);
        setIsSending(false);
        return;
      }

      await apiClient.post('/mobile-app/evidence/failed-delivery', {
        pedidoId,
        rutaId,
        tipo: tipoSeleccionado,
        descripcion,
        latitude,
        longitude,
        categoria: 'entrega',
      });

      Alert.alert('¡Éxito!', 'El pedido ha sido marcado como fallido.', [
        { text: 'Aceptar', onPress: () => navigation.navigate(RoutesRoutes.HOME) },
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo reportar la entrega fallida.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header Estilo "Dark" - Ajustamos el PT para dispositivos con notch */}
      <View className="bg-dark px-6 pb-12 pt-14">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <View className="rounded-full border border-red-500 bg-red-500/20 px-3 py-1">
            <Text className="text-[10px] font-black uppercase text-red-500">Incidente</Text>
          </View>
          <Text className="ml-3 font-mono text-xs font-bold text-white/40">
            #{pedidoId.split('-')[0]}
          </Text>
        </View>

        <Text className="mt-2 text-3xl font-black text-white">{cliente}</Text>
        <Text className="text-sm font-bold text-white/60">Reporte de entrega fallida</Text>
      </View>

      {/* Formulario */}
      <View className="-mt-6 flex-1 rounded-t-[40px] bg-white px-6 pt-8">
        <View className="mb-6">
          <Text className="mb-4 text-lg font-black text-dark">¿Qué sucedió?</Text>
          <View className="flex-row flex-wrap">
            {TIPOS_INCIDENTE.map((tipo) => {
              const isSelected = tipoSeleccionado === tipo;
              return (
                <TouchableOpacity
                  key={tipo}
                  onPress={() => setTipoSeleccionado(tipo)}
                  className={`mb-3 mr-2 rounded-2xl border-2 px-4 py-3 ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50'
                  }`}>
                  <Text
                    className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                    {tipo.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mb-8">
          <Text className="mb-4 text-lg font-black text-dark">Detalles adicionales</Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Escribe aquí los detalles del problema..."
            placeholderTextColor="#9CA3AF"
            className="h-40 rounded-3xl border-2 border-gray-100 bg-gray-50 p-5 font-bold text-dark"
            textAlignVertical="top"
          />
        </View>

        {/* Botón de Acción Principal (Estilo PedidoCard) */}
        <TouchableOpacity
          onPress={handleSendIncident}
          disabled={isSending}
          className={`flex-row items-center justify-center rounded-2xl py-5 shadow-lg ${
            isSending ? 'bg-gray-300' : 'bg-dark shadow-dark/30'
          }`}>
          {isSending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialCommunityIcons name="shield-alert" size={24} color="white" />
              <Text className="ml-3 text-lg font-black text-white">Confirmar Incidente</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info de Seguridad */}
        <View className="mt-6 flex-row items-center justify-center pb-10">
          <MaterialCommunityIcons name="map-marker-radius" size={16} color="#9CA3AF" />
          <Text className="ml-2 text-[11px] font-bold uppercase tracking-tighter text-gray-400">
            Se registrará tu ubicación actual
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
