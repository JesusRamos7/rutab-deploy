// /mobile-app/frontend/src/features/routes/components/RoutesLoadingView.tsx

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export const RoutesLoadingView = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <ActivityIndicator size="large" color="#123a5d" />
    <Text className="mt-4 font-medium text-gray-500">Actualizando información...</Text>
  </View>
);
