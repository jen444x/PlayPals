import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import ConfettiCannon from "react-native-confetti-cannon";
import { BASE_URL } from "../config";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureEntry, setSecureEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const pawAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current; // ⬅️ Fade overlay animation

  useEffect(() => {
    Animated.spring(pawAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 80,
    }).start();
  }, []);

  const togglePasswordVisibility = () => {
    setSecureEntry(!secureEntry);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}api/auth/loginUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("userId", data.userId.toString());
        await AsyncStorage.setItem("username", data.username);
        const storedUserId = await AsyncStorage.getItem("userId");
        const storedUsername = await AsyncStorage.getItem("username");

        const { sound } = await Audio.Sound.createAsync(
          require("../assets/bark.mp3")
        );
        await sound.playAsync();

        setShowConfetti(true);

        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }).start(() => {
            navigation.navigate("Navigation");
          });
        }, 1800); // wait for confetti to pop before fade
      } else {
        Alert.alert("Login Failed", data?.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback
        onPress={Platform.OS === "web" ? null : Keyboard.dismiss}
      >
        <View style={styles.container}>
          <Animated.Image
            source={require("../assets/pet_logo.png")}
            style={[
              styles.logo,
              {
                transform: [
                  {
                    scale: pawAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
                opacity: pawAnim,
              },
            ]}
          />

          <Text style={styles.title}>Welcome to PlayPals! 🐾</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#7a7a7a"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Password"
              placeholderTextColor="#7a7a7a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureEntry}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {secureEntry ? "Show" : "Hide"}
              </Text>
            </TouchableOpacity>
          </View>

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
            onPress={handleLogin}
            disabled={!email || !password || loading}
          >
            <Animated.View
              style={[
                styles.button,
                (!email || !password) && styles.disabledButton,
                { transform: [{ scale: buttonScale }] },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.linkText}>
              New here? Sign up and join the pack! 🐕
            </Text>
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

          {/* Fade Transition Overlay */}
          <Animated.View style={[styles.fadeOverlay, { opacity: fadeAnim }]} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCEECF",
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#5A3E36",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 12,
    borderWidth: 2,
    borderColor: "#E07A5F",
    backgroundColor: "#FFF5E4",
    marginBottom: 10,
    borderRadius: 25,
    textAlign: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%",
    borderWidth: 2,
    borderColor: "#E07A5F",
    borderRadius: 25,
    backgroundColor: "#FFF5E4",
    marginBottom: 10,
    paddingRight: 10,
  },
  toggleButton: {
    padding: 10,
  },
  toggleText: {
    color: "#E07A5F",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#E07A5F",
    padding: 12,
    width: "80%",
    alignItems: "center",
    borderRadius: 25,
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#e8a899",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 15,
    color: "#D1495B",
    fontSize: 16,
  },
  fadeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FCEECF",
    zIndex: 10,
  },
});
