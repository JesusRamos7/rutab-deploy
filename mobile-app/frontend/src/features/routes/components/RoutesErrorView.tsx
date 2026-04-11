// /mobile-app/frontend/src/features/routes/components/RoutesErrorView.tsx

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';

interface Props {
  error: string;
  onRefresh: () => void;
}

export const RoutesErrorView = ({ error, onRefresh }: Props) => {
  const errorOpacity = useSharedValue(0);
  const iconScale = useSharedValue(1);

  useEffect(() => {
    errorOpacity.value = withTiming(1, { duration: 600 });
    iconScale.value = withRepeat(
      withTiming(1.15, { duration: 800, easing: Easing.bezier(0.42, 0, 0.58, 1) }),
      -1,
      true
    );
  }, []);

  const animatedErrorStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
    transform: [{ translateY: interpolate(errorOpacity.value, [0, 1], [20, 0]) }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-white px-10">
      <Animated.View style={[animatedErrorStyle, { alignItems: 'center' }]}>
        <Animated.View style={animatedIconStyle}>
          <MaterialCommunityIcons name="alert-circle-outline" size={80} color="#9CA3AF" />
        </Animated.View>
        <Text className="mt-6 text-center text-xl font-bold text-gray-700">Algo salió mal</Text>
        <Text className="mt-2 text-center text-gray-500">{error}</Text>
        <TouchableOpacity
          onPress={onRefresh}
          className="mt-8 rounded-2xl bg-primary px-10 py-4 shadow-lg shadow-primary/30 active:scale-95">
          <Text className="text-lg font-bold text-white">Reintentar Búsqueda</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
