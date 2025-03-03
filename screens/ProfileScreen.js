import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

//Forums component 
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
        <Text style={styles.text}>Welcome to the profile page!</Text>
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