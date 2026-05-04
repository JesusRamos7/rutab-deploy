// /frontend/src/features/road-incidents/hooks/useRoadIncidentForm.ts

import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { roadIncidentsService } from '../services/road-incidents.service';
import { getErrorMessage } from '../../../core/api/apiClient';

export const useRoadIncidentForm = (incidentId?: string, routeData?: any) => {
  const isEditing = !!incidentId;
  const isMounted = useRef(true);

  const [form, setForm] = useState({
    tipo: '',
    descripcion: '',
    estado: 'abierta',
    image: null as string | null,
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Cargar datos si es edición
  useEffect(() => {
    if (isEditing) {
      setFetchingData(true);
      roadIncidentsService
        .getAll()
        .then((data) => {
          if (!isMounted.current) return;
          const item = data.find((i: any) => i.id === incidentId);
          if (item) {
            setForm({
              tipo: item.tipo,
              descripcion: item.descripcion,
              estado: item.estado || 'abierta',
              image: item.fotoUrl || null,
            });
          } else {
            Alert.alert('Error', 'No se encontró la información del reporte.');
          }
        })
        .catch((err) => {
          Alert.alert('Error de Carga', getErrorMessage(err));
        })
        .finally(() => {
          if (isMounted.current) setFetchingData(false);
        });
    }
  }, [incidentId, isEditing]);

  const handlePickImage = async () => {
    if (isEditing) return;

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita la cámara para adjuntar evidencia visual.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && isMounted.current) {
        setForm((prev) => ({ ...prev, image: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo activar la cámara.');
    }
  };

  const submitForm = async (onSuccess: () => void) => {
    // Validaciones básicas antes de disparar procesos pesados (GPS/Upload)
    if (!form.tipo || !form.descripcion.trim()) {
      return Alert.alert(
        'Campos requeridos',
        'Por favor selecciona un tipo de incidencia y añade una descripción.'
      );
    }

    setLoading(true);
    try {
      if (isEditing) {
        // ACTUALIZACIÓN (JSON)
        await roadIncidentsService.update(incidentId!, {
          tipo: form.tipo,
          descripcion: form.descripcion.trim(),
          estado_incidencia: form.estado,
        });
      } else {
        // CREACIÓN (FormData + GPS)
        if (!routeData?.id) {
          throw new Error('No hay una ruta activa asociada para este reporte.');
        }

        // Obtener ubicación con timeout
        let location;
        try {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        } catch {
          location = await Location.getLastKnownPositionAsync();
        }

        if (!location) {
          throw new Error(
            'No pudimos obtener tu ubicación GPS. Verifica tu señal e intenta de nuevo.'
          );
        }

        const formData = new FormData();
        formData.append('tipo', form.tipo);
        formData.append('descripcion', form.descripcion.trim());
        formData.append('latitude', String(location.coords.latitude));
        formData.append('longitude', String(location.coords.longitude));
        formData.append('rutaId', routeData.id);
        formData.append('estado_incidencia', form.estado);
        formData.append('categoria', 'camino');

        // Vincular al primer pedido de la lista si existe (opcional en backend)
        if (routeData.pedidos && routeData.pedidos.length > 0) {
          formData.append('pedidoId', routeData.pedidos[0].pedidoId);
        }

        if (form.image) {
          const uri = form.image;
          const filename = uri.split('/').pop() || 'incidente.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          // IMPORTANTE: Cambiado a 'file' para coincidir con el backend
          formData.append('file', {
            uri,
            name: filename,
            type,
          } as any);
        }

        await roadIncidentsService.create(formData);
      }

      Alert.alert('¡Éxito!', 'El reporte ha sido procesado correctamente.', [
        { text: 'Aceptar', onPress: onSuccess },
      ]);
    } catch (error: any) {
      const message = getErrorMessage(error);
      Alert.alert('No se pudo guardar', message);
    } finally {
      if (isMounted.current) setLoading(false);
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
