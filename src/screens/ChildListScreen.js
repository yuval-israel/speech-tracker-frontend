import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { authFetch } from '../api';

export default function ChildListScreen({ token, onSelectChild, onAddChild, onLogout }) {
  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch children list on mount
    let isMounted = true;
    const fetchChildren = async () => {
      try {
        const res = await authFetch('/children', token);
        if (!res.ok) {
          if (res.status === 401) {
            // Unauthorized (token might be expired or invalid)
            setError('Session expired. Please log in again.');
          } else {
            const data = await res.json().catch(() => ({}));
            const detail = data.detail || 'Failed to load children.';
            setError(detail);
          }
        } else {
          const data = await res.json();
          if (isMounted) {
            setChildren(data);
          }
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        if (isMounted) setError('Network error. Please try again.');
      }
    };
    fetchChildren();
    return () => { isMounted = false; };
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Children</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ScrollView style={styles.list}>
        {children.map(child => (
          <TouchableOpacity
            key={child.id}
            style={styles.childItem}
            onPress={() => onSelectChild(child)}
          >
            <Text style={styles.childName}>{child.name}</Text>
          </TouchableOpacity>
        ))}
        {children.length === 0 && !error ? (
          <Text style={styles.noChildren}>No child profiles found. Add a child to get started.</Text>
        ) : null}
      </ScrollView>
      <Button title="Add Child" onPress={onAddChild} />
      <Button title="Log Out" color="#555" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF'
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center'
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center'
  },
  list: {
    flex: 1,
    marginBottom: 16
  },
  childItem: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    marginBottom: 12
  },
  childName: {
    fontSize: 18
  },
  noChildren: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20
  }
});
