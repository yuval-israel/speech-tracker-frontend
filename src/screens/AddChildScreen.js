import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiJson } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Layout } from '../theme';

export default function AddChildScreen() {
  const navigation = useNavigation();
  const { token } = useAuth();

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('male'); // 'male' or 'female'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedDate = birthDate.toISOString().split('T')[0];
      const childPayload = {
        name: name.trim(),
        birth_date: formattedDate,
        gender: gender
      };

      console.log('Sending child data:', childPayload);

      const childData = await apiJson('/children/', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          birth_date: formattedDate,
          gender: gender
        })
      });

      // CRITICAL CHANGE: Navigate to Calibration, NOT back to list
      navigation.navigate('VoiceCalibration', {
        childId: childData.id,
        childName: childData.name
      });
    } catch (err) {
      console.error('Error adding child:', err);
      setError(err.message || 'Failed to add child.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text color={Colors.primary}>Cancel</Text>
        </TouchableOpacity>
        <Text variant="h2">Add Child</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.form}>
        <Text variant="label">Name</Text>
        {Platform.OS === 'web' ? (
          <input
            type="text"
            id="childNameInput"
            style={{
              borderWidth: 1,
              borderColor: '#e0e0e0',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              marginBottom: 12,
              backgroundColor: '#fff',
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
            defaultValue={name}
            onChange={(e) => {
              setName(e.target.value);
              console.log('Name updated to:', e.target.value);
            }}
            placeholder="Child's Name"
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Child's Name"
            value={name}
            onChangeText={setName}
          />
        )}

        <Text variant="label">Birth Date</Text>
        {Platform.OS === 'android' && (
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
            <Text>{birthDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        {(showDatePicker || Platform.OS === 'ios') && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            style={styles.datePicker}
          />
        )}

        <Text variant="label" style={{ marginTop: Spacing.md }}>Gender</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderButton, gender === 'male' && styles.genderActive]}
            onPress={() => setGender('male')}
          >
            <Text color={gender === 'male' ? Colors.white : Colors.text}>Boy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, gender === 'female' && styles.genderActive]}
            onPress={() => setGender('female')}
          >
            <Text color={gender === 'female' ? Colors.white : Colors.text}>Girl</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title="Save Profile"
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        />

        {loading && <LoadingIndicator text="Saving..." />}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    padding: Spacing.sm,
  },
  form: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
    textAlign: 'left',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  datePicker: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  genderButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  genderActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  error: {
    color: Colors.danger,
    marginBottom: Spacing.md,
    textAlign: 'center'
  },
  saveButton: {
    marginTop: Spacing.lg,
  }
});
