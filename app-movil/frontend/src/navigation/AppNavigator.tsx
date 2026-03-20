// src/navigation/AppNavigator.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../core/context/AuthContext";
import { LoginScreen } from "../features/auth/screens/LoginScreen";
import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { token, isLoading } = useAuth();

  // Mientras verifica si hay sesión guardada en el AsyncStorage, mostramos un loader
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token === null ? (
        // No hay sesión -> Mostrar Login
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // Hay sesión -> Mostrar App Principal
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      )}
    </Stack.Navigator>
  );
};
