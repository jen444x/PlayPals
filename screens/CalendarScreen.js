import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

const CalendarScreen = () => {
    const route = useRoute();
    const { petName } = route.params || {};
    const [selectedDate, setSelectedDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempTime, setTempTime] = useState(new Date());

    const [eventDetails, setEventDetails] = useState({
        eventType: '',
        location: '',
        notes: '',
        pet: petName || '',
        time: '',
        index: null,
    });
    const [events, setEvents] = useState({});

    // Format Date object to a time string (e.g. "3:00 PM")
    const formatTime = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    };

    // Handle adding an event
    const addEvent = () => {
        const { eventType, location, notes, pet, time } = eventDetails;
        if (selectedDate && eventType.trim() && location.trim() && time.trim()) {
            const newEvent = { eventType, location, notes, pet, time };
            setEvents(prevEvents => ({
                ...prevEvents,
                [selectedDate]: [...(prevEvents[selectedDate] || []), newEvent]
            }));
            setEventDetails({ eventType: '', location: '', notes: '', pet: petName || '', time: '', index: null });
            setModalVisible(false);
        } else {
            alert('Please fill in all required fields.');
        }
    };

    // Handle editing an event
    const editEvent = () => {
        const { eventType, location, notes, pet, time, index } = eventDetails;
        if (selectedDate && eventType.trim() && location.trim() && time.trim()) {
            const updatedEvents = [...events[selectedDate]];
            updatedEvents[index] = { eventType, location, notes, pet, time };
            setEvents(prevEvents => ({
                ...prevEvents,
                [selectedDate]: updatedEvents
            }));
            setEventDetails({ eventType: '', location: '', notes: '', pet: petName || '', time: '', index: null });
            setIsEditing(false);
            setModalVisible(false);
        } else {
            alert('Please fill in all required fields.');
        }
    };

    // Handle deleting an event
    const deleteEvent = (index) => {
        const updatedEvents = events[selectedDate].filter((_, i) => i !== index);
        setEvents(prevEvents => ({
            ...prevEvents,
            [selectedDate]: updatedEvents
        }));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🐾 {petName}'s Pet Calendar 🐾</Text>

            <Calendar
                style={styles.calendar}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                    [selectedDate]: { selected: true, selectedColor: '#FF8A65' },
                    ...Object.keys(events).reduce((acc, date) => {
                        acc[date] = { marked: true, dotColor: '#FF7043' };
                        return acc;
                    }, {}),
                }}
                theme={{
                    backgroundColor: '#FFF5E6',
                    calendarBackground: '#FFF5E6',
                    textSectionTitleColor: '#D84315',
                    dayTextColor: '#BF360C',
                    todayTextColor: '#FF7043',
                    selectedDayBackgroundColor: '#FF8A65',
                    selectedDayTextColor: '#FFFFFF',
                    arrowColor: '#D84315',
                    monthTextColor: '#D84315',
                    indicatorColor: '#D84315',
                    textDayHeaderFontWeight: 'bold',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontSize: 14,
                    textDayFontSize: 16,
                    textMonthFontSize: 20,
                }}
            />

            {selectedDate && (
                <>
                    <Text style={styles.selectedDateText}>🐾 Events for {selectedDate} 🐾:</Text>
                    <FlatList
                        data={events[selectedDate] || []}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.eventItem}>
                                <Text style={styles.eventText}>
                                    🐶 {item.eventType} at {item.location} at {item.time}
                                </Text>
                                {item.notes && <Text style={styles.notesText}>Notes: {item.notes}</Text>}
                                <View style={styles.eventActions}>
                                    <TouchableOpacity
                                        style={styles.eventButton}
                                        onPress={() => {
                                            setEventDetails({ ...item, index });
                                            setIsEditing(true);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.eventButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.eventButton}
                                        onPress={() => deleteEvent(index)}
                                    >
                                        <Text style={styles.eventButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.addButtonText}>+ Add Playdate</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Modal for Adding/Editing an Event */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TextInput
                            placeholder="Event Type (e.g. Playdate)"
                            placeholderTextColor="#D84315"
                            style={styles.input}
                            value={eventDetails.eventType}
                            onChangeText={(text) => setEventDetails({ ...eventDetails, eventType: text })}
                        />
                        <TextInput
                            placeholder="Location"
                            placeholderTextColor="#D84315"
                            style={styles.input}
                            value={eventDetails.location}
                            onChangeText={(text) => setEventDetails({ ...eventDetails, location: text })}
                        />
                        <TextInput
                            placeholder="Notes"
                            placeholderTextColor="#D84315"
                            style={styles.input}
                            value={eventDetails.notes}
                            onChangeText={(text) => setEventDetails({ ...eventDetails, notes: text })}
                        />

                        {/* Inline Time Picker */}
                        <TouchableOpacity
                            style={styles.inputButton}
                            onPress={() => {
                                setTempTime(new Date());
                                setShowTimePicker(true);
                            }}
                        >
                            <Text style={styles.inputButtonText}>
                                {eventDetails.time ? eventDetails.time : "Select Time"}
                            </Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <View style={styles.inlineTimePickerContainer}>
                                <DateTimePicker
                                    mode="time"
                                    display="default"
                                    value={tempTime}
                                    onChange={(event, selected) => {
                                        if (selected) {
                                            setTempTime(selected);
                                        }
                                    }}
                                    style={{ width: '100%' }}
                                />
                                <View style={styles.inlineTimePickerButtons}>
                                    <TouchableOpacity
                                        style={styles.inlineTimePickerButton}
                                        onPress={() => {
                                            setEventDetails({ ...eventDetails, time: formatTime(tempTime) });
                                            setShowTimePicker(false);
                                        }}
                                    >
                                        <Text style={styles.inlineTimePickerButtonText}>Confirm</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.inlineTimePickerButton}
                                        onPress={() => setShowTimePicker(false)}
                                    >
                                        <Text style={styles.inlineTimePickerButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity style={styles.modalButton} onPress={isEditing ? editEvent : addEvent}>
                            <Text style={styles.modalButtonText}>
                                {isEditing ? 'Save Changes' : 'Save Event'}
                            </Text>
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
        backgroundColor: '#FFF5E6',
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#D84315',
        textAlign: 'center',
        marginBottom: 15,
    },
    calendar: {
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
    },
    selectedDateText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#D84315',
        textAlign: 'center',
    },
    eventItem: {
        backgroundColor: '#FFCCBC',
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D84315',
    },
    eventText: {
        color: '#BF360C',
        fontSize: 16,
    },
    notesText: {
        color: '#E64A19',
        fontSize: 14,
        marginTop: 5,
    },
    eventActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    eventButton: {
        backgroundColor: '#D84315',
        padding: 5,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    eventButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#FF8A65',
        padding: 12,
        borderRadius: 25,
        marginTop: 15,
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
        borderWidth: 2,
        borderColor: '#FF8A65',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#D84315',
        fontSize: 16,
        marginBottom: 15,
        padding: 5,
    },
    inputButton: {
        borderWidth: 1,
        borderColor: '#D84315',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
    },
    inputButtonText: {
        fontSize: 16,
        color: '#D84315',
    },
    modalButton: {
        backgroundColor: '#FFCCBC',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#D84315',
    },
    modalButtonCancel: {
        backgroundColor: '#FF8A65',
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
    inlineTimePickerContainer: {
        marginBottom: 15,
        alignItems: 'center',
    },
    inlineTimePickerButtons: {
        flexDirection: 'row',
        marginTop: 10,
    },
    inlineTimePickerButton: {
        backgroundColor: '#FF8A65',
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    inlineTimePickerButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CalendarScreen;
