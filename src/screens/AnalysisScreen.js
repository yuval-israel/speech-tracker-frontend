import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { authFetch } from '../api';

export default function AnalysisScreen({ token, recordingId, child, onBack }) {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchAnalysis = async () => {
      try {
        const res = await authFetch(`/analysis/recordings/${recordingId}`, token);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const detail = data.detail || 'Analysis not found.';
          throw new Error(detail);
        }
        const data = await res.json();
        if (isMounted) setAnalysis(data);
      } catch (err) {
        console.error('Error fetching analysis:', err);
        if (isMounted) setError(err.message || 'Failed to load analysis.');
      }
    };
    fetchAnalysis();
    return () => { isMounted = false; };
  }, [token, recordingId]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Session Analysis</Text>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.link} onPress={onBack}>Back to Recordings</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Session Analysis</Text>
        <Text style={styles.loading}>Loading analysis...</Text>
      </View>
    );
  }

  // Helper to format a number (especially floats) nicely
  const fmt = (num) => {
    if (typeof num === 'number') {
      return num.toFixed(2);
    }
    return num;
  };

  const { counts, lexical_diversity: lexDiv, mlu, speech, vocabulary } = analysis;
  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Session Analysis</Text>
      {child && <Text style={styles.subheader}>Child: {child.name}</Text>}
      {/* Lexical Counts */}
      <Text style={styles.sectionTitle}>Lexical Counts</Text>
      <Text>Utterances: {counts.utterances}</Text>
      <Text>Tokens (words): {counts.tokens_surface}</Text>
      <Text>Unique Words: {counts.types_surface}</Text>
      <Text>Hapax Legomena (words said once): {counts.hapax_surface}</Text>
      {/* MLU */}
      <Text style={styles.sectionTitle}>Mean Length of Utterance (MLU)</Text>
      <Text>MLU (Words): {fmt(mlu.mlu_words)}</Text>
      <Text>MLU (Morphemes): {fmt(mlu.mlu_morphemes)}</Text>
      {/* Lexical Diversity */}
      <Text style={styles.sectionTitle}>Lexical Diversity</Text>
      <Text>TTR (Type-Token Ratio, surface): {fmt(lexDiv.ttr_surface)}</Text>
      <Text>TTR (lemma): {fmt(lexDiv.ttr_lemma)}</Text>
      {/* Speech Metrics */}
      <Text style={styles.sectionTitle}>Speech Metrics</Text>
      <Text>Total Speech Duration: {fmt(speech.total_speech_duration_seconds)} sec</Text>
      <Text>Overall WPM (incl. pauses): {fmt(speech.overall_wpm_including_pauses)}</Text>
      <Text>Articulation WPM (excl. pauses): {fmt(speech.articulation_wpm_excluding_between_pauses)}</Text>
      {/* Vocabulary (Top words) */}
      <Text style={styles.sectionTitle}>Top Words Used</Text>
      {vocabulary.surface_top_50.slice(0, 5).map(([word, count]) => (
        <Text key={word}>- {word}: {count}</Text>
      ))}
      <Text style={styles.backLink} onPress={onBack}>Back to Recordings</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  container: {
    padding: 24
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  subheader: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center'
  },
  sectionTitle: {
    marginTop: 12,
    fontWeight: '600'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 8
  },
  loading: {
    fontStyle: 'italic',
    textAlign: 'center'
  },
  backLink: {
    marginTop: 24,
    color: '#0066CC',
    textAlign: 'center',
    textDecorationLine: 'underline'
  }
});
