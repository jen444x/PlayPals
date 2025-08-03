import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ImageBackground,
  Alert,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config";
import { ThemeContext } from "../ThemeContext"; // Added for dark mode

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { isDarkMode } = useContext(ThemeContext); // Get dark mode
  const styles = getStyles(isDarkMode); // Apply dynamic styles
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const fetchUserPets = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        const response = await fetch(`${BASE_URL}api/pets/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch pets");

        const data = await response.json();
        setPets(data);
      } catch (error) {
        console.error("Error fetching pets:", error);
        Alert.alert("Error", "Could not load your pets.");
      }
    };

    if (isFocused) {
      fetchUserPets();
    }
  }, [isFocused]);

  const renderPetItem = ({ item }) => {
    const avatarSource = item.avatar
      ? { uri: `${BASE_URL}${item.avatar}` }
      : require("../assets/pet.png");

    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => navigation.navigate("PetProfile", { petId: item.petId })}
      >
        <Image source={avatarSource} style={styles.petImage} />
        <Text style={styles.petName}>{item.petName}</Text>
        <Text style={styles.petBreed}>{item.breed}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../assets/petBackground.jpg")} // Same image for all themes
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome Back! 🐾</Text>
        <Text style={styles.subtitle}>
          Pick a pet profile to manage and have some fun!
        </Text>

        <TouchableOpacity
          style={styles.addPetButton}
          onPress={() => navigation.navigate("AddPet")}
        >
          <Text style={styles.addPetText}>Add a Pet</Text>
        </TouchableOpacity>

        {pets.length === 0 ? (
          <View style={styles.noPetsContainer}>
            <Text style={styles.noPetsText}>No pets found. Let's add one!</Text>
          </View>
        ) : (
          <FlatList
            data={pets}
            renderItem={renderPetItem}
            keyExtractor={(item) => item.petId.toString()}
            contentContainerStyle={styles.petList}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      resizeMode: "cover",
    },
    overlay: {
      flex: 1,
      padding: 20,
      backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: 30,
      fontWeight: "bold",
      color: isDarkMode ? "#FAFAFA" : "#4A4A4A",
      textShadowColor: isDarkMode ? "#000" : "#fff",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 5,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 18,
      color: isDarkMode ? "#E0E0E0" : "#4A4A4A",
      marginBottom: 20,
    },
    petList: {
      flexGrow: 1,
      justifyContent: "center",
      width: "100%",
    },
    petCard: {
      backgroundColor: isDarkMode ? "rgba(30, 30, 30, 0.85)" : "rgba(255, 255, 255, 0.85)",
      borderRadius: 15,
      marginVertical: 10,
      padding: 20,
      alignItems: "center",
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    petImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
    },
    petName: {
      fontSize: 22,
      fontWeight: "bold",
      color: isDarkMode ? "#FFF" : "#333",
    },
    petBreed: {
      fontSize: 16,
      color: isDarkMode ? "#CCC" : "#555",
    },
    noPetsContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 30,
    },
    noPetsText: {
      fontSize: 18,
      color: isDarkMode ? "#DDD" : "#333",
      marginBottom: 15,
    },
    addPetButton: {
      backgroundColor: "#FF6F61",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 30,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    addPetText: {
      fontSize: 18,
      color: "#fff",
      fontWeight: "bold",
      marginLeft: 5,
    },
  });

export default HomeScreen;
