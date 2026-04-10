// /mobile-app/frontend/src/features/routes/screens/DeliveryEvidenceScreen.tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';

import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';
import { apiClient } from '../../../core/api/apiClient';
import { useFetchRoutes } from '../hooks/useFetchRoutes';

/**
 * Pantalla para la captura de evidencias de entrega (Foto y Firma).
 * Implementa una solución de ciclo de vida para evitar bloqueos táctiles en el componente de firma
 * durante navegaciones consecutivas.
 */
export const DeliveryEvidenceScreen = () => {
  const route = useRoute<RouteProp<RoutesStackParamList, RoutesRoutes.DELIVERY_EVIDENCE>>();
  const navigation = useNavigation<NativeStackNavigationProp<RoutesStackParamList>>();

  // Detecta si la pantalla está activa para gestionar el montaje/desmontaje del WebView
  const isFocused = useIsFocused();

  const { pedidoId, cliente } = route.params;

  // Estados de captura
  const [image, setImage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const signatureRef = useRef<SignatureViewRef>(null);

  // Obtenemos los datos de la ruta activa para extraer el ID
  const { routeData } = useFetchRoutes();

  // Reinicia los campos al cambiar de pedido o navegar fuera
  useEffect(() => {
    setImage(null);
    setSignature(null);
    setScrollEnabled(true);
  }, [pedidoId]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara para documentar la entrega.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Optimización de peso para el upload
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /**
   * Handlers para la gestión de gestos:
   * Bloquean el scroll del contenedor padre cuando el usuario inicia el trazo de la firma.
   */
  const handleSignatureOK = (signatureBase64: string) => setSignature(signatureBase64);
  const handleBegin = () => setScrollEnabled(false);
  const handleEnd = () => setScrollEnabled(true);

  const handleClearSignature = () => {
    signatureRef.current?.clearSignature();
    setSignature(null);
  };

  const canFinish = image !== null && signature !== null && !isSending;

  const handleFinishDelivery = async () => {
    if (!canFinish) return;

    try {
      setIsSending(true);

      // Verificación de ubicación obligatoria para el registro de auditoría
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Error de GPS',
          'Es obligatorio registrar la ubicación para finalizar la entrega.'
        );
        setIsSending(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Construcción del payload multipart/form-data
      const formData = new FormData();
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('photo', {
        uri: image,
        name: `entrega_${pedidoId}.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      formData.append('pedidoId', pedidoId);
      formData.append('firmaBase64', signature);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());

      await apiClient.post('/mobile-app/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('¡Éxito!', 'Entrega registrada y sincronizada correctamente.', [
        { text: 'Finalizar', onPress: () => navigation.navigate(RoutesRoutes.HOME) },
      ]);
    } catch (error: any) {
      console.error('Evidence upload error:', error);
      Alert.alert(
        'Error de conexión',
        'No se pudo guardar la evidencia. Verifique su conexión e intente de nuevo.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}>
      <View className="bg-primary px-6 py-8">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-white/60">
          Evidencias de Entrega
        </Text>
        <Text className="mt-1 text-2xl font-bold text-white">{cliente}</Text>
        <Text className="text-sm text-white/80">Folio: {pedidoId}</Text>
      </View>

      <View className="-mt-4 px-6">
        {/* NUEVO: Botón de Reportar Incidencia */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(RoutesRoutes.REPORT_INCIDENT, {
              pedidoId,
              cliente,
              rutaId: routeData?.id, // Pasamos el ID de la ruta activa
            })
          }
          className="mb-6 flex-row items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-4">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#dc2626" />
            <Text className="ml-3 font-bold text-red-700">¿Problemas con la entrega?</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#dc2626" />
        </TouchableOpacity>

        {/* Sección: Captura de Fotografía */}
        <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-black/5">
          <Text className="mb-4 text-lg font-bold text-dark">Foto del paquete</Text>
          <TouchableOpacity
            onPress={takePhoto}
            disabled={isSending}
            className={`h-52 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed ${
              image ? 'border-primary bg-white' : 'border-gray-200 bg-gray-50'
            }`}>
            {image ? (
              <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
            ) : (
              <View className="items-center">
                <MaterialCommunityIcons name="camera" size={32} color="#123a5d" />
                <Text className="font-medium text-gray-400">Capturar foto</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Sección: Captura de Firma */}
        <View className="mb-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-black/5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-dark">Firma del cliente</Text>
            {signature && !isSending && (
              <TouchableOpacity onPress={handleClearSignature}>
                <Text className="text-xs font-bold uppercase text-red-600">Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Renderizado condicional basado en useIsFocused:
            Fuerza la destrucción real del WebView al salir de la pantalla, 
            evitando que los listeners táctiles se corrompan en el stack de navegación.
          */}
          {isFocused ? (
            <View className="h-64 w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
              <SignatureScreen
                key={`${pedidoId}_${isFocused}`}
                ref={signatureRef}
                onOK={handleSignatureOK}
                onEmpty={() => setSignature(null)}
                onBegin={handleBegin}
                onEnd={handleEnd}
                descriptionText="Firme aquí"
                autoClear={false}
                imageType="image/png"
                webStyle={`.m-signature-pad { border: none; box-shadow: none; height: 100%; } 
                           .m-signature-pad--footer { display: none; }
                           body, html { height: 100%; overflow: hidden; }`}
                // Optimizaciones para renderizado de trazo en Android
                androidHardwareAccelerationDisabled={Platform.OS === 'android'}
                androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
              />
            </View>
          ) : (
            <View className="h-64 w-full items-center justify-center rounded-2xl border border-gray-100 bg-gray-50">
              <ActivityIndicator color="#123a5d" />
            </View>
          )}

          <TouchableOpacity
            onPress={() => signatureRef.current?.readSignature()}
            disabled={isSending}
            className={`mt-4 items-center rounded-xl py-3 ${signature ? 'bg-green-50' : 'bg-primary'}`}>
            <Text className={`font-bold ${signature ? 'text-green-700' : 'text-white'}`}>
              {signature ? '✓ FIRMA CAPTURADA' : 'CONFIRMAR FIRMA'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Acción Final */}
        <TouchableOpacity
          onPress={handleFinishDelivery}
          disabled={!canFinish}
          className={`mb-10 items-center rounded-2xl py-5 shadow-lg ${
            canFinish ? 'bg-dark' : 'bg-gray-200'
          }`}>
          {isSending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className={`text-lg font-bold ${canFinish ? 'text-white' : 'text-gray-400'}`}>
              Finalizar y Guardar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
