// /frontend/src/features/road-incidents/screens/RoadIncidentsFormScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  RoadIncidentsRoutes,
  RoadIncidentsStackParamList,
} from '../../../navigation/navigation-types';
import { useFetchRoutes } from '@/features/routes/hooks/useFetchRoutes';
import { useRoadIncidentForm } from '../hooks/useRoadIncidentForm';
import { INCIDENT_TYPES, INCIDENT_STATES } from '../constants/road-incidents.constants';

export const RoadIncidentsFormScreen = () => {
  const route = useRoute<RouteProp<RoadIncidentsStackParamList, RoadIncidentsRoutes.FORM>>();
  const navigation = useNavigation();

  // Obtenemos la ruta activa. Es vital para nuevos reportes.
  const { routeData, loading: loadingRoute, error: routeError } = useFetchRoutes();
  const [imageLoading, setImageLoading] = useState(false);

  const { form, setForm, loading, fetchingData, handlePickImage, submitForm, isEditing } =
    useRoadIncidentForm(route.params.incidentId, routeData);

  // 1. ESTADO DE CARGA O SINCRONIZACIÓN
  if (fetchingData || (!isEditing && loadingRoute)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#123a5d" />
        <Text className="mt-4 font-bold text-gray-500">Sincronizando datos...</Text>
      </View>
    );
  }

  // 2. VALIDACIÓN DE SEGURIDAD: No hay ruta activa para reportar
  if (!isEditing && !routeData && !loadingRoute) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-10">
        <MaterialCommunityIcons name="map-marker-off-outline" size={60} color="#D1D5DB" />
        <Text className="mt-4 text-center font-bold text-gray-600">
          No puedes crear un reporte si no tienes una ruta activa iniciada.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-6 rounded-xl bg-dark px-8 py-3">
          <Text className="font-bold text-white">REGRESAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View className="rounded-b-[40px] bg-dark px-6 pb-12 pt-14">
        <TouchableOpacity
          onPress={() => !loading && navigation.goBack()}
          disabled={loading}
          className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl font-black text-white">
          {isEditing ? 'Editar Reporte' : 'Nuevo Reporte'}
        </Text>
        {!isEditing && (
          <Text className="mt-1 text-xs font-bold uppercase tracking-tighter text-white/40">
            Ruta: {routeData?.vehiculos?.placas || 'Asignada'}
          </Text>
        )}
      </View>

      <View className="mt-8 px-6">
        {/* Selector de Tipos */}
        <Text className="mb-4 text-lg font-black text-dark">¿Qué está pasando?</Text>
        <View className="mb-6 flex-row flex-wrap">
          {(INCIDENT_TYPES || []).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => !isEditing && setForm({ ...form, tipo: t })}
              disabled={isEditing || loading}
              className={`mb-2 mr-2 rounded-2xl border-2 px-4 py-2 ${
                form.tipo === t ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50'
              } ${isEditing ? 'opacity-70' : ''}`}>
              <Text
                className={`text-xs font-bold ${form.tipo === t ? 'text-primary' : 'text-gray-400'}`}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selector de Estados */}
        <Text className="mb-4 text-lg font-black text-dark">Prioridad / Estado</Text>
        <View className="mb-6 flex-row justify-between">
          {(INCIDENT_STATES || []).map((e) => {
            // Un chofer no puede marcar como "resuelta" una incidencia nueva, solo una existente.
            if (!isEditing && e.value === 'resuelta') return null;

            const isSelected = form.estado === e.value;
            return (
              <TouchableOpacity
                key={e.value}
                onPress={() => !loading && setForm({ ...form, estado: e.value })}
                disabled={loading}
                className={`mx-1 flex-1 flex-row items-center justify-center rounded-2xl border-2 py-3 ${
                  isSelected ? 'border-dark bg-dark' : 'border-gray-100 bg-gray-50'
                }`}>
                <MaterialCommunityIcons
                  name={e.icon as any}
                  size={18}
                  color={isSelected ? 'white' : '#9CA3AF'}
                />
                <Text
                  className={`ml-2 text-[10px] font-black uppercase ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {e.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input Descripción */}
        <Text className="mb-2 text-lg font-black text-dark">Descripción</Text>
        <TextInput
          multiline
          value={form.descripcion}
          onChangeText={(text) => setForm({ ...form, descripcion: text })}
          editable={!loading} // Cambiado disabled por editable
          placeholder="Describe la situación con detalles para el monitor..."
          placeholderTextColor="#9CA3AF"
          className="mb-6 h-32 rounded-3xl border-2 border-gray-100 bg-gray-50 p-4 font-bold text-dark"
          textAlignVertical="top"
        />

        {/* Evidencia Visual */}
        <Text className="mb-4 text-lg font-black text-dark">Evidencia Visual</Text>
        <View className="h-48 w-full overflow-hidden rounded-[30px] border-2 border-dashed border-gray-300 bg-gray-100">
          {form.image ? (
            <View className="h-full w-full">
              <Image
                source={{ uri: form.image }}
                className="h-full w-full"
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
              {imageLoading && (
                <View className="absolute inset-0 items-center justify-center bg-gray-100/50">
                  <ActivityIndicator color="#123a5d" />
                </View>
              )}
              {isEditing && (
                <View className="absolute bottom-2 right-2 rounded-lg bg-dark/60 px-2 py-1">
                  <Text className="text-[8px] font-bold uppercase text-white">Solo lectura</Text>
                </View>
              )}
            </View>
          ) : isEditing ? (
            <View className="h-full w-full items-center justify-center bg-gray-50">
              <MaterialCommunityIcons name="camera-off-outline" size={40} color="#D1D5DB" />
              <Text className="mt-2 px-10 text-center font-bold text-gray-400">
                Sin evidencia visual registrada.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={loading}
              activeOpacity={0.7}
              className="h-full w-full items-center justify-center">
              <MaterialCommunityIcons name="camera" size={40} color="#9CA3AF" />
              <Text className="mt-2 font-bold text-gray-400">Tocar para tomar foto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botón Submit */}
        <TouchableOpacity
          onPress={() => submitForm(() => navigation.goBack())}
          disabled={loading}
          className={`mb-10 mt-10 flex-row items-center justify-center rounded-2xl py-5 shadow-lg ${
            loading ? 'bg-gray-300' : 'bg-primary shadow-primary/30'
          }`}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialCommunityIcons
                name={isEditing ? 'content-save-check' : 'send-check'}
                size={24}
                color="white"
              />
              <Text className="ml-2 text-lg font-black text-white">
                {isEditing ? 'GUARDAR CAMBIOS' : 'ENVIAR REPORTE'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
