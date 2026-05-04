// /frontend/src/features/road-incidents/screens/RoadIncidentsListScreen.tsx

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  RoadIncidentsRoutes,
  RoadIncidentsStackParamList,
  MainDrawerParamList,
} from '../../../navigation/navigation-types';
import { useRoadIncidents } from '../hooks/useRoadIncidents';
import { IncidentCard } from '../components/IncidentCard';
import { RoutesErrorView } from '../../routes/components/RoutesErrorView'; // Reutilizamos el componente de error

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RoadIncidentsStackParamList, RoadIncidentsRoutes.LIST>,
  DrawerNavigationProp<MainDrawerParamList>
>;

export const RoadIncidentsListScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // Extraemos 'error' del hook para manejo resiliente
  const { incidents, loading, refreshing, error, onRefresh, deleteIncident } = useRoadIncidents();

  /**
   * Determina los estilos basados en el estado.
   * Incluye safe-check para evitar crashes si status es null.
   */
  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || 'abierta';
    switch (normalizedStatus) {
      case 'urgente':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'resuelta':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  const handleDeletePress = (id: string) => {
    if (!id) return;

    Alert.alert(
      'Eliminar Reporte',
      '¿Estás seguro de que deseas eliminar este incidente? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteIncident(id),
        },
      ]
    );
  };

  // 1. ESTADO DE CARGA INICIAL
  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#123a5d" size="large" />
        <Text className="mt-4 font-medium text-gray-400">Cargando historial...</Text>
      </View>
    );
  }

  // 2. ESTADO DE ERROR (Si falla la API)
  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header simplificado para el error */}
        <View className="rounded-b-[30px] bg-dark px-6 pb-6 pt-14">
          <Text className="text-2xl font-black text-white">Incidencias</Text>
        </View>
        <RoutesErrorView error={error} onRefresh={onRefresh} />
      </View>
    );
  }

  // 3. VISTA PRINCIPAL
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="rounded-b-[30px] bg-dark px-6 pb-6 pt-14">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-black text-white">Incidencias</Text>
            <Text className="text-sm font-bold text-white/60">Reportes de trayecto</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            className="h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <MaterialCommunityIcons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={incidents || []} // Safe access
        keyExtractor={(item, index) => item?.id || index.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }} // Espacio para el FAB
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#123a5d']} />
        }
        renderItem={({ item }) => (
          <IncidentCard
            item={item}
            getStatusColor={getStatusColor}
            onPress={(id) => navigation.navigate(RoadIncidentsRoutes.FORM, { incidentId: id })}
            onDelete={handleDeletePress}
          />
        )}
        ListEmptyComponent={
          <View className="mt-20 items-center px-10">
            <MaterialCommunityIcons name="shield-check-outline" size={80} color="#E5E7EB" />
            <Text className="mt-4 text-center font-bold text-gray-400">
              No tienes incidencias registradas en este momento
            </Text>
          </View>
        }
      />

      {/* Botón Flotante (FAB) */}
      <TouchableOpacity
        onPress={() => navigation.navigate(RoadIncidentsRoutes.FORM, {})}
        activeOpacity={0.8}
        className="absolute bottom-10 right-6 h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/40">
        <MaterialCommunityIcons name="plus" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};
