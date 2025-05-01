import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Alert
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import EventTypeBubble from '../components/CalendarBubble';

navigation.navigate('SearchEvents', { events });
//also need to add <Stack.Screen name="SearchEvents" component= (SearchEventsScreen} />

// Validation schema using Yup
const eventSchema = Yup.object().shape({
  eventType: Yup.string().required('Event type is required'),
  location: Yup.string().required('Location is required'),
  time: Yup.string().required('Time selection is required'),
});

const CalendarScreen = () => {
  const route = useRoute();
  const { petName } = route.params || {};


  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  const [events, setEvents] = useState({});

  // State to hold current event details (for both add and edit)
  const [currentEvent, setCurrentEvent] = useState({
    eventType: '',
    location: '',
    notes: '',
    pet: petName || '',
    time: '',
    index: null,
  });

  const eventTypeColors = {
    'Playdate': '#4FC3F7',  //blue
    'Vet': '#81C784',       //green
    'Training': '#FFB74D',  //orange
    'Groominfg': '#BA68C8',  //purple
    default:'#BDBDBD',
  };

  const getMarkedDates = () => {
    const marks = {};

    Object.entries(events).forEach(([date, dayEvents]) => {
      const dots = [];

      dayEvents.forEach((event) => {
        const color = eventTYpeColors[event.eventType] || eventTypeColors.default;

        //no duplicates
        if (!dots.find((d) => d.color === color)) {
          dots.push({ color, key: '${event.eventType}-${color}' });
        }
      });

      marks[date] = {
        dots,
        marked: true,
      };
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: '#FF6F00',
      };
    }

    return marks;
  };

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

  // Handle form submission (adding or editing an event)
  const handleSubmitForm = (values, { resetForm }) => {
    const { eventType, location, notes, pet, time, index } = values;
    if (selectedDate && eventType.trim() && location.trim() && time.trim()) {
      if (isEditing) {
        // Update existing event
        const updatedEvents = [...(events[selectedDate] || [])];
        updatedEvents[index] = { eventType, location, notes, pet, time };
        setEvents((prevEvents) => ({
          ...prevEvents,
          [selectedDate]: updatedEvents,
        }));
        setIsEditing(false);
        Alert.alert('Success', 'Event updated successfully');
      } else {
        // Add new event
        const newEvent = { eventType, location, notes, pet, time };
        setEvents((prevEvents) => ({
          ...prevEvents,
          [selectedDate]: [...(prevEvents[selectedDate] || []), newEvent],
        }));
        Alert.alert('Success', 'Event added successfully');
      }
      resetForm();
      setModalVisible(false);
      // Reset current event state
      setCurrentEvent({
        eventType: '',
        location: '',
        notes: '',
        pet: petName || '',
        time: '',
        index: null,
      });
    } else {
      Alert.alert('Error', 'Please fill in all required fields.');
    }
  };

  // Handle deleting an event and remove the date key if no events remain
  const deleteEvent = (index) => {
    const updatedEvents = events[selectedDate].filter((_, i) => i !== index);
    if (updatedEvents.length === 0) {
      // Create a new events object without the selected date
      const newEvents = { ...events };
      delete newEvents[selectedDate];
      setEvents(newEvents);
    } else {
      setEvents((prevEvents) => ({
        ...prevEvents,
        [selectedDate]: updatedEvents,
      }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 Calendar 🐾</Text>

      <Calendar
        style={styles.calendar}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        markingType="multi-dot"
        theme={{
          backgroundColor: "#E0F7FA",
          calendarBackground: "#E0F7FA",
          textSectionTitleColor: "#FF4081",
          dayTextColor: "#6A1B9A",
          todayTextColor: "#FF6F00",
          selectedDayBackgroundColor: "#FF6F00",
          selectedDayTextColor: "#FFFFFF",
          arrowColor: "#D81B60",
          monthTextColor: "#D81B60",
          indicatorColor: "#D81B60",
          textDayHeaderFontWeight: "bold",
          textMonthFontWeight: "bold",
          textDayHeaderFontSize: 14,
          textDayFontSize: 16,
          textMonthFontSize: 20,
        }}
      />

      {selectedDate ? (
        <>
          <Text style={styles.selectedDateText}>
            🐾 Events for {selectedDate} 🐾:
          </Text>

          <FlatList
            //data={events[selectedDate] || []}
            data={filteredEvents.lenght > 0 ? filteredEvents : events[selectedDate] || []}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              {/*altered to show event bubbles*/}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                  backgroundColor: eventTypeColors[item.eventType] || eventTypeColors.default,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginRight: 8,
                  }}
                >

        {/*logic for bubble styling */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <EventTypeBubble type={item.eventType} />
                <Text style={styles.eventText}>
                        at {item.location} at {item.time} on {item.date}
                </Text>
                {item.notes ? (
                  <Text style={styles.notesText}>Notes: {item.notes}</Text>
                ) : null}
            </View>

            <View style={styles.eventActions}>
                  <TouchableOpacity
                    style={styles.eventButton}
                    onPress={() => {
                      // Set current event details for editing
                      setCurrentEvent({ ...item, index });
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
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              // Reset current event state for adding a new event
              setCurrentEvent({
                eventType: '',
                location: '',
                notes: '',
                pet: petName || '',
                time: '',
                index: null,
              });
              setModalVisible(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Add Playdate</Text>
          </TouchableOpacity>
        </>
      ) : null}
    {/* navigation to search events screen */}
    <TouchableOpacity
      style={styles.searchButton}
      onPress={() => navigation.navigate('SearchEvents', { events })}
    >
      <Text style={styles.searchButtonText}> Search Events </Text>
    </TouchableOpacity>


      {/* Modal for Adding/Editing an Event */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <Formik
            initialValues={currentEvent}
            enableReinitialize
            validationSchema={eventSchema}
            onSubmit={handleSubmitForm}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => (
              <View style={styles.modalContent}>
                <TextInput
                  placeholder="Event Type (e.g. Playdate)"
                  placeholderTextColor="#D84315"
                  style={[
                    styles.input,
                    touched.eventType && errors.eventType
                      ? { borderColor: 'red' }
                      : null,
                  ]}
                  onChangeText={handleChange('eventType')}
                  onBlur={handleBlur('eventType')}
                  value={values.eventType}
                />
                {touched.eventType && errors.eventType && (
                  <Text style={styles.errorText}>{errors.eventType}</Text>
                )}

                <TextInput
                  placeholder="Location"
                  placeholderTextColor="#D84315"
                  style={[
                    styles.input,
                    touched.location && errors.location
                      ? { borderColor: 'red' }
                      : null,
                  ]}
                  onChangeText={handleChange('location')}
                  onBlur={handleBlur('location')}
                  value={values.location}
                />
                {touched.location && errors.location && (
                  <Text style={styles.errorText}>{errors.location}</Text>
                )}

                <TextInput
                  placeholder="Notes"
                  placeholderTextColor="#D84315"
                  style={styles.input}
                  onChangeText={handleChange('notes')}
                  onBlur={handleBlur('notes')}
                  value={values.notes}
                />

                {/* Time Picker */}
                <TouchableOpacity
                  style={styles.inputButton}
                  onPress={() => {
                    setTempTime(new Date());
                    setShowTimePicker(true);
                  }}
                >
                  <Text style={styles.inputButtonText}>
                    {values.time ? values.time : 'Select Time'}
                  </Text>
                </TouchableOpacity>
                {touched.time && errors.time && (
                  <Text style={styles.errorText}>{errors.time}</Text>
                )}

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
                          setFieldValue('time', formatTime(tempTime));
                          setShowTimePicker(false);
                        }}
                      >
                        <Text style={styles.inlineTimePickerButtonText}>
                          Confirm
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.inlineTimePickerButton}
                        onPress={() => setShowTimePicker(false)}
                      >
                        <Text style={styles.inlineTimePickerButtonText}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.modalButtonText}>
                    {isEditing ? 'Save Changes' : 'Save Event'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => {
                    setModalVisible(false);
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
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
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FF4081',
  },
  clearButton: {
    backgroundColor: '#E57373',
    padding: 8,
    marginTop: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#FF3E0',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF8A65',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#333',
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
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontSize: 12,
  },
});

export default CalendarScreen;
