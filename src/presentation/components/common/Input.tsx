import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { palette, typography, radii, spacing } from '@/core/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  rightElement,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          error ? styles.inputWrapperError : undefined,
        ]}
      >
        <TextInput
          placeholderTextColor={palette.slate[400]}
          style={[styles.input, inputStyle]}
          {...props}
        />
        {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: palette.slate[600],
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.slate[50],
    borderWidth: 1,
    borderColor: palette.slate[200],
    borderRadius: radii.lg, // rounded-2xl
    paddingHorizontal: spacing.xl,
    minHeight: 46,
  },
  inputWrapperError: {
    borderColor: palette.rose[500],
  },
  input: {
    flex: 1,
    fontSize: typography.fontSizes.base,
    color: palette.slate[800],
    paddingVertical: spacing.md,
  },
  rightElement: {
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: palette.rose[500],
    marginTop: spacing.xs,
  },
});
