import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

//Messages component 
export default function MessagesScreen() {
    console.log("Rendering MessagesScreen");
  return (
    <View style={styles.container}>
        <Text style={styles.text}>Welcome to the direct messages page!</Text>
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