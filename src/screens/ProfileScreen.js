import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '../components/ScreenContainer';
import Text from '../components/Text';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { Spacing, Layout } from '../theme';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { token, signOut, selectedChild, setHasConfiguredFamily } = useAuth();
    const { isDark, colors, toggleTheme } = useTheme();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                // Try to get cached username
                const cachedUsername = await AsyncStorage.getItem('CACHED_USERNAME');
                if (cachedUsername) {
                    setUsername(cachedUsername);
                }
            } catch (err) {
                console.error('Failed to load user info:', err);
            } finally {
                setLoading(false);
            }
        };
        loadUserInfo();
    }, []);

    const handleLogout = () => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to log out?')) {
                signOut();
            }
        } else {
            Alert.alert(
                'Logout',
                'Are you sure you want to log out?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Logout',
                        style: 'destructive',
                        onPress: async () => {
                            await signOut();
                        }
                    }
                ]
            );
        }
    };

    const handleResetOnboarding = () => {
        const reset = async () => {
            await setHasConfiguredFamily(false);
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Reset Setup? This will take you back to the setup wizard.')) {
                reset();
            }
        } else {
            Alert.alert(
                'Reset Setup',
                'This will take you back to the setup wizard. Continue?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Reset',
                        onPress: reset
                    }
                ]
            );
        }
    };

    const SettingRow = ({ label, value, onPress, isSwitch, switchValue, onSwitchChange }) => (
        <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={onPress}
            disabled={isSwitch}
        >
            <Text style={{ color: colors.text }}>{label}</Text>
            {isSwitch ? (
                <Switch
                    value={switchValue}
                    onValueChange={onSwitchChange}
                    trackColor={{ false: colors.muted, true: colors.primary }}
                />
            ) : (
                <Text style={{ color: colors.textLight }}>{value}</Text>
            )}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }) => (
        <Text style={[styles.sectionHeader, { color: colors.textLight }]}>{title}</Text>
    );

    return (
        <ScreenContainer style={{ backgroundColor: colors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text variant="h1" style={{ color: colors.text }}>Settings</Text>
                </View>

                {/* User Info Card */}
                <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                        <Text style={styles.avatarText}>
                            {username ? username.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text variant="h3" style={{ color: colors.text }}>
                            {username || 'User'}
                        </Text>
                        <Text variant="small" style={{ color: colors.textLight }}>
                            Logged in
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.statusText, { color: colors.success }]}>Active</Text>
                    </View>
                </View>

                {/* Selected Child */}
                {selectedChild && (
                    <>
                        <SectionHeader title="ACTIVE PROFILE" />
                        <View style={[styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={styles.childInfo}>
                                <Text style={{ color: colors.text, fontWeight: '500' }}>
                                    {selectedChild.name}
                                </Text>
                                <Text variant="small" style={{ color: colors.textLight }}>
                                    Currently selected child
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('MyFamily')}
                                style={[styles.changeButton, { borderColor: colors.primary }]}
                            >
                                <Text style={{ color: colors.primary }}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {/* Appearance */}
                <SectionHeader title="APPEARANCE" />
                <SettingRow
                    label="Dark Mode"
                    isSwitch
                    switchValue={isDark}
                    onSwitchChange={toggleTheme}
                />

                {/* Account */}
                <SectionHeader title="ACCOUNT" />
                <SettingRow
                    label="Manage Family"
                    value="→"
                    onPress={() => navigation.navigate('MyFamily')}
                />
                <SettingRow
                    label="Reset Setup Wizard"
                    value="→"
                    onPress={handleResetOnboarding}
                />

                {/* About */}
                <SectionHeader title="ABOUT" />
                <SettingRow
                    label="App Version"
                    value="1.0.0"
                />
                <SettingRow
                    label="Developer"
                    value="SpeechTrack Team"
                />

                {/* Logout Button */}
                <View style={styles.logoutContainer}>
                    <TouchableOpacity
                        style={[styles.logoutButton, { borderColor: colors.danger }]}
                        onPress={handleLogout}
                    >
                        <Text style={{ color: colors.danger, fontWeight: '600' }}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text variant="small" style={{ color: colors.textLight }} align="center">
                        SpeechTrack © 2024
                    </Text>
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.lg,
        marginTop: Spacing.md,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.lg,
        borderWidth: 1,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: 8,
        marginBottom: Spacing.xs,
        borderWidth: 1,
    },
    childInfo: {
        flex: 1,
    },
    changeButton: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: 6,
        borderWidth: 1,
    },
    logoutContainer: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.md,
    },
    logoutButton: {
        padding: Spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    footer: {
        paddingVertical: Spacing.xl,
    },
});
