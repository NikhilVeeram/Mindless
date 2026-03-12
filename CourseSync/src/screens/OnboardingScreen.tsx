import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, Platform, UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { canvasService } from '../services/canvas';
import { syncManager } from '../services/syncManager';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OnboardingScreen({ navigation }: any) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            await canvasService.loginWithOAuth();
            await syncManager.performFullSync();
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo / Hero */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>CS</Text>
                    </View>
                </View>

                <Text style={styles.title}>CourseSync</Text>
                <Text style={styles.subtitle}>
                    Your all-in-one student productivity hub.{'\n'}
                    Syncs your Canvas courses, assignments, and grades.
                </Text>

                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Single login button — opens Canvas in-app browser */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.disabledButton]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>Log in with Canvas</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.footerNote}>
                    You'll be redirected to canvas.tamu.edu to sign in with your TAMU credentials.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3EF',
    },
    content: {
        flex: 1,
        padding: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    logoText: {
        color: '#FFF',
        fontSize: 30,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
        lineHeight: 23,
    },
    errorBox: {
        backgroundColor: '#FDECEA',
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
        width: '100%',
    },
    errorText: {
        color: '#C0392B',
        fontSize: 14,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 14,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    disabledButton: {
        backgroundColor: '#A0C4FF',
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 17,
        letterSpacing: 0.3,
    },
    footerNote: {
        marginTop: 20,
        fontSize: 13,
        color: '#999',
        textAlign: 'center',
        lineHeight: 19,
    },
});
