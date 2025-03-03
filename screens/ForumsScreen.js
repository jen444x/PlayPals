import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

//Forums component 
export default function ForumsScreen() {
    console.log("Rendering ForumsScreen");
  return (
    <View style={styles.container}>
        <Text style={styles.text}>Welcome to the forums page!</Text>
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