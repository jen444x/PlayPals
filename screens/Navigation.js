import React, { useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CalendarScreen from './CalendarScreen';
import CreatePostScreen from './CreatePostScreen'
import ForumsScreen from './ForumsScreen';
import AppSettings from './AppSettings';
import FeedScreen from './FeedScreen'; 

//Personal feed component would go here
function FeedScreenRender() {
  return (
    <FeedScreen/>
  );
}

//Play date component
function PlayDateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the play date page!</Text>
    </View>
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

  //Create the PlayPals header
  useLayoutEffect(() => {
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
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}> 
          <Image 
            source={require('../assets/profile.png')} // Load the profile image later this will be a users pfp
            style={{ width: 30, height: 30, marginLeft: 10 }} // Adjust the size and margin as needed
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

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
            } else if (route.name === "Play Date") {
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
        <Tab.Screen name="Home" component={FeedScreen} options={{headerShown: false}} />
        <Tab.Screen name="Play Date" component={PlayDateScreen} options={{headerShown: false}} />
        <Tab.Screen name="Forums" component={ForumsScreen} options={{headerShown: false}} /> 
        <Tab.Screen name="Create Post" component={CreatePostScreenRender} options={{headerShown: false}} />
        <Tab.Screen name="Calendar" component={CalendarScreenRender} options={{headerShown: false}} />
        <Tab.Screen name="Trip Planner" component={TripPlannerScreen} options={{headerShown: false}} />
        <Tab.Screen name="Settings" component={AppSettings} options={{headerShown: false}} />
      </Tab.Navigator>
  );
}
