// src/navigation/AppDrawer.tsx

import { createDrawerNavigator } from '@react-navigation/drawer';
import { DashboardScreen } from '@/modules/dashboard/screens/DashboardScreen';

const Drawer = createDrawerNavigator();

export function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
      />
    </Drawer.Navigator>
  );
}