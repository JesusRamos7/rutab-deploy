// /frontend/src/features/road-incidents/navigation/RoadIncidentsNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  RoadIncidentsRoutes,
  RoadIncidentsStackParamList,
} from '../../../navigation/navigation-types';
import { RoadIncidentsListScreen } from '../screens/RoadIncidentsListScreen';
import { RoadIncidentsFormScreen } from '../screens/RoadIncidentsFormScreen';

const Stack = createNativeStackNavigator<RoadIncidentsStackParamList>();

export const RoadIncidentsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={RoadIncidentsRoutes.LIST} component={RoadIncidentsListScreen} />
      <Stack.Screen name={RoadIncidentsRoutes.FORM} component={RoadIncidentsFormScreen} />
    </Stack.Navigator>
  );
};
