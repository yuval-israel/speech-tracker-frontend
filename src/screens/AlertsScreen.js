import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import { Colors, Spacing, Layout } from '../theme';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function AlertsScreen() {
    const [selectedDays, setSelectedDays] = useState([]);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const toggleDay = (index) => {
        if (selectedDays.includes(index)) {
            setSelectedDays(selectedDays.filter(d => d !== index));
        } else {
            setSelectedDays([...selectedDays, index]);
        }
    };

    const handleTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || reminderTime;
        setShowTimePicker(Platform.OS === 'ios');
        setReminderTime(currentDate);
    };

    const scheduleNotifications = async () => {
        if (!notificationsEnabled) return;

        // Request permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission to send notifications was denied');
            return;
        }

        // Cancel existing
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Schedule for each selected day
        for (const dayIndex of selectedDays) {
            // Calculate next occurrence of this day at reminderTime
            // This is a simplified placeholder. Real logic would use Notifications.scheduleNotificationAsync
            // with a 'calendar' trigger.

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "Speech Tracker",
                    body: "Time for your daily practice!",
                },
                trigger: {
                    hour: reminderTime.getHours(),
                    minute: reminderTime.getMinutes(),
                    weekday: dayIndex + 1, // Expo weekdays are 1-7 (Sunday-Saturday)
                    repeats: true,
                },
            });
        }
        alert('Notifications scheduled!');
    };

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <Text variant="h1">Practice Reminders</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.row}>
                    <Text variant="h3">Enable Notifications</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: Colors.muted, true: Colors.primary }}
                    />
                </View>
            </View>

            {notificationsEnabled && (
                <>
                    <View style={styles.section}>
                        <Text variant="label" style={{ marginBottom: Spacing.md }}>Select Days</Text>
                        <View style={styles.daysContainer}>
                            {DAYS.map((day, index) => (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.dayChip,
                                        selectedDays.includes(index) && styles.dayChipSelected
                                    ]}
                                    onPress={() => toggleDay(index)}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            selectedDays.includes(index) && styles.dayTextSelected
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text variant="label" style={{ marginBottom: Spacing.md }}>Reminder Time</Text>
                        {Platform.OS === 'android' && (
                            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeButton}>
                                <Text>{reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </TouchableOpacity>
                        )}
                        {(showTimePicker || Platform.OS === 'ios') && (
                            <DateTimePicker
                                value={reminderTime}
                                mode="time"
                                display="default"
                                onChange={handleTimeChange}
                                style={styles.timePicker}
                            />
                        )}
                    </View>

                    <PrimaryButton
                        title="Save Schedule"
                        onPress={scheduleNotifications}
                        style={styles.saveButton}
                    />
                </>
            )}
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.xl,
        marginTop: Spacing.md,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    daysContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayChip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    dayChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    dayText: {
        color: Colors.text,
        fontSize: 14,
    },
    dayTextSelected: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    timeButton: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: Spacing.md,
        alignItems: 'center',
    },
    timePicker: {
        alignSelf: 'flex-start',
    },
    saveButton: {
        marginTop: Spacing.md,
    }
});
