import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  Alert, Animated, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 80,
    }).start();
  }, []);

  const handleSignUp = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Incomplete", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}api/auth/registerUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (response.ok) {
        setShowConfetti(true);

        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }).start(() => {
            navigation.navigate('Login');
          });
        }, 1200);
      } else {
        Alert.alert("Error", data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Animated.Image
            source={require('../assets/pet_logo.png')}
            style={[
              styles.logo,
              {
                transform: [
                  {
                    scale: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1]
                    })
                  }
                ],
                opacity: logoAnim
              }
            ]}
          />

          <Text style={styles.title}>Join the PlayPals Pack! 🐶</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#7a7a7a"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
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

          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={() => {
              Animated.spring(buttonScale, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(buttonScale, {
                toValue: 1,
                useNativeDriver: true,
              }).start();
            }}
            onPress={handleSignUp}
          >
            <Animated.View style={[styles.button, { transform: [{ scale: buttonScale }] }]}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Login 🐾</Text>
          </TouchableOpacity>

          {showConfetti && (
            <ConfettiCannon
              count={30}
              origin={{ x: 200, y: 0 }}
              fadeOut
              fallSpeed={2500}
              explosionSpeed={350}
              autoStart
            />
          )}

          <Animated.View style={[styles.fadeOverlay, { opacity: fadeAnim }]} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FCEECF', padding: 20
  },
  logo: {
    width: 200, height: 200, marginBottom: 20, resizeMode: 'contain'
  },
  title: {
    fontSize: 26, fontWeight: 'bold', color: '#5A3E36', marginBottom: 20
  },
  input: {
    width: '80%', padding: 12, borderWidth: 2, borderColor: '#E07A5F',
    backgroundColor: '#FFF5E4', marginBottom: 10, borderRadius: 25, textAlign: 'center'
  },
  button: {
    backgroundColor: '#E07A5F', padding: 12, width: '80%',
    alignItems: 'center', borderRadius: 25, marginTop: 10
  },
  buttonText: {
    color: 'white', fontSize: 18, fontWeight: 'bold'
  },
  linkText: {
    marginTop: 15, color: '#D1495B', fontSize: 16
  },
  fadeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FCEECF',
    zIndex: 10,
  }
});
