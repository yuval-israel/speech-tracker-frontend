import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { apiJson } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Typography } from '../theme';
import { calculateAge } from '../utils/dateUtils';

export default function ChildListScreen() {
  const navigation = useNavigation();
  const { token, signOut } = useAuth();

  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchChildren = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await apiJson('/children/', token);
      setChildren(data || []);
    } catch (err) {
      console.error('Error fetching children:', err);
      if (err && err.status === 401) {
        // AuthContext handles global logout via api.js interceptor, 
        // but we can show a message here if needed
        setError('Session expired.');
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [token]);

  const onChildSelected = (child) => {
    navigation.navigate('ChildDetail', { childId: child.id, name: child.name });
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="h1" align="center">My Children</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchChildren} />
        }
      >
        {children.map(child => (
          <TouchableOpacity
            key={child.id}
            style={styles.childItem}
            onPress={() => onChildSelected(child)}
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{child.name.charAt(0)}</Text>
            </View>
            <View style={styles.childInfo}>
              <Text variant="h3">{child.name}</Text>
              <Text variant="small" color={Colors.textLight}>Age: {calculateAge(child.birth_date)}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {!loading && children.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <Text style={styles.noChildren}>No child profiles found.</Text>
            <PrimaryButton title="Add first child" onPress={() => navigation.navigate('AddChild')} />
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Add Child" onPress={() => navigation.navigate('AddChild')} />
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Text color={Colors.muted} align="center">Log Out</Text>
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
    color: Colors.danger,
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
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: Colors.white,
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
    color: Colors.textLight,
  },
  footer: {
    gap: Spacing.md,
  },
  logoutButton: {
    padding: Spacing.sm,
  }
});
