import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { canvasService } from '../services/canvas';
import { useStore } from '../store/useStore';
import { syncManager } from '../services/syncManager';

export default function OnboardingScreen({ navigation }: any) {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConnect = async () => {
        if (!domain) return;
        setLoading(true);
        try {
            // In a real app, this would trigger the OAuth flow
            // For now, we simulate a successful connection with the domain

            // await canvasService.login(domain); // Real call

            // Mock success
            useStore.getState().setPreferences({ canvasDomain: domain });

            await syncManager.performFullSync();

            // Navigation is handled by AppNavigator listening to store state ideally, 
            // or we can manually replace the stack.
            // But here we might rely on the parent navigator to rerender based on auth state.
        } catch (error) {
            alert('Connection failed. Please check the domain.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome to CourseSync</Text>
                <Text style={styles.subtitle}>Your all-in-one student productivity hub.</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Enter your Canvas URL</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="canvas.university.edu"
                        value={domain}
                        onChangeText={setDomain}
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, (!domain || loading) && styles.disabledButton]}
                    onPress={handleConnect}
                    disabled={!domain || loading}
                >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Connect Canvas</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3EF',
        justifyContent: 'center',
    },
    content: {
        padding: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
        textAlign: 'center'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 48,
        textAlign: 'center',
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#A0C4FF',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
