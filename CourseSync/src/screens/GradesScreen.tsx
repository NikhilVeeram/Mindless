import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dbService } from '../services/db';
import { useStore } from '../store/useStore';

export default function GradesScreen() {
    const [courses, setCourses] = useState<any[]>([]);
    const lastSyncTime = useStore((state) => state.lastSyncTime);

    useEffect(() => {
        loadData();
    }, [lastSyncTime]);

    const loadData = async () => {
        const c = await dbService.getCourses();
        setCourses(c);
    };

    const getGradeColor = (score: number | null) => {
        if (score === null) return '#999';
        if (score >= 90) return '#4CAF50';
        if (score >= 80) return '#FFC107';
        return '#F44336';
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Grades</Text>
            <FlatList
                data={courses}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.courseCode}>{item.code}</Text>
                            <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(item.current_grade) }]}>
                                <Text style={styles.gradeText}>
                                    {item.current_grade !== null ? `${item.current_grade}%` : 'N/A'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.courseName}>{item.name}</Text>

                        <View style={styles.divider} />
                        <Text style={styles.detailText}>Target Grade: A (93%)</Text>
                        {/* Need Calculator Logic Here */}
                    </TouchableOpacity>
                )}
            />
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
        marginBottom: 16,
        color: '#333'
    },
    listContent: {
        paddingBottom: 20
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    courseCode: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase'
    },
    gradeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    gradeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    courseName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#888',
    }

});
