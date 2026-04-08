// /mobile-app/frontend/src/features/routes/hooks/useRoutes.ts
import { Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../../core/context/AuthContext';
// Importamos los tipos y rutas globales Routes RoutesStackParamList
import { RoutesRoutes, RoutesStackParamList } from '../../../navigation/navigation-types';

export const useRoutes = () => {
  const { usuario, logout } = useAuth();
  const navigation = useNavigation<NavigationProp<RoutesStackParamList>>();

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
    navigation.navigate(RoutesRoutes.DETAIL, { id });
  };

  return {
    usuario,
    handleLogout,
    handleVerDetalle, // Ahora el hook resuelve todo
  };
};
