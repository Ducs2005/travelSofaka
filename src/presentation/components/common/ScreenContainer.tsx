import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { palette } from '@/core/theme';

export interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  isDark?: boolean;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  backgroundColor = palette.slate[50],
  isDark = false,
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
