import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ProfileScreen from './PublicProfileScreen';

//Forums component 
export default function ProfileScreenNav() {
  return (
    <ProfileScreen/>
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