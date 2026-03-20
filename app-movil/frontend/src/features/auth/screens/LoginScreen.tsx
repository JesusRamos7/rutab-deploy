// src/features/auth/screends/LoginScreen.tsx

import React, { useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogin } from "../hooks/useLogin";

export const LoginScreen = () => {
  const { usuario, setUsuario, password, setPassword, loading, handleLogin } =
    useLogin();

  // Referencia para saltar al segundo input automáticamente
  const passwordRef = useRef<TextInput>(null);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-8 pt-12"
      >
        {/* === SECCIÓN LOGO === */}
        <View className="items-center mb-10">
          <View className="bg-gray-50 rounded-full w-32 h-32 justify-center items-center overflow-hidden border border-gray-100">
            <Image
              source={require("../../../assets/logo.png")}
              className="w-24 h-24"
              resizeMode="contain"
            />
          </View>

          <Text className="text-4xl font-bold text-center mt-5">
            <Text className="text-[#111827]">Ru</Text>
            <Text className="text-[#2563EB]">TAB</Text>
          </Text>

          <Text className="text-[10px] text-gray-400 text-center mt-2 tracking-[3px] font-bold uppercase">
            Transporte y Logística de Tabasco
          </Text>
        </View>

        {/* === FORMULARIO === */}
        <View className="w-full space-y-5">
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Usuario
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
              placeholder="ejemplo@rutab.com"
              placeholderTextColor="#9CA3AF"
              value={usuario}
              onChangeText={setUsuario}
              // Mejoras de seguridad y usabilidad:
              keyboardType="email-address" // Optimiza el teclado para correos (incluye @ y números)
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="email" // Ayuda al autocompletado seguro del sistema
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </Text>
            <TextInput
              ref={passwordRef}
              className="bg-gray-100 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
              placeholder="••••••••"
              secureTextEntry
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              // Mejoras de seguridad:
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          <TouchableOpacity
            className={`w-full h-14 rounded-2xl justify-center items-center mt-8 ${
              loading ? "bg-blue-300" : "bg-[#2563EB]"
            }`}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-lg font-bold">
                Iniciar Sesión
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
