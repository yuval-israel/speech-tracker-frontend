import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { apiJson } from '../api';

export default function AddChildScreen({ token, onChildAdded, onCancel }) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');  // expected format YYYY-MM-DD
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddChild = async () => {
    setError('');
    if (!name || !birthdate || !gender) {
      setError('All fields are required.');
      return;
    }
    // simple YYYY-MM-DD validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
      setError('Birthdate must be in YYYY-MM-DD format.');
      return;
    }
    try {
      setLoading(true);
      const data = await apiJson('/children', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birthdate, gender: gender.toLowerCase() })
      });
      onChildAdded(data);
    } catch (err) {
      console.error('Error adding child:', err);
      if (err && err.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError('Network error. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Child Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Child's Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Birthdate (YYYY-MM-DD)"
        value={birthdate}
        onChangeText={setBirthdate}
      />
      <View style={styles.genderRow}>
        <Text style={styles.genderLabel}>Gender: </Text>
        <TouchableOpacity onPress={() => setGender('male')} style={[styles.genderOption, gender === 'male' && styles.genderSelected]}>
          <Text style={styles.genderOptionText}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setGender('female')} style={[styles.genderOption, gender === 'female' && styles.genderSelected]}>
          <Text style={styles.genderOptionText}>Female</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actionRow}>
        <Button title="Create Profile" onPress={handleAddChild} disabled={loading} />
        <Button title="Cancel" color="#555" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  genderLabel: {
    fontSize: 16,
    marginRight: 8
  },
  genderOption: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8
  },
  genderOptionText: {
    fontSize: 16
  },
  genderSelected: {
    backgroundColor: '#DDDDDD'
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center'
  }
  ,
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  }
});
