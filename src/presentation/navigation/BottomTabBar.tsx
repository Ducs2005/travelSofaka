import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { palette, typography, spacing } from '@/core/theme';
import { useAppNavigation } from './NavigationContext';
import { TabName } from './types';

export const BottomTabBar: React.FC = () => {
  const { activeTab, switchTab } = useAppNavigation();

  const tabs: { id: TabName; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'explore', label: 'Explore', icon: '🔍' },
    { id: 'trips', label: 'Trips', icon: '✈️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => switchTab(tab.id)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {isActive ? '● ' : ''}{tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: palette.common.white,
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    color: palette.slate[400],
  },
  tabIconActive: {
    color: palette.teal[600],
  },
});
