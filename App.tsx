import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { palette } from '@/core/theme';
import { ScreenContainer } from '@/presentation/components/common';
import { NavigationProvider } from '@/presentation/navigation/NavigationContext';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
import { startSyncEngine } from '@/data/datasources/sync';

export default function App() {
  // OFF-03: khởi động Sync Engine để tự đồng bộ sync_queue khi thiết bị có mạng trở lại
  useEffect(() => startSyncEngine(), []);

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
