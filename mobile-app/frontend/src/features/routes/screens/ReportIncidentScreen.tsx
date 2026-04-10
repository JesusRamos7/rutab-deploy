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
import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';
import { apiClient } from '../../../core/api/apiClient';

const TIPOS_INCIDENTE = [
  'Cliente ausente',
  'Dirección incorrecta',
  'Pedido rechazado',
  'Falta de tiempo',
  'Vehículo averiado',
  'Otro',
];

export const ReportIncidentScreen = () => {
  const route = useRoute<RouteProp<RoutesStackParamList, RoutesRoutes.REPORT_INCIDENT>>();
  const navigation = useNavigation<NativeStackNavigationProp<RoutesStackParamList>>();
  const { pedidoId, cliente, rutaId } = route.params;

  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendIncident = async () => {
    if (!tipoSeleccionado || !descripcion) {
      Alert.alert('Campos incompletos', 'Por favor selecciona un tipo y escribe una descripción.');
      return;
    }

    try {
      setIsSending(true);
      await apiClient.post('/mobile-app/evidence/incident', {
        pedidoId,
        rutaId,
        tipo: tipoSeleccionado,
        descripcion,
      });

      Alert.alert(
        'Reporte enviado',
        'El incidente ha sido registrado y el pedido marcado como fallido.',
        [{ text: 'Aceptar', onPress: () => navigation.navigate(RoutesRoutes.HOME) }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el incidente. Intenta de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      <View className="bg-dark px-6 py-8">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-white/60">
          Registrar Incidente
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">{cliente}</Text>
      </View>

      <View className="-mt-4 px-6">
        <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-black/5">
          <Text className="mb-4 text-lg font-bold text-dark">Tipo de incidente</Text>
          <View className="flex-row flex-wrap">
            {TIPOS_INCIDENTE.map((tipo) => (
              <TouchableOpacity
                key={tipo}
                onPress={() => setTipoSeleccionado(tipo)}
                className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
                  tipoSeleccionado === tipo
                    ? 'border-primary bg-primary'
                    : 'border-gray-200 bg-gray-50'
                }`}>
                <Text
                  className={`text-xs font-medium ${tipoSeleccionado === tipo ? 'text-white' : 'text-gray-500'}`}>
                  {tipo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="mb-4 mt-6 text-lg font-bold text-dark">Descripción de lo ocurrido</Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Escribe aquí los detalles..."
            className="h-32 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-dark"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          onPress={handleSendIncident}
          disabled={isSending}
          className={`mb-10 items-center rounded-2xl py-5 shadow-lg ${isSending ? 'bg-gray-300' : 'bg-dark'}`}>
          {isSending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg font-bold text-white">Enviar Reporte</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
