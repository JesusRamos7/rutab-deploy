// src/navigation/ProfileNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { DrawerActions } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ProfileScreen } from '../screens/ProfileScreen';
import { commonHeaderOptions } from '../../../navigation/styles/navigation-styles';

const Stack = createNativeStackNavigator();

export const ProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={commonHeaderOptions}>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={({ navigation }) => ({
          title: 'Mi Perfil',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              className="mr-3">
              <MaterialCommunityIcons name="menu" size={26} color="white" />
            </TouchableOpacity>
          ),
        })}
      />
      {/* Aquí irán: EditarPerfil, CambiarPassword, etc. */}
    </Stack.Navigator>
  );
};
