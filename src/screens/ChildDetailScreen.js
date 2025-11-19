import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { apiJson } from '../api';

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
        const data = await apiJson(`/children/${childId}/recordings`, token);
        if (isMounted) setRecordings(data || []);
      } catch (err) {
        console.error('Error fetching recordings:', err);
        if (isMounted) {
          if (err && err.status === 401) {
            setError('Session expired. Please log in again.');
          } else if (err && err.message) {
            setError(err.message);
          } else {
            setError('Error loading recordings.');
          }
        }
      }
    };
    // Fetch global analysis summary for child
    const fetchGlobal = async () => {
      try {
        const data = await apiJson(`/analysis/children/${childId}/global`, token);
        if (isMounted) setGlobalAnalysis(data);
      } catch (err) {
        // If 404 or other error, treat as no global analysis available
        if (isMounted) setGlobalAnalysis(null);
        console.error('Error fetching global analysis (may be absent):', err);
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
        {recordings.length === 0 && !error ? (
          <Text style={styles.noRecordings}>No recordings yet.</Text>
        ) : null}
        {recordings.map(rec => {
          const status = rec.status || rec.state || 'unknown';
          const ready = status === 'ready' || status === 'completed';
          return (
            <TouchableOpacity
              key={rec.id}
              style={styles.recordingItem}
            >
              <Text style={styles.recordingText}>{formatDateTime(rec.created_at)}</Text>
              <Text style={styles.recordingStatus}>{ready ? 'Completed' : status}</Text>
              {ready ? (
                <Button title="View Analysis" onPress={() => onViewAnalysis(rec.id)} />
              ) : (
                <Text style={styles.processingText}>Processing...</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.actions}>
        <Button title="New Recording" onPress={() => onStartRecording(child)} />
      <Button title="Back to Children" color="#555" onPress={onBack} />
      </View>
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
  ,
  recordingStatus: {
    fontSize: 14,
    color: '#333',
    marginTop: 6
  },
  processingText: {
    color: '#888',
    marginTop: 6
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  }
});
