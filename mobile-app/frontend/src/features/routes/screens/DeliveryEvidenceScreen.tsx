import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';

import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';

export const DeliveryEvidenceScreen = () => {
  const route = useRoute<RouteProp<RoutesStackParamList, RoutesRoutes.DELIVERY_EVIDENCE>>();
  const navigation = useNavigation<NativeStackNavigationProp<RoutesStackParamList>>();

  const { pedidoId, cliente } = route.params;

  const [image, setImage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  // NUEVO: Estado para controlar si el ScrollView está activo o bloqueado
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const signatureRef = useRef<SignatureViewRef>(null);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se requiere acceso a la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSignatureOK = (signatureBase64: string) => {
    setSignature(signatureBase64);
  };

  const handleClearSignature = () => {
    signatureRef.current?.clearSignature();
    setSignature(null);
  };

  // Funciones para bloquear/desbloquear el scroll
  const handleBegin = () => setScrollEnabled(false);
  const handleEnd = () => setScrollEnabled(true);

  const canFinish = image !== null && signature !== null;

  const handleFinishDelivery = () => {
    if (!canFinish) return;
    Alert.alert('Entrega Confirmada', `El pedido ${pedidoId} ha sido finalizado.`, [
      { text: 'Entendido', onPress: () => navigation.navigate(RoutesRoutes.HOME) },
    ]);
  };

  return (
    // ASIGNAMOS el estado scrollEnabled aquí
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
        {/* Sección de Foto */}
        <View className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-black/5">
          <Text className="text-dark mb-4 text-lg font-bold">Foto del paquete</Text>
          <TouchableOpacity
            onPress={takePhoto}
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

        {/* Sección de Firma con Bloqueo de Scroll */}
        <View className="mb-8 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl shadow-black/5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-dark text-lg font-bold">Firma del cliente</Text>
            {signature && (
              <TouchableOpacity onPress={handleClearSignature}>
                <Text className="text-xs font-bold uppercase text-red-600">Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View className="h-64 w-full overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <SignatureScreen
              ref={signatureRef}
              onOK={handleSignatureOK}
              onEmpty={() => setSignature(null)}
              // USAMOS estas propiedades para controlar el scroll del padre
              onBegin={handleBegin}
              onEnd={handleEnd}
              descriptionText="Firme aquí"
              webStyle={`.m-signature-pad { border: none; box-shadow: none; height: 100%; } 
                         .m-signature-pad--footer { display: none; }
                         body, html { height: 100%; overflow: hidden; }`}
            />
          </View>

          <TouchableOpacity
            onPress={() => signatureRef.current?.readSignature()}
            className={`mt-4 items-center rounded-xl py-3 ${signature ? 'bg-green-50' : 'bg-primary'}`}>
            <Text className={`font-bold ${signature ? 'text-green-700' : 'text-white'}`}>
              {signature ? '✓ FIRMA CAPTURADA' : 'CONFIRMAR FIRMA'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleFinishDelivery}
          disabled={!canFinish}
          className={`mb-10 items-center rounded-2xl py-5 shadow-lg ${
            canFinish ? 'bg-dark' : 'bg-gray-200'
          }`}>
          <Text className={`text-lg font-bold ${canFinish ? 'text-white' : 'text-gray-400'}`}>
            Finalizar y Guardar
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
