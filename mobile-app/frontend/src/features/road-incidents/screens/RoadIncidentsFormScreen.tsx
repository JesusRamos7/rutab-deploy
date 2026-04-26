// /frontend/src/features/road-incidents/screens/RoadIncidentsFormScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import {
  RoadIncidentsRoutes,
  RoadIncidentsStackParamList,
} from '../../../navigation/navigation-types';
import { apiClient } from '../../../core/api/apiClient';
import { useFetchRoutes } from '@/features/routes/hooks/useFetchRoutes';

const TIPOS = [
  'Tráfico Pesado',
  'Falla Mecánica',
  'Accidente',
  'Clima Adverso',
  'Cierre de Vía',
  'Otro',
];
const ESTADOS = ['pendiente', 'en proceso', 'urgente', 'resuelto'];

export const RoadIncidentsFormScreen = () => {
  const route = useRoute<RouteProp<RoadIncidentsStackParamList, RoadIncidentsRoutes.FORM>>();
  const navigation = useNavigation<NativeStackNavigationProp<RoadIncidentsStackParamList>>();
  const { incidentId } = route.params;

  const isEditing = !!incidentId;

  // Estados del formulario
  const [tipo, setTipo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);

  // Cargar datos si es edición
  useEffect(() => {
    if (isEditing) {
      apiClient
        .get(`/mobile-app/evidence/incidents`) // Buscamos en el listado local por ahora o fetch individual
        .then(({ data }) => {
          const item = data.find((i: any) => i.id === incidentId);
          if (item) {
            setTipo(item.tipo);
            setDescripcion(item.descripcion);
            setEstado(item.estado);
            setImage(item.fotoUrl); // Solo para visualización
          }
        })
        .finally(() => setFetchingData(false));
    }
  }, [incidentId]);
  const { routeData, loading: loadingRoute } = useFetchRoutes();

  const handlePickImage = async () => {
    if (isEditing) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], // <-- Corrección de Deprecación
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!tipo || !descripcion) {
      return Alert.alert('Error', 'Tipo y descripción son obligatorios');
    }

    setLoading(true);
    try {
      if (isEditing) {
        await apiClient.patch(`/mobile-app/evidence/incident/${incidentId}`, {
          tipo,
          descripcion,
          estado_incidencia: estado,
        });
      } else {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const formData = new FormData();
        formData.append('tipo', tipo);
        formData.append('descripcion', descripcion);
        formData.append('latitude', String(location.coords.latitude));
        formData.append('longitude', String(location.coords.longitude));
        formData.append('rutaId', routeData.id);

        // Intentamos mandar el pedidoId si hay uno activo en la ruta
        const pedidoActivo = routeData.pedidos?.find(
          (p: any) => p.estado_pedido === 'en camino' || p.estado_pedido === 'pendiente'
        );

        if (pedidoActivo) {
          formData.append('pedidoId', pedidoActivo.id);
        }

        if (image) {
          const uriParts = image.split('.');
          const fileType = uriParts[uriParts.length - 1];

          formData.append('photo', {
            uri: image,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }

        // IMPORTANTE: Axios con FormData
        await apiClient.post('/mobile-app/evidence/incident', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      Alert.alert('¡Éxito!', 'Reporte procesado.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.log('Error 400 Details:', error.response?.data); // Para ver qué campo falló
      Alert.alert('Error', 'No se pudo enviar el reporte. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Bloqueo visual si está cargando la ruta o no hay ruta activa (solo en creación)
  if (fetchingData || (!isEditing && loadingRoute)) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#123a5d" />
        <Text className="mt-4 font-bold text-gray-500">Validando ruta activa...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="rounded-b-[40px] bg-dark px-6 pb-12 pt-14">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-white/10">
          <MaterialCommunityIcons name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-3xl font-black text-white">
          {isEditing ? 'Editar Reporte' : 'Nuevo Reporte'}
        </Text>
      </View>

      <View className="mt-8 px-6">
        <Text className="mb-4 text-lg font-black text-dark">¿Qué está pasando?</Text>
        <View className="mb-6 flex-row flex-wrap">
          {TIPOS.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => !isEditing && setTipo(t)}
              className={`mb-2 mr-2 rounded-2xl border-2 px-4 py-2 ${tipo === t ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50'}`}>
              <Text
                className={`text-xs font-bold ${tipo === t ? 'text-primary' : 'text-gray-400'}`}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isEditing && (
          <View className="mb-6">
            <Text className="mb-4 text-lg font-black text-dark">Estado del incidente</Text>
            <View className="flex-row justify-between">
              {ESTADOS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setEstado(e)}
                  className={`rounded-xl border px-3 py-2 ${estado === e ? 'border-dark bg-dark' : 'border-gray-200'}`}>
                  <Text
                    className={`text-[10px] font-black uppercase ${estado === e ? 'text-white' : 'text-gray-400'}`}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <Text className="mb-2 text-lg font-black text-dark">Descripción</Text>
        <TextInput
          multiline
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe brevemente la situación..."
          className="mb-6 h-32 rounded-3xl border-2 border-gray-100 bg-gray-50 p-4 font-bold text-dark"
          textAlignVertical="top"
        />

        <Text className="mb-4 text-lg font-black text-dark">Evidencia Visual</Text>
        <TouchableOpacity
          onPress={handlePickImage}
          disabled={isEditing}
          className="h-48 w-full items-center justify-center overflow-hidden rounded-[30px] border-2 border-dashed border-gray-300 bg-gray-100">
          {image ? (
            <Image source={{ uri: image }} className="h-full w-full" />
          ) : (
            <>
              <MaterialCommunityIcons name="camera" size={40} color="#9CA3AF" />
              <Text className="mt-2 font-bold text-gray-400">Tocar para tomar foto</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`mb-10 mt-10 flex-row items-center justify-center rounded-2xl py-5 ${loading ? 'bg-gray-300' : 'bg-primary'}`}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialCommunityIcons name="check-circle" size={24} color="white" />
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
