// src/navigation/styles/navigation-styles.ts
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const commonHeaderOptions: NativeStackNavigationOptions = {
  headerStyle: {
    backgroundColor: '#123a5d', // Color Primario (Celeste Negro)
  },
  headerTintColor: '#ffffff', // Blanco para contraste
  headerTitleStyle: {
    fontWeight: '700', // Reemplaza 'bold' por un peso numérico para mejor consistencia
    fontSize: 20,
  },
  headerShadowVisible: false,
  headerBackVisible: true, // Propiedad correcta para la visibilidad del botón
  headerTitleAlign: 'center',
  animation: 'slide_from_right',
  orientation: 'portrait',
  contentStyle: {
    backgroundColor: '#ffffff',
  },
};
