import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
//import ForumsScreenTab from './ForumsScreenTab';
//import MessagesScreenTab from './DirectMessagesScreenTab';

function MessagesScreenTab() {
    console.log("Rendering MessagesScreen");
  return (
    <View style={styles.container}>
        <Text style={styles.text}>Welcome to the direct messages page!</Text>
    </View>
  );
}

function ForumsScreenTab() {
    console.log("Rendering ForumsScreen");
  return (
    <View style={styles.container}>
        <Text style={styles.text}>Welcome to the forums page!</Text>
    </View>
  );
}

const Tab = createMaterialTopTabNavigator();

export default function ChatScreenNav() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Forums" component={ForumsScreenTab} />
      <Tab.Screen name="Messages" component={MessagesScreenTab} />
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