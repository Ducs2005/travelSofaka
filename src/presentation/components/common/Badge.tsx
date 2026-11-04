import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';

export type BadgeVariant = 'teal' | 'coral' | 'amber' | 'slate' | 'outlined';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'teal',
  style,
  textStyle,
  icon,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    switch (variant) {
      case 'coral':
        return {
          backgroundColor: palette.coral[500],
        };
      case 'amber':
        return {
          backgroundColor: palette.amber[500],
        };
      case 'slate':
        return {
          backgroundColor: palette.slate[100],
        };
      case 'outlined':
        return {
          backgroundColor: palette.common.transparent,
          borderWidth: 1,
          borderColor: palette.teal[500],
        };
      case 'teal':
      default:
        return {
          backgroundColor: palette.teal[50],
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'coral':
      case 'amber':
        return {
          color: palette.common.white,
          fontWeight: typography.fontWeights.bold,
        };
      case 'slate':
        return {
          color: palette.slate[600],
          fontWeight: typography.fontWeights.semibold,
        };
      case 'outlined':
        return {
          color: palette.teal[600],
          fontWeight: typography.fontWeights.bold,
        };
      case 'teal':
      default:
        return {
          color: palette.teal[700],
          fontWeight: typography.fontWeights.semibold,
        };
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.text, getTextStyle(), textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.fontSizes['2xs'],
    textTransform: 'uppercase',
  },
});
