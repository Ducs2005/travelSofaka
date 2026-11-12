import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, typography, radii, spacing } from '@/core/theme';

export type BottomNavTab = 'home' | 'explore' | 'trips' | 'profile';

interface BottomNavBarProps {
  activeTab?: BottomNavTab;
  onTabPress?: (tab: BottomNavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab = 'trips',
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 8);

  const tabs: Array<{
    id: BottomNavTab;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
  }> = [
    {
      id: 'home',
      label: 'Home',
      icon: (isActive) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
            stroke={isActive ? palette.teal[600] : palette.slate[400]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? `${palette.teal[600]}15` : 'none'}
          />
        </Svg>
      ),
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: (isActive) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle
            cx={12}
            cy={12}
            r={9}
            stroke={isActive ? palette.teal[600] : palette.slate[400]}
            strokeWidth={2}
          />
          <Path
            d="M15.5 8.5L13.5 13.5L8.5 15.5L10.5 10.5L15.5 8.5Z"
            stroke={isActive ? palette.teal[600] : palette.slate[400]}
            strokeWidth={1.8}
            fill={isActive ? palette.teal[600] : 'none'}
          />
        </Svg>
      ),
    },
    {
      id: 'trips',
      label: 'Trips',
      icon: (isActive) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7M4 7H20C21.1046 7 22 7.89543 22 9V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V9C2 7.89543 2.89543 7 4 7Z"
            stroke={isActive ? palette.teal[600] : palette.slate[400]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? `${palette.teal[600]}15` : 'none'}
          />
          <Path
            d="M2 13H22"
            stroke={isActive ? palette.teal[600] : palette.slate[400]}
            strokeWidth={1.8}
          />
        </Svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (isActive) => (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
            stroke={isActive ? palette.teal[600] : palette.slate[400]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx={12}
            cy={7}
            r={4}
            stroke={isActive ? palette.teal[600] : palette.slate[400]}
            strokeWidth={2}
            fill={isActive ? `${palette.teal[600]}15` : 'none'}
          />
        </Svg>
      ),
    },
  ];

  return (
    <View style={[styles.navBar, { paddingBottom: bottomInset, height: 56 + bottomInset }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabPress?.(tab.id)}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>{tab.icon(isActive)}</View>
            <View style={styles.labelRow}>
              {isActive && <View style={styles.activeDot} />}
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    backgroundColor: palette.common.white,
    borderTopWidth: 1,
    borderTopColor: palette.slate[100],
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: palette.teal[600],
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: typography.fontWeights.medium,
  },
  tabLabelActive: {
    color: palette.teal[600],
    fontWeight: typography.fontWeights.bold,
  },
  tabLabelInactive: {
    color: palette.slate[400],
  },
});
