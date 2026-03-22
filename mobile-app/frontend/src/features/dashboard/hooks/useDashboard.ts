// src/features/dashboard/hooks/useDashboard.ts
import { Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../../core/context/AuthContext';
// Importamos los tipos y rutas globales
import { DashboardRoutes, DashboardStackParamList } from '../../../navigation/navigation-types';

export const useDashboard = () => {
  const { usuario, logout } = useAuth();
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();

  // Tu lógica original de Logout
  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí, salir',
        style: 'destructive',
        onPress: async () => await logout(),
      },
    ]);
  };

  // Nueva lógica de navegación para el módulo
  const handleVerDetalle = (id: string) => {
    navigation.navigate(DashboardRoutes.DETAIL, { id });
  };

  return {
    usuario,
    handleLogout,
    handleVerDetalle, // Ahora el hook resuelve todo
  };
};
