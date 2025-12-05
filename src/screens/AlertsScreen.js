import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform, TextInput, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import { Spacing, useTheme } from '../theme';

const REMINDERS_STORAGE_KEY = 'PRACTICE_REMINDERS';
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function AlertsScreen() {
    const { colors } = useTheme();
    const [reminders, setReminders] = useState([]);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        isDestructive: false,
    });

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = async () => {
        try {
            const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                setReminders(data.reminders || []);
                setNotificationsEnabled(data.enabled || false);
            }
        } catch (err) {
            console.error('Failed to load reminders:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveReminders = async (newReminders, enabled) => {
        try {
            await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify({
                reminders: newReminders,
                enabled: enabled,
            }));
        } catch (err) {
            console.error('Failed to save reminders:', err);
        }
    };

    const showConfirmation = (title, message, onConfirm, isDestructive = false) => {
        setModalConfig({
            title,
            message,
            onConfirm,
            confirmText: isDestructive ? 'Delete' : 'Confirm',
            cancelText: 'Cancel',
            isDestructive,
        });
        setModalVisible(true);
    };

    const handleConfirm = () => {
        setModalVisible(false);
        modalConfig.onConfirm();
    };

    const addReminder = () => {
        const newReminder = {
            id: Date.now().toString(),
            context: '',
            startTime: '09:00',
            endTime: '10:00',
            selectedDays: [],
            enabled: true,
        };
        const newReminders = [...reminders, newReminder];
        setReminders(newReminders);
        saveReminders(newReminders, notificationsEnabled);
    };

    const handleDeleteReminder = useCallback((id) => {
        const doDelete = () => {
            setReminders(prevReminders => {
                const newReminders = prevReminders.filter(r => r.id !== id);
                saveReminders(newReminders, notificationsEnabled);
                return newReminders;
            });
        };

        if (Platform.OS === 'web') {
            showConfirmation('Delete Reminder', 'Are you sure you want to delete this reminder?', doDelete, true);
        } else {
            Alert.alert('Delete Reminder', 'Delete this reminder?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: doDelete }
            ]);
        }
    }, [notificationsEnabled]);

    const handleClearAll = useCallback(async () => {
        const confirmClear = async () => {
            if (Platform.OS !== 'web') {
                try {
                    await Notifications.cancelAllScheduledNotificationsAsync();
                } catch (err) {
                    console.warn('Failed to cancel notifications:', err);
                }
            }
            setReminders([]);
            saveReminders([], notificationsEnabled);
        };

        if (Platform.OS === 'web') {
            showConfirmation('Clear All', 'Are you sure you want to delete all reminders?', confirmClear, true);
        } else {
            Alert.alert('Clear All', 'Clear all reminders?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear All', style: 'destructive', onPress: confirmClear }
            ]);
        }
    }, [notificationsEnabled]);

    const updateReminder = (id, field, value) => {
        const newReminders = reminders.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        );
        setReminders(newReminders);
        saveReminders(newReminders, notificationsEnabled);
    };

    const toggleDay = (reminderId, dayIndex) => {
        const reminder = reminders.find(r => r.id === reminderId);
        if (!reminder) return;

        const newDays = reminder.selectedDays.includes(dayIndex)
            ? reminder.selectedDays.filter(d => d !== dayIndex)
            : [...reminder.selectedDays, dayIndex];

        updateReminder(reminderId, 'selectedDays', newDays);
    };

    const toggleNotifications = async (enabled) => {
        setNotificationsEnabled(enabled);
        saveReminders(reminders, enabled);
        if (!enabled && Platform.OS !== 'web') {
            try {
                await Notifications.cancelAllScheduledNotificationsAsync();
            } catch (err) {
                console.warn('Failed to cancel notifications:', err);
            }
        }
    };

    const scheduleAllNotifications = async () => {
        if (!notificationsEnabled) return;

        if (Platform.OS === 'web') {
            // Web doesn't support push notifications in this context
            // Just confirm visually
            // Use modal for consistency if needed, or just let pass
            alert('Reminders saved! (Web notifications not supported)');
            return;
        }

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Please enable notifications in settings.');
            return;
        }

        await Notifications.cancelAllScheduledNotificationsAsync();

        let scheduledCount = 0;
        for (const reminder of reminders) {
            if (!reminder.enabled || reminder.selectedDays.length === 0) continue;
            const [startHour, startMinute] = reminder.startTime.split(':').map(Number);
            for (const dayIndex of reminder.selectedDays) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: reminder.context || 'Practice Reminder',
                        body: `Time for recording! (${reminder.startTime} - ${reminder.endTime})`,
                    },
                    trigger: {
                        hour: startHour,
                        minute: startMinute,
                        weekday: dayIndex + 1,
                        repeats: true,
                    },
                });
                scheduledCount++;
            }
        }
        Alert.alert('Saved!', `${scheduledCount} reminder(s) scheduled.`);
    };

    if (loading) {
        return (
            <ScreenContainer>
                <Text>Loading...</Text>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="h1">Practice Reminders</Text>
                <Text variant="small" style={{ marginTop: Spacing.xs }}>
                    Set reminders for your daily recording sessions
                </Text>
            </View>

            <View style={styles.section}>
                <View style={styles.row}>
                    <Text variant="h3">Enable Notifications</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={toggleNotifications}
                        trackColor={{ false: colors.muted, true: colors.primary }}
                    />
                </View>
            </View>

            {notificationsEnabled && (
                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {reminders.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text align="center">No reminders yet. Add your first reminder below.</Text>
                        </View>
                    ) : (
                        reminders.map((reminder) => (
                            <View
                                key={reminder.id}
                                style={[styles.reminderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            >
                                <View style={styles.cardHeader}>
                                    <Switch
                                        value={reminder.enabled}
                                        onValueChange={(value) => updateReminder(reminder.id, 'enabled', value)}
                                        trackColor={{ false: colors.muted, true: colors.primary }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => handleDeleteReminder(reminder.id)}
                                        style={styles.deleteButton}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Text style={{ color: colors.danger, fontSize: 18 }}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text variant="label">Context / Routine</Text>
                                    <TextInput
                                        style={[styles.textInput, {
                                            borderColor: colors.border,
                                            backgroundColor: colors.background,
                                            color: colors.text
                                        }]}
                                        placeholder="e.g., Dinner Time, Bath Time"
                                        placeholderTextColor={colors.muted}
                                        value={reminder.context}
                                        onChangeText={(text) => updateReminder(reminder.id, 'context', text)}
                                    />
                                </View>

                                <View style={styles.timeRow}>
                                    <View style={styles.timeInput}>
                                        <Text variant="label">Start Time</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                borderColor: colors.border,
                                                backgroundColor: colors.background,
                                                color: colors.text
                                            }]}
                                            placeholder="09:00"
                                            placeholderTextColor={colors.muted}
                                            value={reminder.startTime}
                                            onChangeText={(text) => updateReminder(reminder.id, 'startTime', text)}
                                        />
                                    </View>
                                    <View style={styles.timeInput}>
                                        <Text variant="label">End Time</Text>
                                        <TextInput
                                            style={[styles.textInput, {
                                                borderColor: colors.border,
                                                backgroundColor: colors.background,
                                                color: colors.text
                                            }]}
                                            placeholder="10:00"
                                            placeholderTextColor={colors.muted}
                                            value={reminder.endTime}
                                            onChangeText={(text) => updateReminder(reminder.id, 'endTime', text)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text variant="label" style={{ marginBottom: Spacing.sm }}>Days</Text>
                                    <View style={styles.daysContainer}>
                                        {DAYS.map((day, index) => (
                                            <TouchableOpacity
                                                key={day}
                                                style={[
                                                    styles.dayChip,
                                                    { backgroundColor: colors.background, borderColor: colors.border },
                                                    reminder.selectedDays.includes(index) && { backgroundColor: colors.primary, borderColor: colors.primary }
                                                ]}
                                                onPress={() => toggleDay(reminder.id, index)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.dayText,
                                                        { color: colors.text },
                                                        reminder.selectedDays.includes(index) && styles.dayTextSelected
                                                    ]}
                                                >
                                                    {day}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ))
                    )}

                    <TouchableOpacity
                        style={[styles.addButton, { borderColor: colors.primary }]}
                        onPress={addReminder}
                    >
                        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '500' }}>+ Add Reminder</Text>
                    </TouchableOpacity>

                    <PrimaryButton
                        title="Save All Reminders"
                        onPress={scheduleAllNotifications}
                        style={styles.saveButton}
                    />

                    {reminders.length > 0 && (
                        <TouchableOpacity
                            style={[styles.clearButton, { borderColor: colors.danger }]}
                            onPress={handleClearAll}
                        >
                            <Text style={{ color: colors.danger, fontSize: 16, fontWeight: '500' }}>Clear All Reminders</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            )}

            {/* Custom Modal for Web/Validation */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { backgroundColor: colors.surface }]}>
                        <Text variant="h3" style={styles.modalText}>{modalConfig.title}</Text>
                        <Text style={[styles.modalMessage, { color: colors.text }]}>{modalConfig.message}</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonClose, { borderColor: colors.border }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={[styles.textStyle, { color: colors.text }]}>{modalConfig.cancelText}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonConfirm, { backgroundColor: modalConfig.isDestructive ? colors.danger : colors.primary }]}
                                onPress={handleConfirm}
                            >
                                <Text style={styles.textStyle}>{modalConfig.confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.lg,
        marginTop: Spacing.md,
    },
    section: {
        marginBottom: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scrollContent: {
        flex: 1,
    },
    emptyState: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    reminderCard: {
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    deleteButton: {
        padding: Spacing.sm,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: Spacing.sm,
        fontSize: 16,
        marginTop: Spacing.xs,
    },
    timeRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    timeInput: {
        flex: 1,
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayChip: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontSize: 12,
    },
    dayTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    addButton: {
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        borderStyle: 'dashed',
        marginBottom: Spacing.md,
    },
    saveButton: {
        marginBottom: Spacing.md,
    },
    clearButton: {
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: Spacing.xl,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        minWidth: 300,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    modalMessage: {
        marginBottom: 25,
        textAlign: 'center',
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonClose: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    buttonConfirm: {
        // backgroundColor set dynamically
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
