import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import PetProfile from './screens/PetProfile';
import AddPet from './screens/AddPet'; 
import PersonalFeedScreen from './screens/PersonalFeedScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PersonalFeed">
       
       <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="PetProfile" component={PetProfile} options={{ title: 'Pet Profile' }} />
        <Stack.Screen name="AddPet" component={AddPet} options={{ title: 'Add a Pet' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Chats" component={ChatScreen} />
        <Stack.Screen name="PersonalFeed" component={PersonalFeedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
