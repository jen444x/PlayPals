import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ForumsScreen from './ForumsScreen';
import MessagesScreen from './DirectMessagesScreen';

const Tab = createMaterialTopTabNavigator();

export default function ChatScreen() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Forums" component={ForumsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
    </Tab.Navigator>
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