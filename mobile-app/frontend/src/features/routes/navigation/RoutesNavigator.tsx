// /mobile-app/frontend/src/features/routes/navigation/RoutesNavigator.tsx

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';
import { commonHeaderOptions } from '../../../navigation/styles/navigation-styles';

// Pantallas
import { RoutesScreen } from '../screens/RoutesScreen';
import { RoutesDetailScreen } from '../screens/RoutesDetailScreen';
import { DeliveryEvidenceScreen } from '../screens/DeliveryEvidenceScreen';

const Stack = createNativeStackNavigator<RoutesStackParamList>();

export const RoutesNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        ...commonHeaderOptions,
      }}>
      <Stack.Screen
        name={RoutesRoutes.HOME}
        component={RoutesScreen}
        options={({ navigation }) => ({
          title: 'RuTAB',
          // SOLUCIÓN: Forzamos a que no se vea la flecha de atrás en la Home
          headerBackVisible: false,
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
        component={RoutesDetailScreen}
        options={{ title: 'Detalle de Ruta' }}
      />

      <Stack.Screen
        name={RoutesRoutes.DELIVERY_EVIDENCE}
        component={DeliveryEvidenceScreen}
        options={{
          title: 'Confirmar Entrega',
          // En pantallas internas SI queremos que se vea la flecha,
          // por lo que no tocamos nada o aseguramos que esté en true
          headerBackVisible: true,
        }}
      />
    </Stack.Navigator>
  );
};
