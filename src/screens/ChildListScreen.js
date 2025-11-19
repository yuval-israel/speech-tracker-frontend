import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { apiJson } from '../api';

export default function ChildListScreen({ token, onChildSelected, onAddChild, onLogout }) {
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
        // apiJson will have triggered onUnauthorized already; show brief message
        setError('Session expired. Please log in again.');
        if (onLogout) onLogout();
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
    let isMounted = true;
    if (isMounted) fetchChildren();
    return () => { isMounted = false; };
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Children</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ScrollView style={styles.list} refreshControl={null}>
        {loading ? <Text style={styles.loading}>Loading...</Text> : null}
        {children.map(child => (
          <TouchableOpacity
            key={child.id}
            style={styles.childItem}
            onPress={() => onChildSelected(child)}
          >
            <Text style={styles.childName}>{child.name}</Text>
          </TouchableOpacity>
        ))}
        {!loading && children.length === 0 && !error ? (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={styles.noChildren}>No child profiles found.</Text>
            <Button title="Add first child" onPress={onAddChild} />
          </View>
        ) : null}
      </ScrollView>
      <Button title="Refresh" onPress={fetchChildren} disabled={loading} />
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
  ,
  loading: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#666'
  }
});
