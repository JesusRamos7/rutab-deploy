// src/feature/routes/navigation/RoutesNavigator.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';
import { commonHeaderOptions } from '../../../navigation/styles/navigation-styles';

// Pantallas
import { RoutesScreen } from '../screens/RoutesScreen';
import { RoutesDetailScreen } from '../screens/RoutesDetailScreen'; // <--- Importación clave
import { DeliveryEvidenceScreen } from '../screens/DeliveryEvidenceScreen';

const Stack = createNativeStackNavigator<RoutesStackParamList>();

export const RoutesNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...commonHeaderOptions,
        headerTitleAlign: 'center', // Mantiene el título fijo en el medio en ambas pantallas
        headerBackTitle: '', // Evita que aparezca el texto "Atrás" que empuja el título
      }}>
      <Stack.Screen
        name={RoutesRoutes.HOME}
        component={RoutesScreen}
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
        name={RoutesRoutes.DETAIL}
        component={RoutesDetailScreen} // <--- CAMBIO AQUÍ: Ahora usa la pantalla de detalle
        options={{ title: 'Información de Ruta' }}
      />

      <Stack.Screen
        name={RoutesRoutes.DELIVERY_EVIDENCE}
        component={DeliveryEvidenceScreen}
        options={{ title: 'Confirmar Entrega' }}
      />
    </Stack.Navigator>
  );
};
