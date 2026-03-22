// src/navigation/MainNavigator.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Pantallas
import { DashboardScreen } from "../features/dashboard/screens/DashboardScreen";
import { ProfileScreen } from "../features/profile/screens/ProfileScreen";

// Componente personalizado
import { CustomDrawerContent } from "./components/CustomDrawerContent";

const Drawer = createDrawerNavigator();

export const MainNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        // Estilos del Header (se mantienen similares a tu Stack original)
        headerStyle: { 
          backgroundColor: "#2563EB",
          elevation: 0, // Quita sombra en Android
          shadowOpacity: 0, // Quita sombra en iOS
        },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        
        // Estilos de la barra lateral
        drawerActiveBackgroundColor: "#EFF6FF", // Azul muy claro para el item activo
        drawerActiveTintColor: "#2563EB",       // Texto azul para el activo
        drawerInactiveTintColor: "#4B5563",     // Texto gris para inactivos
        drawerLabelStyle: {
          marginLeft: -10, // Ajuste fino para acercar el texto al icono
          fontWeight: "500",
        },
      }}
    >
      <Drawer.Screen
        name="MainDashboard"
        component={DashboardScreen}
        options={{
          title: "Inicio",
          drawerLabel: "Panel Principal",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Mi Perfil",
          drawerLabel: "Mi Perfil",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* A futuro, solo tendrás que añadir aquí los nuevos módulos:
          <Drawer.Screen name="Viajes" ... /> 
      */}
    </Drawer.Navigator>
  );
};