import React, { useState, useEffect } from 'react';
import {View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';


const SearchEventsScreen = ({ events }) => {
  const { events } = route.params || {};

  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [searchDate, setSearchDate] = useState(false);
  const [tempSearchDate, setTempSearchDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');

  const filteredEvents = Object.entries(events).reduce((acc, [date, dayEvents]) => {
    //date search filtering
    if (searchDate && date !== searchDate) return acc;

    dayEvents.forEach((event) => {
      const matchedEvents = !eventTypeFilter || event.eventType === eventTypeFilter;
      if (matchedEvents) {
        acc.push({...event,date });
      }
    });
    return acc;
  }, []);

return (
    <View styel={{ flex: 1, padding: 20, backgroundColor: 'FFFDE7'}}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20}}>🔍 Search Events</Text>

      {/*Date picker*/}
      <TouchableOpacity
        onPress= {() => setShowDatePicker(true)}
        style={{
          padding: 12,
          backgroundColor: '#FFECB3',
          borderRadius: 8,
          marginBottom: 15,
          borderWidth: 1,
          borderColor: '#FFD54F',
        }}
      >

            <Text style={{ color: '#6A1B9A' }}>
                {searchDate ? '📅 ${searchDate}' : 'Search by Date'}
            </Text>
      </TouchableOpacity>

        {showSearchDatePicker && (
                <DateTimePicker
                    mode="date"
                    display="default"
                    value={tempSearchDate}
                    onChange={(event, selected) => {
                        if (selected) {
                        const formatted = tempSearchDate.toISOString().split('T')[0];
                        setSearchDate(formatted);
                        }
                        setShowSearchDatePicker(false);                        }
                    }}

                />
                )}
    {/* event type filter*/}
        <Text style={{ marginBottom: 5 }}> Filter by Event Type: </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#FFD54F',
                borderRadius: 6,
                marginBottom: 20,
                backgroundColor: '#FFF9C4',
              }}
            >
            <Picker
               selectedValue={eventTypeFilter}
               onValueChange={(value) => setEventTypeFilter(value)}
            >


       <Picker
            selectedValue={eventTypeFilter}
            onValueChange={(value) => setEventTypeFilter(value)}
        />
            <Picker.Item label="All Types" value=""/>
            <Picker.Item label="Playdate" value="Playdate"/>
            <Picker.Item label="Vet " value="Vet"/>
            <Picker.Item label="Grooming" value="Grooming"/>
            <Picker.Item label="" value=""/>
            <Picker.Item label="" value=""/>
            <Picker.Item label="" value=""/>
        </Picker>
      </View>

{/*results*/}

    <FlatList
        data={filteredEvents}
        keyExtractor={(_, index) => index.toString()}
        ListEmptyComponent={
          <Text style={{ color: '#999', textAlign: 'center', marginTop: 20}}>
          No matching events.
          </Text>
        }
        renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: '#FCE4EC',
                padding: 15,
                marginBottom: 10,
                borderRadius: 8,
                borderColor: '#F06292',
                borderWidth: 1,
              }}
            >
                <Text style={{ fontWeight: 'bold' }}>{item.eventType}</Text>
                <Text> {item.location}</Text>
                <Text> {item.time}</Text>
                <Text> {item.date}</Text>
                {item.notes ? <Text> {item.notes}</Text> : null}
            </View>
        )}
    );
};

export default SearchEventsScreen;


