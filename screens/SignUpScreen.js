import React, { useState } from 'react';
import { Image } from 'react-native';

import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !username || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
  
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
  
    try {
      const response = await fetch('https://test2.playpals-app.com/api/auth/registerUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });
  
      const data = await response.json();
      console.log("Signup response:", data);
  
      if (response.ok) {
        alert("Account created successfully!");
        navigation.navigate('Login');
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Image source = {require('../assets/pet_logo.png')} style={styles.logo}/>
      <Text style={styles.title}>Join the PlayPals Pack! 🐶</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#7a7a7a"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#7a7a7a"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#7a7a7a"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#7a7a7a"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Login 🐾</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FCEECF' },
  logo: { width: 200, height: 200, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold',color: '#5A3E36', marginBottom: 20 },
  input: { width: '80%', padding: 12, borderWidth: 2,borderColor: '#E07A5F', backgroundColor: '#FFF5E4', marginBottom: 10, borderRadius: 25, textAlign: 'center' },
  button: { backgroundColor: '#E07A5F', padding: 12, width: '80%', alignItems: 'center', borderRadius: 25 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  linkText: { marginTop: 15, color: '#D1495B', fontSize: 16 }
});
