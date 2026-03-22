// src/navigation/AppNavigator.tsx

import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../core/context/AuthContext";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";

export const AppNavigator = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // Si hay token, cargamos el stack privado. Si no, el público.
  return token === null ? <AuthNavigator /> : <MainNavigator />;
};
