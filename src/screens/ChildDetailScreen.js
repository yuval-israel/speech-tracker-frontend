import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { authFetch } from '../api';

export default function ChildDetailScreen({ token, child, onStartRecording, onViewAnalysis, onBack }) {
  const [recordings, setRecordings] = useState([]);
  const [globalAnalysis, setGlobalAnalysis] = useState(null);
  const [error, setError] = useState('');

  const childId = child.id;

  useEffect(() => {
    let isMounted = true;
    // Fetch child's recordings
    const fetchRecordings = async () => {
      try {
        const res = await authFetch(`/recordings/${childId}`, token);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const detail = data.detail || 'Failed to load recordings.';
          throw new Error(detail);
        }
        const data = await res.json();
        if (isMounted) setRecordings(data);
      } catch (err) {
        console.error('Error fetching recordings:', err);
        if (isMounted) setError(err.message || 'Error loading recordings.');
      }
    };
    // Fetch global analysis summary for child
    const fetchGlobal = async () => {
      try {
        const res = await authFetch(`/analysis/children/${childId}/global`, token);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setGlobalAnalysis(data);
        } else {
          // If 404 or error, no global analysis yet
          if (isMounted) setGlobalAnalysis(null);
        }
      } catch (err) {
        console.error('Error fetching global analysis:', err);
      }
    };
    fetchRecordings();
    fetchGlobal();
    return () => { isMounted = false; };
  }, [token, childId]);

  const formatDateTime = (dt) => {
    try {
      const d = new Date(dt);
      return d.toLocaleString();
    } catch {
      return dt;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{child.name}'s Recordings</Text>
      <View style={styles.subheader}>
        {child.birthdate ? (
          <Text style={styles.subheaderText}>DOB: {child.birthdate}</Text>
        ) : null}
        {globalAnalysis && (
          <Text style={styles.subheaderText}>
            Total Sessions: {globalAnalysis.aggregates.total_sessions}
          </Text>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ScrollView style={styles.list}>
        {recordings.map(rec => {
          const status = rec.status;
          const ready = status === 'ready';
          return (
            <TouchableOpacity
              key={rec.id}
              style={styles.recordingItem}
              onPress={() => ready && onViewAnalysis(rec.id)}
              disabled={!ready}
            >
              <Text style={styles.recordingText}>
                {formatDateTime(rec.created_at)}{ready ? '' : ' (' + status + ')'}
              </Text>
            </TouchableOpacity>
          );
        })}
        {recordings.length === 0 && !error ? (
          <Text style={styles.noRecordings}>No recordings yet.</Text>
        ) : null}
      </ScrollView>
      <Button title="New Recording" onPress={onStartRecording} />
      <Button title="Back to Children" color="#555" onPress={onBack} />
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  subheader: {
    marginBottom: 16,
    alignItems: 'center'
  },
  subheaderText: {
    fontSize: 14,
    color: '#555'
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
  recordingItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 4,
    marginBottom: 8
  },
  recordingText: {
    fontSize: 16
  },
  noRecordings: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20
  }
});
