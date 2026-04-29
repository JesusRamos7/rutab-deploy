// /frontend/src/features/road-incidents/hooks/useRoadIncidentForm.ts

import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { roadIncidentsService } from '../services/road-incidents.service';

export const useRoadIncidentForm = (incidentId?: string, routeData?: any) => {
  const isEditing = !!incidentId;

  const [form, setForm] = useState({
    tipo: '',
    descripcion: '',
    estado: 'abierta',
    image: null as string | null,
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);

  // Cargar datos si es edición
  useEffect(() => {
    if (isEditing) {
      roadIncidentsService
        .getAll()
        .then((data) => {
          const item = data.find((i: any) => i.id === incidentId);
          if (item) {
            setForm({
              tipo: item.tipo,
              descripcion: item.descripcion,
              estado: item.estado,
              image: item.fotoUrl || null,
            });
          }
        })
        .finally(() => setFetchingData(false));
    }
  }, [incidentId]);

  const handlePickImage = async () => {
    if (isEditing) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setForm((prev) => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const submitForm = async (onSuccess: () => void) => {
    if (!form.tipo || !form.descripcion) {
      return Alert.alert('Error', 'Tipo y descripción son obligatorios');
    }

    setLoading(true);
    try {
      if (isEditing) {
        await roadIncidentsService.update(incidentId!, {
          tipo: form.tipo,
          descripcion: form.descripcion,
          estado_incidencia: form.estado,
        });
      } else {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const formData = new FormData();
        formData.append('tipo', form.tipo);
        formData.append('descripcion', form.descripcion);
        formData.append('latitude', String(location.coords.latitude));
        formData.append('longitude', String(location.coords.longitude));
        formData.append('rutaId', routeData.id);
        formData.append('estado_incidencia', form.estado);
        formData.append('categoria', 'camino');

        if (routeData.pedidos?.length > 0) {
          formData.append('pedidoId', routeData.pedidos[0].pedidoId);
        }

        if (form.image) {
          const fileType = form.image.split('.').pop();
          formData.append('photo', {
            uri: form.image,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }

        await roadIncidentsService.create(formData);
      }

      Alert.alert('¡Éxito!', 'Reporte procesado.', [{ text: 'OK', onPress: onSuccess }]);
    } catch (error: any) {
      console.log('🚨 ERROR EN API:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo procesar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    loading,
    fetchingData,
    handlePickImage,
    submitForm,
    isEditing,
  };
};
