import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import { Spacing, Layout, useTheme } from '../theme';
import { apiJson } from '../api';
import { useAuth } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

const RADIUS = 70;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LanguageUnitsRing = ({ percent, colors }) => {
    const clamped = Math.max(0, Math.min(100, percent || 0));
    const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * clamped) / 100;

    return (
        <View style={styles.ringContainer}>
            <Svg height={RADIUS * 2 + 20} width={RADIUS * 2 + 20}>
                <Rect
                    x={0}
                    y={0}
                    width={RADIUS * 2 + 20}
                    height={RADIUS * 2 + 20}
                    fill="transparent"
                />
                <SvgText
                    x="50%"
                    y="50%"
                    fontSize="32"
                    fill={colors.text}
                    textAnchor="middle"
                    alignmentBaseline="central"
                >
                    {`${clamped}%`}
                </SvgText>
            </Svg>
        </View>
    );
};

const VocabularyBars = ({ vocabulary, colors }) => {
    const entries = vocabulary || [];
    if (!entries.length) return <Text variant="small">No vocabulary data yet.</Text>;

    const maxValue = Math.max(...entries.map(e => e.value || 0), 1);

    return (
        <View style={{ gap: Spacing.sm }}>
            {entries.map((item) => {
                const width = (item.value / maxValue) * (screenWidth - Spacing.xl * 2);
                return (
                    <View key={item.label} style={styles.vocabRow}>
                        <Text style={styles.vocabLabel}>{item.label}</Text>
                        <View style={[styles.vocabBarBackground, { backgroundColor: colors.background }]}>
                            <View style={[styles.vocabBarFill, { width, backgroundColor: colors.primary }]} />
                        </View>
                        <Text variant="small">{item.value}</Text>
                    </View>
                );
            })}
        </View>
    );
};

const InteractionMeter = ({ score, colors }) => {
    const clamped = Math.max(0, Math.min(100, score || 0));

    return (
        <View>
            <View style={[styles.meterTrack, { backgroundColor: colors.background }]}>
                <View style={[styles.meterFill, { width: `${clamped}%`, backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.meterLabels}>
                <Text variant="small">Calm</Text>
                <Text variant="small">Engaged</Text>
                <Text variant="small">Overloaded</Text>
            </View>
        </View>
    );
};

export default function DataScreen() {
    const { token, selectedChild } = useAuth();
    const { colors } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!token || !selectedChild) return;
            setLoading(true);
            setError('');
            const cacheKey = `ANALYSIS_CACHE_${selectedChild.id}`;

            try {
                const result = await apiJson(`/analysis/children/${selectedChild.id}/global`, token);
                setData(result);
                await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
            } catch (err) {
                console.error('Failed to load analysis dashboard', err);

                try {
                    const cached = await AsyncStorage.getItem(cacheKey);
                    if (cached) {
                        setData(JSON.parse(cached));
                    } else {
                        if (err.status === 404) {
                            setData(null);
                        } else {
                            setError(err.message || 'Failed to load analysis.');
                        }
                    }
                } catch (cacheErr) {
                    setError(err.message || 'Failed to load analysis.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, selectedChild]);

    const aggregates = data?.aggregates ?? {};
    const dailyTargetUtterances = 50;
    const languagePercent = Math.min(100, Math.round((aggregates.total_utterances ?? 0) / dailyTargetUtterances * 100));

    const posDistribution = aggregates.pos_distribution ?? {};
    const vocabEntries = Object.entries(posDistribution)
        .filter(([label]) => ['NOUN', 'VERB', 'ADJ', 'ADV'].includes(label))
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value);

    const targetWPM = 100;
    const currentWPM = aggregates.articulation_wpm ?? 0;
    const interactionScore = Math.min(100, Math.round((currentWPM / targetWPM) * 50 + 25));

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="h1">Progress</Text>
            </View>

            <ScrollView>
                <View style={styles.section}>
                    <Text variant="h3" style={{ marginBottom: Spacing.md }}>Language Units</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <LanguageUnitsRing percent={languagePercent} colors={colors} />
                        <Text variant="body" align="center" style={{ marginTop: Spacing.md }}>
                            Daily target completion
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="h3" style={{ marginBottom: Spacing.md }}>Vocabulary Breakdown</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <VocabularyBars vocabulary={vocabEntries} colors={colors} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text variant="h3" style={{ marginBottom: Spacing.md }}>Interaction Meter</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <InteractionMeter score={interactionScore} colors={colors} />
                    </View>
                </View>

                {loading && (
                    <View style={styles.section}>
                        <Text variant="small">Loading latest data…</Text>
                    </View>
                )}

                {error ? (
                    <View style={styles.section}>
                        <Text style={{ color: colors.danger }}>{error}</Text>
                    </View>
                ) : null}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.xl,
        marginTop: Spacing.md,
    },
    section: {
        marginBottom: Spacing.xxl,
    },
    card: {
        padding: Spacing.md,
        borderRadius: 8,
        marginBottom: Spacing.sm,
        borderWidth: 1,
    },
    ringContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    vocabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    vocabLabel: {
        width: 80,
    },
    vocabBarBackground: {
        flex: 1,
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    vocabBarFill: {
        height: 10,
        borderRadius: 5,
    },
    meterTrack: {
        width: '100%',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    meterFill: {
        height: 12,
        borderRadius: 6,
    },
    meterLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
