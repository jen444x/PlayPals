import React, { useLayoutEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity,TextInput } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalendarScreen from './CalendarScreen';
import CreatePostScreen from './CreatePostScreen'
import ForumsScreen from './ForumsScreen';
import AppSettings from './AppSettings';
import FeedScreen from './FeedScreen'; 
import HomeScreen from './HomeScreen';
import { BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Personal feed component would go here
function FeedScreenRender() {
  return (
     <FeedScreen/> 
  );
}

//Play date component
function PlayDateScreen() {
  return (
    <HomeScreen/>
  );
}

//Create post component 
function CreatePostScreenRender() {
  return (
    <CreatePostScreen/>
  );
}

//Caldendar component 
function CalendarScreenRender() {
  return (
    <CalendarScreen/>
  );
}

//Trip planner component
function TripPlannerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the trip planner page!</Text>
    </View>
  );
}

//Styling temporary text
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  text: {
    fontSize: 20, 
  },
});

//Bottom tab navigator
const Tab = createBottomTabNavigator();

export default function PersonalFeedNav({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  
const handleSearch = async () => {
  if (!searchQuery) return;

  try {
    const res = await fetch(`${BASE_URL}api/users/search?q=${searchQuery}`);
    const data = await res.json();
    setSearchResults(data);

    // If only one user, navigate directly
    if (data.length === 1) {
      navigation.navigate('PublicProfile', { userId: data[0].id });
    } else {
      setSearchResults(data);
    }

    console.log("Navigating to UserProfile with userId:", data[0].id);
    navigation.navigate("PublicProfile", { userId: data[0].id });


    // Otherwise, show a list (optional)
  } catch (err) {
    console.error(err);
  }
};

  //Create the PlayPals header

  useLayoutEffect(() => {
    const setupHeader = async () => {
    const userId = await AsyncStorage.getItem('userId');
    const username = await AsyncStorage.getItem('username');

    navigation.setOptions({
      title: "PlayPals",
      headerStyle: { backgroundColor: "#E4E4E4" },
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Conversations")}>
          <Image 
            source={require('../assets/chat.png')} // Load the chat.png image
            style={{ width: 30, height: 30, marginRight: 10 }} // Adjust the size and margin as needed
          />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <TextInput
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType='search'
          style={{
            backgroundColor: '#fff',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 10,
            width: 220,
            fontSize: 16,
            textAlign: 'center',
          }}
        />
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Profile", {userId: parseInt(userId) })}> 
          <Image 
            source={require('../assets/profile.png')} // Load the profile image later this will be a users pfp
            style={{ width: 30, height: 30, marginLeft: 10 }} // Adjust the size and margin as needed
          />
        </TouchableOpacity>
      ),
    });
  }
  setupHeader();
  }, [navigation, searchQuery]);

  //the tab navigator for the different tabs at the bottom of screen
  return (
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarStyle: { backgroundColor: '#E4E4E4' },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#000000',
          tabBarShowLabel: true,

          //Set the icons
          tabBarIcon: ({ color, size }) => {
            let iconSource;
      
            if (route.name === "Home") {
              iconSource = require('../assets/home.png');
            } else if (route.name === "Pets") {
              iconSource = require('../assets/paws.png');
            } else if (route.name === "Forums") {
              iconSource = require('../assets/forums.png');
            } else if (route.name === "Create Post") {
              iconSource = require('../assets/create.png');
            } else if (route.name === "Calendar") {
              iconSource = require('../assets/time-and-date.png');
            } else if (route.name === "Trip Planner") {
              iconSource = require('../assets/map.png');
            } else if (route.name === "Settings") {
              iconSource = require('../assets/setting.png');
            }
            
            //Icon styling
            return (
              <Image
                source={iconSource}
                style={{ width: size, height: size, tintColor: color }}
                resizeMode="contain"
              />
            );
          },
        })}
      >
        <Tab.Screen name="Home" component={FeedScreenRender} options={{headerShown: false}} />
        <Tab.Screen name="Pets" component={PlayDateScreen} options={{headerShown: false}} />
        <Tab.Screen name="Forums" component={ForumsScreen} options={{headerShown: false}} /> 
        <Tab.Screen name="Create Post" component={CreatePostScreenRender} options={{headerShown: false}} />
        <Tab.Screen name="Calendar" component={CalendarScreenRender} options={{headerShown: false}} />
        <Tab.Screen name="Trip Planner" component={TripPlannerScreen} options={{headerShown: false}} />
        <Tab.Screen name="Settings" component={AppSettings} options={{headerShown: false}} />
      </Tab.Navigator>
  );
}
