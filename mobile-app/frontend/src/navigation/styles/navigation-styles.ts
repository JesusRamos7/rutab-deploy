// src/navigation/styles/navigation-styles.ts
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const commonHeaderOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: '#123a5d',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerShadowVisible: false, // Limpieza visual
  animation: 'slide_from_right', // Animación más natural en Android
  orientation: 'portrait',
  contentStyle: { backgroundColor: '#FFFFFF' },
};
