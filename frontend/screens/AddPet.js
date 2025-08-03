import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  Text,
  Button,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config.js";
import { ThemeContext } from "../ThemeContext"; // ✅ Import ThemeContext

const AddPet = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext); // ✅ Get dark mode state
  const styles = getStyles(isDarkMode); // ✅ Use dynamic styles

  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petBirthday, setPetBirthday] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [petImage, setPetImage] = useState(null);

  const calculateAge = (birthday) => {
    if (!birthday) return 0;
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPetBirthday(normalizeDate(selectedDate));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need permission to access your media library!"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPetImage(result.assets[0].uri);
    }
  };

  const uploadImageToServer = async (userId, petId, imageFile) => {
    const formData = new FormData();
    formData.append("avatar", {
      uri: imageFile.uri,
      name: imageFile.fileName || "avatar.jpg",
      type: imageFile.type || "image/jpeg",
    });

    await fetch(`${BASE_URL}api/pets/${userId}/${petId}/uploadAvatar`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });
  };

  const handleAddPet = async () => {
    if (!petName.trim() || !petBreed.trim() || !petBirthday) {
      setError("Please fill in all fields correctly.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found");

      const petAge = calculateAge(petBirthday);
      const newPet = {
        name: petName,
        breed: petBreed,
        birthday: petBirthday,
        age: petAge,
        image: petImage,
      };

      const response = await fetch(`${BASE_URL}api/pets/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPet),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert("Error", data.message || "Something went wrong.");
        return;
      }

      const petId = data.petId;
      setSuccess(true);

      if (petImage && petId) {
        await uploadImageToServer(userId, petId, {
          uri: petImage,
          name: "avatar.jpg",
          type: "image/jpeg",
        });
      }

      Alert.alert("Success", "Pet details saved successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error("Error saving pet details:", err);
      setError("An error occurred while saving pet details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/petBackground.jpg")}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Add a New Pet</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Pet Name"
          value={petName}
          onChangeText={setPetName}
          placeholderTextColor={isDarkMode ? "#BBB" : "#8B7E66"}
        />
        <TextInput
          style={styles.input}
          placeholder="Breed"
          value={petBreed}
          onChangeText={setPetBreed}
          placeholderTextColor={isDarkMode ? "#BBB" : "#8B7E66"}
        />

        {Platform.OS === "web" ? (
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={petBirthday ? petBirthday.toISOString().split("T")[0] : ""}
            onChangeText={(text) => {
              const selectedDate = new Date(text);
              if (!isNaN(selectedDate))
                setPetBirthday(normalizeDate(selectedDate));
            }}
            placeholderTextColor={isDarkMode ? "#BBB" : "#8B7E66"}
          />
        ) : (
          <>
            <View style={styles.dateButton}>
              <Button
                title="Select Birthday"
                onPress={() => setShowDatePicker(true)}
                color="#FF6F61"
              />
            </View>
            {petBirthday && (
              <Text style={styles.birthdayText}>
                Selected Birthday: {petBirthday.toLocaleDateString()} (Age:{" "}
                {calculateAge(petBirthday)})
              </Text>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={petBirthday || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </>
        )}

        <View style={styles.imageButton}>
          <Button
            title="Upload Pet Picture"
            onPress={pickImage}
            color="#FF6F61"
          />
        </View>

        {petImage && <Image source={{ uri: petImage }} style={styles.image} />}

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color="#6D4C41"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <View style={styles.addButton}>
            <Button title="Add Pet" onPress={handleAddPet} color="#E76F51" />
          </View>
        )}

        {success && (
          <Text style={styles.successText}>Pet added successfully!</Text>
        )}
      </View>
    </ImageBackground>
  );
};

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    background: {
      flex: 1,
      resizeMode: "cover",
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: isDarkMode
        ? "rgba(0, 0, 0, 0.7)"
        : "rgba(255, 255, 255, 0.85)",
      margin: 20,
      borderRadius: 15,
    },
    title: {
      fontSize: 30,
      fontWeight: "bold",
      color: isDarkMode ? "#FAFAFA" : "#4A4A4A",
      textShadowColor: isDarkMode ? "#000" : "#fff",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 5,
      marginBottom: 20,
    },
    input: {
      width: "100%",
      padding: 10,
      borderRadius: 10,
      backgroundColor: isDarkMode ? "#2C2C2C" : "#FFF",
      color: isDarkMode ? "#FFF" : "#000",
      marginBottom: 15,
      borderColor: isDarkMode ? "#888" : "#6D4C41",
      borderWidth: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    dateButton: {
      width: "100%",
      marginBottom: 10,
    },
    imageButton: {
      width: "100%",
      marginBottom: 15,
    },
    birthdayText: {
      marginVertical: 10,
      fontSize: 16,
      color: isDarkMode ? "#DDD" : "#4A4A4A",
    },
    errorText: {
      color: "#D9534F",
      marginBottom: 10,
    },
    successText: {
      color: "#5CB85C",
      marginTop: 10,
      fontSize: 16,
    },
    image: {
      width: 200,
      height: 200,
      marginVertical: 10,
      borderRadius: 15,
    },
    addButton: {
      width: "100%",
      marginTop: 10,
    },
  });

export default AddPet;
