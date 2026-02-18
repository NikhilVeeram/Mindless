import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useStore } from '../store/useStore';
import { dbService } from '../services/db';
import { syncManager } from '../services/syncManager';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const [courses, setCourses] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const isSyncing = useStore((state) => state.isSyncing);
    const lastSyncTime = useStore((state) => state.lastSyncTime);

    const fetchData = async () => {
        const c = await dbService.getCourses();
        setCourses(c);
        const a = await dbService.getUpcomingAssignments();
        setAssignments(a);
    };

    useEffect(() => {
        fetchData();
    }, [lastSyncTime]); // Refresh when sync completes

    const handleRefresh = async () => {
        await syncManager.performFullSync();
        fetchData();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isSyncing} onRefresh={handleRefresh} />
                }
            >
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello, Student</Text>
                    <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM do')}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Courses</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coursesScroll}>
                        {courses.length === 0 ? (
                            <Text style={styles.emptyText}>No courses synced yet.</Text>
                        ) : (
                            courses.map((course) => (
                                <View key={course.id} style={[styles.courseCard, { borderLeftColor: course.color || '#333' }]}>
                                    <Text style={styles.courseCode}>{course.code}</Text>
                                    <Text style={styles.courseName} numberOfLines={2}>{course.name}</Text>
                                    {course.current_grade !== null && (
                                        <View style={styles.gradeBadge}>
                                            <Text style={styles.gradeText}>{course.current_grade}%</Text>
                                        </View>
                                    )}
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Creating App Layout</Text>
                    {assignments.length === 0 ? (
                        <Text style={styles.emptyText}>No upcoming assignments.</Text>
                    ) : (
                        assignments.map((assignment) => (
                            <View key={assignment.id} style={styles.assignmentRow}>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateMonth}>{format(new Date(Number(assignment.due_at)), 'MMM')}</Text>
                                    <Text style={styles.dateDay}>{format(new Date(Number(assignment.due_at)), 'd')}</Text>
                                </View>
                                <View style={styles.assignmentDetails}>
                                    <Text style={styles.assignmentTitle} numberOfLines={1}>{assignment.name}</Text>
                                    <Text style={styles.assignmentCourse}>Course ID: {assignment.course_id}</Text>
                                </View>
                                <View style={styles.statusIndicator} />
                            </View>
                        ))
                    )}
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={() => alert('Add Item')}>
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F3EF', // Warm off-white
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    date: {
        fontSize: 16,
        color: '#666',
        marginTop: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    coursesScroll: {
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    courseCard: {
        width: 160,
        height: 120,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
        justifyContent: 'space-between',
    },
    courseCode: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textTransform: 'uppercase',
    },
    courseName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    gradeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    gradeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    emptyText: {
        color: '#999',
        fontStyle: 'italic',
    },
    assignmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    dateBox: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 16,
        borderRightWidth: 1,
        borderRightColor: '#EEE',
        marginRight: 16,
        width: 60,
    },
    dateMonth: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
    },
    dateDay: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    assignmentDetails: {
        flex: 1,
    },
    assignmentTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    assignmentCourse: {
        fontSize: 12,
        color: '#888',
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF9800', // Orange for upcoming/due soon
    },
});
