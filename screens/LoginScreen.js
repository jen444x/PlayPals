import React, { useState } from 'react';
import { Image } from 'react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config.js';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,KeyboardAvoidingView, 
  TouchableWithoutFeedback, Keyboard} from 'react-native';
  

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}api/auth/loginUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.userId.toString());
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log("Saved JWT Token:", data.token);
        console.log("Saved userId:", storedUserId);
        navigation.navigate('PetHome');
      } else {
        Alert.alert("Error", "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
      // Replace this with real authentication logic (API call, etc.)
      //if (email === "Test@example.com" && password === "1234") {
      //  navigation.navigate('PetHome');  // Navigate to Home on successful login
      //} else {
      //  Alert.alert("Error", "Invalid credentials");
      //}
  };


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}> 
      <TouchableWithoutFeedback onPress={Platform.OS === 'web' ? null : Keyboard.dismiss}>
   
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
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  
  

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
