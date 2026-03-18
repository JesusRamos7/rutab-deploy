// frontend/src/features/auth/screens/LoginScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image, 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../core/context/AuthContext";
import { loginService } from "../services/auth.service";

export const LoginScreen = () => {
  // --- LÓGICA EXISTENTE ADAPTADA A LOS NUEVOS LABELS ---
  // Cambiamos 'correo' por 'usuario' para coincidir con la UI
  const [usuario, setUsuario] = useState("");
  const [password, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!usuario || !password) {
      Alert.alert("Atención", "Por favor ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      // Mapeamos visualmente Usuario/Contraseña de vuelta al servicio
      // Asumimos que loginService espera (usuario/correo, password)
      const data = await loginService(usuario, password);

      if (data.tipo !== "CHOFER") {
        throw new Error("Esta aplicación es exclusiva para choferes.");
      }

      await login(data.access_token, data.usuario);
    } catch (error: any) {
      const mensajeError =
        error.response?.data?.message ||
        error.message ||
        "Error al iniciar sesión";
      Alert.alert("Error de Acceso", mensajeError);
    } finally {
      setLoading(false);
    }
  };
  // -----------------------------------

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-8 pt-12" // Padding y margen superior
      >
        
        {/* === SECCIÓN DEL LOGO (Estrictamente el círculo y texto) === */}
        <View className="items-center mb-10">
          {/* Contenedor circular para el logo.
            He dejado el apartado para que pongas tu ruta.
            Cambia 'require("../../../assets/logo_circular.png")' por la ruta real de tu imagen.
          */}
          <View className="p-3 bg-gray-50 rounded-full w-28 h-28 justify-center items-center">
            <Image 
              source={require("../../../assets/logo.png")} // <-- PON TU RUTA DE LOGO AQUÍ
              className="w-60 h-60"
              resizeMode="contain"
            />
          </View>
          
          {/* Texto RuTAB */}
          <Text className="text-4xl font-bold text-center mt-5">
            <Text className="text-black">Ru</Text>
            <Text className="text-blue-600">TAB</Text>
          </Text>
          
          {/* Subtexto */}
          <Text className="text-base text-gray-500 text-center mt-2 font-medium">
            TRANSPORTE Y LOGÍSTICA DE TABASCO
          </Text>
        </View>
        {/* ========================================================== */}


        {/* Formulario (espaciado entre elementos) */}
        <View className="w-full space-y-6">
          
          {/* Input de Usuario */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Usuario</Text>
            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#9CA3AF"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>

          {/* Input de Contraseña */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">Contraseña</Text>
            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
              placeholder="Ingresa tu contraseña"
              secureTextEntry
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setContrasena}
            />
          </View>

          {/* Botón de Iniciar Sesión (azul oscuro, completamente redondeado) */}
          <TouchableOpacity
            className={`w-full h-14 rounded-full justify-center items-center mt-10 ${
              loading ? "bg-blue-300" : "bg-blue-600"
            }`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-xl font-bold">
                Iniciar Sesión
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};