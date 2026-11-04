import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { palette, typography, radii, spacing, shadows } from '@/core/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = true,
  style,
  textStyle,
  icon,
  disabled,
  ...props
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radii.lg, // rounded-2xl
      opacity: disabled || isLoading ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
    };

    // Size
    switch (size) {
      case 'sm':
        Object.assign(base, { paddingVertical: 8, paddingHorizontal: 12 });
        break;
      case 'lg':
        Object.assign(base, { paddingVertical: 14, paddingHorizontal: 20 });
        break;
      case 'md':
      default:
        Object.assign(base, { paddingVertical: 12, paddingHorizontal: 16 });
        break;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        Object.assign(base, {
          backgroundColor: palette.coral[500],
          ...shadows.sm,
        });
        break;
      case 'outline':
        Object.assign(base, {
          backgroundColor: palette.common.white,
          borderWidth: 1,
          borderColor: palette.slate[200],
        });
        break;
      case 'ghost':
        Object.assign(base, {
          backgroundColor: 'transparent',
        });
        break;
      case 'primary':
      default:
        Object.assign(base, {
          backgroundColor: palette.teal[600],
          ...shadows.sm,
        });
        break;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: typography.fontWeights.bold,
      fontSize: size === 'sm' ? typography.fontSizes.sm : typography.fontSizes.base,
    };

    switch (variant) {
      case 'outline':
        Object.assign(base, { color: palette.slate[800] });
        break;
      case 'ghost':
        Object.assign(base, { color: palette.teal[600] });
        break;
      case 'secondary':
      case 'primary':
      default:
        Object.assign(base, { color: palette.common.white });
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || isLoading}
      style={[getContainerStyle(), style]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? palette.teal[600] : palette.common.white}
        />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text style={[getTextStyle(), icon ? { marginLeft: 8 } : undefined, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
