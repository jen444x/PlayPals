import React, { useState } from 'react';
import { Image } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    // Replace this with real authentication logic (API call, etc.)
    if (email === "test@example.com" && password === "1234") {
      navigation.navigate('Home');  // Navigate to Home on successful login
    } else {
      Alert.alert("Error", "Invalid credentials");
    }
  };


  return (
    <View style={styles.container}>
      <Image source = {require('../assets/pet_logo.png')} style={styles.logo}/>
      <Text style={styles.title}>Welcome to PlayPals! 🐾</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#7a7a7a"
        value={email}
        onChangeText={setEmail}
      />
     
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#7a7a7a"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.linkText}>New here? Sign up and join the pack! 🐕</Text>
      </TouchableOpacity>
    </View>
  
  

);
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FCEECF' },
  logo: { width: 200, height: 200, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold',color: '#5A3E36', marginBottom: 20 },
  input: { width: '80%', padding: 12, borderWidth: 2, borderColor: '#E07A5F',backgroundColor: '#FFF5E4', marginBottom: 10, borderRadius: 25, textAlign: 'center' },
  button: { backgroundColor: '#E07A5F', padding: 12, width: '80%', alignItems: 'center', borderRadius: 25 },
  buttonText: { color: 'white', fontSize: 18,fontWeight:'bold' },
  linkText: { marginTop: 15, color: '#D1495B',fontSize:16 }
});
