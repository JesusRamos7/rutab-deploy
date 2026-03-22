// src/navigation/index.ts

import { NavigationContainer } from '@react-navigation/native';
import { AppDrawer } from './AppDrawer';

export function Navigation() {
  return (
    <NavigationContainer>
      <AppDrawer />
    </NavigationContainer>
  );
}