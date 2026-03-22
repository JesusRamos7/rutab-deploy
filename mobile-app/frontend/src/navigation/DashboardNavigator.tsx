// src/navigation/DashboardNavigator.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DashboardRoutes, DashboardStackParamList } from './navigation-types';
import { commonHeaderOptions } from './styles/navigation-styles';

// Pantallas
import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { DashboardDetailScreen } from '../features/dashboard/screens/DashboardDetailScreen'; // <--- Importación clave

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...commonHeaderOptions,
        headerTitleAlign: 'center', // Mantiene el título fijo en el medio en ambas pantallas
        headerBackTitle: '', // Evita que aparezca el texto "Atrás" que empuja el título
      }}>
      <Stack.Screen
        name={DashboardRoutes.HOME}
        component={DashboardScreen}
        options={({ navigation }) => ({
          title: 'RuTAB',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              className="mr-3"
              hitSlop={15}>
              <MaterialCommunityIcons name="menu" size={26} color="white" />
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name={DashboardRoutes.DETAIL}
        component={DashboardDetailScreen} // <--- CAMBIO AQUÍ: Ahora usa la pantalla de detalle
        options={{ title: 'Información de Ruta' }}
      />
    </Stack.Navigator>
  );
};
