// /frontend/src/features/road-incidents/screens/RoadIncidentsListScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  RoadIncidentsRoutes,
  RoadIncidentsStackParamList,
  MainDrawerParamList, // Asegúrate de exportar esto en navigation-types
  MainRoutes,
} from '../../../navigation/navigation-types';
import { apiClient } from '../../../core/api/apiClient';

// 1. Definimos la interfaz para evitar el error 'never'
interface Incident {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  fotoUrl?: string;
  pedidoId?: string;
  rutaId: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  codigoPedido?: string;
}

// 2. Definimos el tipo de navegación compuesta (Stack + Drawer)
type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RoadIncidentsStackParamList, RoadIncidentsRoutes.LIST>,
  DrawerNavigationProp<MainDrawerParamList>
>;

export const RoadIncidentsListScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // 3. Tipamos el useState para que sepa que recibirá un array de Incident
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = async () => {
    try {
      const { data } = await apiClient.get<Incident[]>('/mobile-app/evidence/incidents');
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchIncidents();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchIncidents();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'urgente':
        return 'text-red-500 bg-red-100';
      case 'resuelto':
        return 'text-green-500 bg-green-100';
      default:
        return 'text-amber-500 bg-amber-100';
    }
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
          {/* Ahora openDrawer ya no dará error */}
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
            <TouchableOpacity
              onPress={() => navigation.navigate(RoadIncidentsRoutes.FORM, { incidentId: item.id })}
              className="mb-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <View className="mb-2 flex-row items-start justify-between">
                <View className={`rounded-full px-3 py-1 ${getStatusColor(item.estado)}`}>
                  <Text className="text-[10px] font-black uppercase">{item.estado}</Text>
                </View>
                <Text className="text-[10px] font-bold text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text className="mb-1 text-lg font-black text-dark">{item.tipo}</Text>
              <Text className="text-sm font-bold text-gray-500" numberOfLines={2}>
                {item.descripcion}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <MaterialCommunityIcons name="shield-check-outline" size={80} color="#E5E7EB" />
              <Text className="mt-4 font-bold text-gray-400">Sin incidentes reportados</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate(RoadIncidentsRoutes.FORM, {})}
        className="absolute bottom-10 right-6 h-16 w-16 items-center justify-center rounded-3xl bg-primary shadow-xl shadow-primary/40">
        <MaterialCommunityIcons name="plus" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};
