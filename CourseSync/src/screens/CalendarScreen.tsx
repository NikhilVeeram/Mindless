import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dbService } from '../services/db';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';

export default function CalendarScreen() {
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [assignments, setAssignments] = useState<any[]>([]);
    const [markedDates, setMarkedDates] = useState<any>({});
    const lastSyncTime = useStore((state) => state.lastSyncTime);

    useEffect(() => {
        loadData();
    }, [lastSyncTime]);

    const loadData = async () => {
        // For now, load all upcoming assignments and mark them
        // In a real app, you'd fetch based on month change
        const allAssignments = await dbService.getUpcomingAssignments(); // This fetches limit 20, might need a generic "getAll"

        const marks: any = {};
        const dateMap: any = {};

        allAssignments.forEach((a: any) => {
            const dateStr = format(new Date(a.due_at), 'yyyy-MM-dd');
            if (!marks[dateStr]) {
                marks[dateStr] = { marked: true, dots: [] };
            }
            // Add a dot
            marks[dateStr].dots.push({ color: 'red' });
        });

        setMarkedDates(marks);
        setAssignments(allAssignments);
    };

    const getEventsForDay = (date: string) => {
        // Simple client-side filter for now
        return assignments.filter(a => format(new Date(a.due_at), 'yyyy-MM-dd') === date);
    };

    const currentDayEvents = getEventsForDay(selectedDate);

    return (
        <SafeAreaView style={styles.container}>
            <Calendar
                onDayPress={(day: any) => setSelectedDate(day.dateString)}
                markedDates={{
                    ...markedDates,
                    [selectedDate]: { ...markedDates[selectedDate], selected: true, disableTouchEvent: true }
                }}
                theme={{
                    selectedDayBackgroundColor: '#007AFF',
                    todayTextColor: '#007AFF',
                    arrowColor: '#007AFF',
                }}
                markingType={'multi-dot'}
            />

            <View style={styles.eventListContainer}>
                <Text style={styles.dateHeader}>{format(new Date(selectedDate), 'EEEE, MMMM do')}</Text>
                <FlatList
                    data={currentDayEvents}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.eventItem}>
                            <View style={[styles.eventColorBar, { backgroundColor: 'orange' }]} />
                            <View style={styles.eventContent}>
                                <Text style={styles.eventTitle}>{item.name}</Text>
                                <Text style={styles.eventTime}>{format(new Date(item.due_at), 'h:mm a')}</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>No events for this day.</Text>}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    eventListContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#F5F5F5'
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333'
    },
    eventItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    eventColorBar: {
        width: 4,
        borderRadius: 2,
        marginRight: 12,
    },
    eventContent: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    eventTime: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        marginTop: 20,
        textAlign: 'center',
        color: '#999'
    }
});
