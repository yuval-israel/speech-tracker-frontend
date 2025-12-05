import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiJson } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { Spacing, useTheme } from '../theme';
import { calculateAge } from '../utils/dateUtils';

export default function ChildListScreen() {
  const navigation = useNavigation();
  const { token, signOut, setSelectedChild } = useAuth();
  const { colors } = useTheme();

  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchChildren = useCallback(async () => {
    if (!token) return;
    setError('');
    setLoading(true);
    try {
      const data = await apiJson('/children/', token);
      setChildren(data || []);
    } catch (err) {
      console.error('Error fetching children:', err);
      if (err && err.status === 401) {
        setError('Session expired.');
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchChildren();
    }, [fetchChildren])
  );

  const onChildSelected = (child) => {
    setSelectedChild(child); // Update global context
    // If we came from a specific flow, we might want to go back, but for now specific navigation to detail is fine
    // or navigation.goBack() if we treat this as a picker?
    // Let's stick to navigating to detail, but now the "current" child is set.
    navigation.navigate('ChildDetail', { childId: child.id, name: child.name });
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="h1" align="center">My Children</Text>
      </View>

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchChildren} />
        }
      >
        {children.map(child => (
          <TouchableOpacity
            key={child.id}
            style={[styles.childItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onChildSelected(child)}
          >
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{child.name.charAt(0)}</Text>
            </View>
            <View style={styles.childInfo}>
              <Text variant="h3">{child.name}</Text>
              <Text variant="small">Age: {calculateAge(child.birthdate)}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {!loading && children.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <Text style={[styles.noChildren, { color: colors.textLight }]}>No child profiles found.</Text>
            <PrimaryButton title="Add first child" onPress={() => navigation.navigate('AddChild')} />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Add Child" onPress={() => navigation.navigate('AddChild')} />
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Text color={colors.muted} align="center">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  error: {
    marginBottom: Spacing.md,
    textAlign: 'center'
  },
  list: {
    flex: 1,
    marginBottom: Spacing.md
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl
  },
  noChildren: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  footer: {
    gap: Spacing.md,
  },
  logoutButton: {
    padding: Spacing.sm,
  }
});
