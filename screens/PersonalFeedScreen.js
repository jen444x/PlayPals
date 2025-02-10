import React, { useLayoutEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

function PlayDateScreen() {
  return (
    <View>
      <Text>Welcome to the play date page!</Text>
    </View>
  );
}

function ForumsScreen() {
  return (
    <View>
      <Text>Welcome to the forums page!</Text>
    </View>
  );
}

function CreatePostScreen() {
  return (
    <View>
      <Text>Welcome to the post creation page!</Text>
    </View>
  );
}

function CalendarScreen() {
  return (
    <View>
      <Text>Welcome to the calendar page!</Text>
    </View>
  );
}

function TripPlannerScreen() {
  return (
    <View>
      <Text>Welcome to the trip planner page!</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function PersonalFeed({ navigation }) {
  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "PlayPals",
      headerStyle: { backgroundColor: "#E4E4E4" },
    });
  }, [navigation]);
  
  return (
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarStyle: { backgroundColor: '#E4E4E4' },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#000000',
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => {
            let iconSource;
      
            if (route.name === "Play Date") {
              iconSource = require('../assets/paws.png');
            } else if (route.name === "Forums") {
              iconSource = require('../assets/forums.png');
            } else if (route.name === "Create Post") {
              iconSource = require('../assets/create.png');
            } else if (route.name === "Calendar") {
              iconSource = require('../assets/time-and-date.png');
            } else if (route.name === "Trip Planner") {
              iconSource = require('../assets/map.png');
            }
      
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
        <Tab.Screen name="Play Date" component={PlayDateScreen} />
        <Tab.Screen name="Forums" component={ForumsScreen} />
        <Tab.Screen name="Create Post" component={CreatePostScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Trip Planner" component={TripPlannerScreen} />
      </Tab.Navigator>
  );
}