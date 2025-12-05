import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { apiJson } from '../api';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import LoadingIndicator from '../components/LoadingIndicator';
import { useAuth } from '../context/AuthContext';
import { Spacing, useTheme } from '../theme';
import { calculateAge } from '../utils/dateUtils';

export default function ChildDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = useAuth();
  const { colors } = useTheme();

  const { childId, name } = route.params || {};

  const [child, setChild] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    setError('');
    if (!isRefresh) setLoading(true);
    try {
      // Fetch child details
      const childData = await apiJson(`/children/${childId}`, token);
      setChild(childData);

      // Fetch recordings for this child
      const recordingsData = await apiJson(`/recordings/${childId}`, token);
      setRecordings(recordingsData || []);
    } catch (err) {
      console.error('Error fetching child details:', err);
      if (err && err.message) {
        setError(err.message);
      } else {
        setError('Failed to load child details.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [childId, token]);

  // Refresh recordings when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (childId && token) {
        fetchData();
      }
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return colors.success;
      case 'queued':
      case 'transcribing':
      case 'analyzing':
        return colors.warning;
      case 'failed':
        return colors.danger;
      default:
        return colors.textLight;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'queued':
        return 'Queued';
      case 'transcribing':
        return 'Transcribing...';
      case 'analyzing':
        return 'Analyzing...';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const navigateToAnalysis = (recording) => {
    if (recording.status === 'ready') {
      navigation.navigate('Analysis', { recordingId: recording.id, child });
    }
  };

  if (loading && !refreshing) {
    return (
      <ScreenContainer>
        <LoadingIndicator text="Loading child details..." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text color={colors.primary}>← Back</Text>
        </TouchableOpacity>
        <Text variant="h2">{name || child?.name}</Text>
        <View style={{ width: 50 }} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {child && (
        <View style={[styles.childInfo, { backgroundColor: colors.surface }]}>
          <Text variant="h3">{child.name}</Text>
          <Text variant="small">
            Age: {calculateAge(child.birthdate)} • Gender: {child.gender}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text variant="h3" style={styles.sectionTitle}>Recordings</Text>

        {recordings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.noRecordings}>No recordings yet.</Text>
            <Text variant="small" align="center">
              Start recording to track speech development!
            </Text>
          </View>
        ) : (
          recordings.map(recording => (
            <TouchableOpacity
              key={recording.id}
              style={[styles.recordingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigateToAnalysis(recording)}
              disabled={recording.status !== 'ready'}
            >
              <View style={styles.recordingHeader}>
                <Text variant="body" style={styles.recordingText}>
                  Recording #{recording.id}
                </Text>
                <Text
                  variant="small"
                  style={{ color: getStatusColor(recording.status) }}
                >
                  {getStatusText(recording.status)}
                </Text>
              </View>
              {recording.created_at && (
                <Text variant="small">
                  {new Date(recording.created_at).toLocaleDateString()} at{' '}
                  {new Date(recording.created_at).toLocaleTimeString()}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title="New Recording"
          onPress={() => navigation.navigate('Record', { childId, childName: child?.name })}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  childInfo: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: 12,
  },
  error: {
    color: '#E57373',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  recordingItem: {
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  recordingText: {
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  noRecordings: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  footer: {
    gap: Spacing.md,
  },
});
