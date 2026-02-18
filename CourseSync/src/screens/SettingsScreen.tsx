import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { syncManager } from '../services/syncManager';
import { getDB } from '../db';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';

export default function SettingsScreen() {
    const preferences = useStore((state) => state.preferences);
    const setPreferences = useStore((state) => state.setPreferences);

    const toggleTheme = () => {
        const newTheme = preferences.theme === 'dark' ? 'light' : 'dark';
        setPreferences({ theme: newTheme });
    };

    const toggleNotifications = () => {
        setPreferences({ notificationsEnabled: !preferences.notificationsEnabled });
    };

    const handleLogout = async () => {
        Alert.alert('Reset App', 'Are you sure? This will delete all local data.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset',
                style: 'destructive',
                onPress: async () => {
                    await SecureStore.deleteItemAsync('canvas_access_token');
                    const db = await getDB();
                    await db.closeAsync();
                    const dbPath = `${FileSystem.documentDirectory}SQLite/coursesync.db`;
                    await FileSystem.deleteAsync(dbPath, { idempotent: true });
                    // Ideally restart app or reset state
                    alert('Data cleared. Please restart app.');
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Settings</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Dark Mode</Text>
                    <Switch value={preferences.theme === 'dark'} onValueChange={toggleTheme} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Enable Notifications</Text>
                    <Switch value={preferences.notificationsEnabled} onValueChange={toggleNotifications} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Accounts</Text>
                <View style={styles.row}>
                    <Text style={styles.rowLabel}>Canvas</Text>
                    <Text style={styles.statusText}>{preferences.canvasDomain ? 'Connected' : 'Not Connected'}</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Reset App & Clear Data</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3EF',
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#333'
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        textTransform: 'uppercase'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rowLabel: {
        fontSize: 16,
        color: '#333',
    },
    statusText: {
        fontSize: 14,
        color: '#007AFF',
    },
    logoutButton: {
        marginTop: 20,
        backgroundColor: '#FFEBEE',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
