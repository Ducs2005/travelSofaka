import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { palette } from '@/core/theme';
import { ScreenContainer } from '@/presentation/components/common';
import { NavigationProvider } from '@/presentation/navigation/NavigationContext';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationProvider>
        <ScreenContainer backgroundColor={palette.slate[50]}>
          <StatusBar style="dark" />
          <RootNavigator />
        </ScreenContainer>
      </NavigationProvider>
    </SafeAreaProvider>
  );
}
