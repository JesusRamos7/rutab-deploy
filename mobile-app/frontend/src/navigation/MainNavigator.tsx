// src/navigation/MainNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Tipos y Navigators internos
import { MainRoutes, MainDrawerParamList } from './navigation-types';
import { DashboardNavigator } from './DashboardNavigator';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen'; // Luego lo haremos Navigator
import { CustomDrawerContent } from './components/CustomDrawerContent';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

export const MainNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // El header lo manejan los Stacks internos
        drawerActiveBackgroundColor: '#EFF6FF',
        drawerActiveTintColor: '#123a5d',
        drawerInactiveTintColor: '#4B5563',
        drawerLabelStyle: {
          marginLeft: -10,
          fontWeight: '600',
        },
      }}>
      <Drawer.Screen
        name={MainRoutes.DASHBOARD_STACK}
        component={DashboardNavigator}
        options={{
          drawerLabel: 'Inicio',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name={MainRoutes.PROFILE}
        component={ProfileScreen}
        options={{
          drawerLabel: 'Mi Perfil',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};
