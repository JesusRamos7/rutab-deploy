// src/navigation/MainNavigator.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#2563EB" }, // Tu azul principal
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="MainDashboard"
        component={DashboardScreen}
        options={{ title: "RuTAB Choferes" }}
      />
      {/* Aquí registraremos los próximos módulos: Viajes, Rutas, etc. */}

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Mi Perfil" }}
      />
    </Stack.Navigator>
  );
};
