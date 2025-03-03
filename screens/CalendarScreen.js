import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
    const route = useRoute();
    const { petName } = route.params || {};
    const [selectedDate, setSelectedDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [eventDetails, setEventDetails] = useState({
        eventType: '',
        location: '',
        notes: '',
        pet: petName || '',
        time: '',
    });
    const [events, setEvents] = useState({});

    // Handle adding an event
    const addEvent = () => {
        const { eventType, location, notes, pet, time } = eventDetails;
        if (selectedDate && eventType.trim() && location.trim() && time.trim()) {
            const newEvent = {
                eventType,
                location,
                notes,
                pet,
                time,
            };
            setEvents((prevEvents) => ({
                ...prevEvents,
                [selectedDate]: [...(prevEvents[selectedDate] || []), newEvent],
            }));
            setEventDetails({ eventType: '', location: '', notes: '', pet: petName || '', time: '' });
            setModalVisible(false);
        } else {
            alert('Please fill in all required fields.');
        }
    };
 // Prepare the markedDates object to highlight days with events
 
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{petName}'s Calendar</Text>
            
            <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                    [selectedDate]: { selected: true, selectedColor: '#E76F51' },
                    ...Object.keys(events).reduce((acc, date) => {
                        acc[date] = { marked: true, dotColor: '#F4A261' };
                        return acc;
                    }, {}),
                }}
                theme={{
                    selectedDayBackgroundColor: '#E76F51',
                    todayTextColor: '#F4A261',
                    arrowColor: '#6D4C41',
                }}
            />

            {selectedDate && (
                <>
                    <Text style={styles.selectedDateText}>Events for {selectedDate}:</Text>
                    <FlatList
                        data={events[selectedDate] || []}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.eventItem}>
                                <Text style={styles.eventText}>• {item.eventType} at {item.location} at {item.time}</Text>
                                {item.notes && <Text style={styles.notesText}>Notes: {item.notes}</Text>}
                            </View>
                        )}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.addButtonText}>+ Add Event</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Modal for Adding an Event */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            placeholder="Event Type (e.g. Playdate)"
                            style={styles.input}
                            value={eventDetails.eventType}
                            onChangeText={(text) => setEventDetails({ ...eventDetails, eventType: text })}
                        />
                        <TextInput
                            placeholder="Location"
                            style={styles.input}
                            value={eventDetails.location}
                            onChangeText={(text) => setEventDetails({ ...eventDetails, location: text })}
                        />
                        <TextInput
                            placeholder="Notes"
                            style={styles.input}
                            value={eventDetails.notes}
                            onChangeText={(text) => setEventDetails({ ...eventDetails, notes: text })}
                        />
                        <TextInput
                            placeholder="Time (e.g. 3:00 PM)"
                            style={styles.input}
                            value={eventDetails.time}
                            onChangeText={(text) => setEventDetails({ ...eventDetails, time: text })}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={addEvent}>
                            <Text style={styles.modalButtonText}>Save Event</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFEDD5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6D4C41',
        textAlign: 'center',
        marginBottom: 10,
    },
    selectedDateText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#6D4C41',
    },
    eventItem: {
        backgroundColor: '#F4A261',
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
    },
    eventText: {
        color: 'white',
        fontSize: 16,
    },
    notesText: {
        color: '#FFFBF2',
        fontSize: 14,
        marginTop: 5,
    },
    addButton: {
        backgroundColor: '#E76F51',
        padding: 12,
        borderRadius: 25,
        marginTop: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        width: 300,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#6D4C41',
        fontSize: 16,
        marginBottom: 15,
        padding: 5,
    },
    modalButton: {
        backgroundColor: '#F4A261',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    modalButtonCancel: {
        backgroundColor: '#E76F51',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CalendarScreen;
