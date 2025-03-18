import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import PetProfile from './screens/PetProfile';
import AddPet from './screens/AddPet';
import EditPet from './screens/EditPet';
import ConversationsScreen from './screens/ConversationsScreen';
import PublicProfileScreen from './screens/PublicProfileScreen';
import ChatScreen from './screens/ChatScreen';
import ForumsScreen from './screens/ForumsScreen';
import NewDiscussion from './screens/NewDiscussion';
import DiscussionDetail from './screens/DiscussionDetail';
import CalendarScreen from './screens/CalendarScreen';
import AppSettings from './screens/AppSettings';
import UserProfile from './screens/UserProfile';
import { ThemeProvider } from './ThemeContext'; // adjust the path if necessary

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="PetProfile" component={PetProfile} options={{ title: 'Pet Profile' }} />
          <Stack.Screen name="AddPet" component={AddPet} options={{ title: 'Add a Pet' }} />
          <Stack.Screen name="EditPet" component={EditPet} options={{ title: 'Edit Pet' }} />
          <Stack.Screen name="Conversations" component={ConversationsScreen} options={{ title: 'Chats' }}/>
          <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: 'My Profile' }}/>
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }}/>
          <Stack.Screen name="Forums" component={ForumsScreen} options={{ title: 'Forums' }} />
          <Stack.Screen name="NewDiscussion" component={NewDiscussion} options={{ title: 'New Discussion' }} />
          <Stack.Screen name="DiscussionDetail" component={DiscussionDetail} options={{ title: 'Discussion Detail' }} />
          <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Pet Calendar' }} />
          <Stack.Screen name="AppSettings" component={AppSettings} options={{ title: 'App Settings' }} />
          <Stack.Screen name="UserProfile" component={UserProfile} options={{ title: 'User Profile' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
