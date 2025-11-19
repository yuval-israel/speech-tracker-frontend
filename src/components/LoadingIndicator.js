import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';

export default function LoadingIndicator({ size = 'small', text }) {
  return (
    <View style={styles.row}>
      <ActivityIndicator size={size} color={Colors.primary} />
      {text ? <Text style={styles.text}>{text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    marginLeft: Spacing.sm,
    color: Colors.muted,
    fontSize: Typography.small
  }
});
