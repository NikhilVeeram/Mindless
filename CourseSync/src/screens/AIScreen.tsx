import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AIScreen() {
    const [messages, setMessages] = useState<any[]>([
        { id: '1', role: 'assistant', text: 'Hi! I can help you plan your schedule or calculate your grades. What do you need?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Mock AI Response
        setTimeout(() => {
            const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant', text: "I'm just a demo right now, but soon I'll be able to check your Canvas deadlines!" };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AI Assistant</Text>
            </View>

            <FlatList
                data={messages}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageBubble,
                        item.role === 'user' ? styles.userBubble : styles.aiBubble
                    ]}>
                        <Text style={[
                            styles.messageText,
                            item.role === 'user' ? styles.userText : styles.aiText
                        ]}>{item.text}</Text>
                    </View>
                )}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Ask me anything..."
                        value={input}
                        onChangeText={setInput}
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <Ionicons name="send" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3EF',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        backgroundColor: '#FFF'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    messagesList: {
        padding: 16,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: '#FFF',
    },
    aiText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        alignItems: 'center'
    },
    input: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        marginRight: 8,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
