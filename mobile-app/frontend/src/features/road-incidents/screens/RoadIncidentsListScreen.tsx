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

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RoadIncidentsStackParamList, RoadIncidentsRoutes.LIST>,
  DrawerNavigationProp<MainDrawerParamList>
>;

export const RoadIncidentsListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { incidents, loading, refreshing, onRefresh, deleteIncident } = useRoadIncidents();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'urgente':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'resuelta':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  const handleDeletePress = (id: string) => {
    Alert.alert('Eliminar Reporte', '¿Estás seguro? Esta acción es irreversible.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteIncident(id) },
    ]);
  };

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

      {loading ? (
        <View className="flex-1 justify-center">
          <ActivityIndicator color="#123a5d" />
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <IncidentCard
              item={item}
              getStatusColor={getStatusColor} // Pasamos la función de estilos
              onPress={(id) => navigation.navigate(RoadIncidentsRoutes.FORM, { incidentId: id })}
              onDelete={handleDeletePress}
            />
          )}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <MaterialCommunityIcons name="shield-check-outline" size={80} color="#E5E7EB" />
              <Text className="mt-4 font-bold text-gray-400">Sin incidentes reportados</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate(RoadIncidentsRoutes.FORM, {})}
        className="absolute bottom-10 right-6 h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/40">
        <MaterialCommunityIcons name="plus" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};
