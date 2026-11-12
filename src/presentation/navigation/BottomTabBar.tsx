import React from 'react';
import { useAppNavigation } from './NavigationContext';
import { BottomNavBar, BottomNavTab } from '@/presentation/components/common/BottomNavBar';

export const BottomTabBar: React.FC = () => {
  const { activeTab, switchTab } = useAppNavigation();

  return (
    <BottomNavBar
      activeTab={activeTab as BottomNavTab}
      onTabPress={(tab) => switchTab(tab)}
    />
  );
};
