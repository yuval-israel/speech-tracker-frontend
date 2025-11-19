import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';

export default function PrimaryButton({ title, onPress, disabled, style, textStyle, accessibilityLabel }) {
  return (
    <TouchableOpacity
      accessibilityLabel={accessibilityLabel || title}
      style={[styles.button, disabled ? styles.disabled : null, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120
  },
  text: {
    color: '#fff',
    fontSize: Typography.body,
    fontWeight: '600'
  },
  disabled: {
    backgroundColor: '#93C5FD'
  }
});
