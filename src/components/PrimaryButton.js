import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Spacing, useTheme } from '../theme';

export default function PrimaryButton({ title, onPress, disabled, style, textStyle, accessibilityLabel }) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel || title}
      style={[
        styles.button,
        { backgroundColor: colors.primary },
        disabled && { backgroundColor: colors.muted },
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.sm + 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
