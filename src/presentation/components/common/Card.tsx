import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps } from 'react-native';
import { palette, radii, spacing, shadows } from '@/core/theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'flat' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'flat',
  padding = 'md',
  ...props
}) => {
  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return spacing.base; // 12
      case 'lg':
        return spacing['2xl']; // 20
      case 'md':
      default:
        return spacing.xl; // 16
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: palette.common.white,
          borderWidth: 1,
          borderColor: palette.slate[100],
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: palette.common.white,
          borderWidth: 1,
          borderColor: palette.slate[200],
        };
      case 'flat':
      default:
        return {
          backgroundColor: palette.common.white,
          borderWidth: 1,
          borderColor: palette.slate[100],
          ...shadows.sm,
        };
    }
  };

  return (
    <View
      style={[
        styles.base,
        getVariantStyle(),
        { padding: getPadding() },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg, // rounded-2xl
    overflow: 'hidden',
  },
});
