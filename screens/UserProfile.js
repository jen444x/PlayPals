import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ToastAndroid,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import * as Yup from "yup";
import { ThemeContext } from "../ThemeContext"; // adjust path
import { BASE_URL } from "../config.js";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
});

const UserProfile = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);
  const isFocused = useIsFocused();

  const [originalProfile, setOriginalProfile] = useState({
    username: "",
    email: "",
    profileImage: null,
    petProfiles: [],
  });

  const [profileImage, setProfileImage] = useState(null);
  const [petProfiles, setPetProfiles] = useState([]);
  const [petNameEdits, setPetNameEdits] = useState({});
  const [petBreedEdits, setPetBreedEdits] = useState({});
  const [isEditingPets, setIsEditingPets] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dynamicContainerStyle = {
    backgroundColor: isDarkMode ? "#252526" : "#FFF3E0",
  };
  const dynamicTextStyle = {
    color: isDarkMode ? "#0BA385" : "#5D4037",
  };

  const showToast = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("", message);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");

        // fetch user data
        const res = await fetch(`${BASE_URL}api/users/${userId}`);
        const userData = await res.json();

        // fetch pet data
        const petsRes = await fetch(`${BASE_URL}api/pets/${userId}`);
        const petData = await petsRes.json();

        setOriginalProfile({ ...userData, petProfiles: petData });
        setProfileImage(userData.profileImage);
        setPetProfiles(petData);
      } catch (err) {
        console.error("Error fetching profile or pets:", err);
      }
    };

    // Only run fetch if the screen is active
    if (isFocused) {
      fetchUserProfile();
    }

    // fetchUserProfile();
  }, [isFocused]);

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast("Permission to access media library is required!");
        return;
      }
      setIsLoading(true);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        showToast("Profile image updated");
      }
    } catch (error) {
      console.error("Error picking image: ", error);
      showToast("An error occurred while picking the image");
    } finally {
      setIsLoading(false);
    }
  };

  // what happens when you click save profile
  const handleSaveProfile = async (values, resetForm) => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");

      const payload = {
        email: values.email,
        username: values.username,
      };

      const res = await fetch(`${BASE_URL}api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // const resText = await res.text();
      const resJson = await res.json();
      console.log("🔍 Server response:", resJson);

      // if (!res.ok) throw new Error(resText || "Update failed");
      if (!res.ok) {
        if (resJson.message === "Email and username are already in use.") {
          showToast("Both the email and username are already taken!");
        } else if (resJson.message === "Email is already in use.") {
          showToast("That email is already taken!");
        } else if (resJson.message === "Username is already in use.") {
          showToast("That username is already taken!");
        } else {
          showToast(resJson.message || "Update failed");
        }
        // DO NOT throw error here! (stop crashing the app)
        return;
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setOriginalProfile({ ...values, profileImage, petProfiles });
      resetForm({ values });
      showToast("Profile updated!");
    } catch (e) {
      console.error("Save error:", e);
      showToast("Save failed");
    } finally {
      setIsLoading(false);
    }
  };

  const addPetProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      const newPet = {
        name: "New Pet",
        breed: "Unknown",
      };

      const response = await fetch(`${BASE_URL}api/pets/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPet),
      });

      if (!response.ok) {
        throw new Error("Failed to add pet");
      }

      const savedPet = await response.json();
      setPetProfiles([...petProfiles, savedPet]);
      setPetNameEdits({});
      setPetBreedEdits({});
      showToast("Pet profile added successfully!");
    } catch (error) {
      console.error("Add pet failed:", error);
      showToast("Could not save pet profile.");
    }
  };

  const removePetProfile = async (petId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      const res = await fetch(`${BASE_URL}api/pets/${userId}/${petId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete pet: ${errorText}`);
      }

      setPetProfiles((prevPets) =>
        prevPets.filter((pet) => pet.petId !== petId)
      );
      setPetNameEdits({});
      setPetBreedEdits({});
      showToast("Pet profile removed");
    } catch (error) {
      console.error("❌ Delete pet failed:", error);
      showToast("Failed to delete pet");
    }
  };

  const updatePetInfo = async (petId, newName, newBreed) => {
    if (!newName.trim()) {
      showToast("Please enter a valid pet name.");
      return;
    }

    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem("userId");

      const payload = {
        petName: newName,
        breed: newBreed,
      };

      const url = `${BASE_URL}api/pets/${userId}/${petId}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      if (!response.ok)
        throw new Error(responseText || "Failed to update pet.");

      setPetProfiles((prevPets) =>
        prevPets.map((pet) =>
          pet.petId === petId
            ? { ...pet, petName: newName, breed: newBreed }
            : pet
        )
      );

      showToast("Pet info updated!");
    } catch (err) {
      console.error("Error updating pet:", err);
      showToast("An error occurred while updating pet name.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[styles.container, dynamicContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, dynamicTextStyle]}>My Pet Profiles</Text>

          <Formik
            enableReinitialize
            initialValues={{
              username: originalProfile.username,
              email: originalProfile.email,
            }}
            validationSchema={ProfileSchema}
            onSubmit={(values, { resetForm }) =>
              handleSaveProfile(values, resetForm)
            }
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              dirty,
            }) => (
              <>
                {/* Profile Image */}
                <TouchableOpacity onPress={pickImage} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator
                      size="large"
                      color={isDarkMode ? "#FFCCBC" : "#5D4037"}
                    />
                  ) : profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <Image
                      source={require("../assets/avatar.png")}
                      style={styles.profileImage}
                    />
                  )}
                </TouchableOpacity>

                {/* Username and Email */}
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: dynamicTextStyle.color,
                      borderColor: dynamicTextStyle.color,
                    },
                  ]}
                  placeholder="Your Username"
                  placeholderTextColor={isDarkMode ? "#aaa" : "#5D4037"}
                  onChangeText={handleChange("username")}
                  onBlur={handleBlur("username")}
                  value={values.username}
                  editable={true}
                />
                {errors.username && touched.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: dynamicTextStyle.color,
                      borderColor: dynamicTextStyle.color,
                    },
                  ]}
                  placeholder="Your Email"
                  placeholderTextColor={isDarkMode ? "#aaa" : "#5D4037"}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  keyboardType="email-address"
                  editable={true}
                />
                {errors.email && touched.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                {/* Save Button */}
                {dirty && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                )}

                {/* Pets Section */}
                <View style={styles.petSection}>
                  <Text style={[styles.sectionTitle, dynamicTextStyle]}>
                    My Pets
                  </Text>

                  {Array.isArray(petProfiles) && petProfiles.length === 0 ? (
                    <Text
                      style={{
                        textAlign: "center",
                        color: dynamicTextStyle.color,
                      }}
                    >
                      You don't have any pets yet.
                    </Text>
                  ) : (
                    petProfiles.map((pet) => (
                      <View key={pet.petId} style={styles.petProfile}>
                        <Image
                          source={require("../assets/pet-placeholder.png")}
                          style={styles.petImage}
                        />
                        <View style={{ flex: 1 }}>
                          {isEditingPets ? (
                            <>
                              <TextInput
                                style={[
                                  styles.petNameInput,
                                  {
                                    color: dynamicTextStyle.color,
                                    borderColor: dynamicTextStyle.color,
                                  },
                                ]}
                                value={petNameEdits[pet.petId] ?? pet.petName}
                                onChangeText={(text) =>
                                  setPetNameEdits((prev) => ({
                                    ...prev,
                                    [pet.petId]: text,
                                  }))
                                }
                                onBlur={() => {
                                  const newName = petNameEdits[pet.petId];
                                  if (newName && newName !== pet.petName) {
                                    updatePetInfo(
                                      pet.petId,
                                      newName,
                                      pet.breed
                                    );
                                  }
                                }}
                                placeholder="Pet Name"
                                placeholderTextColor={
                                  isDarkMode ? "#aaa" : "#5D4037"
                                }
                              />
                              <TextInput
                                style={[
                                  styles.petNameInput,
                                  {
                                    color: dynamicTextStyle.color,
                                    borderColor: dynamicTextStyle.color,
                                    marginTop: 8,
                                  },
                                ]}
                                value={petBreedEdits[pet.petId] ?? pet.breed}
                                onChangeText={(text) =>
                                  setPetBreedEdits((prev) => ({
                                    ...prev,
                                    [pet.petId]: text,
                                  }))
                                }
                                onBlur={() => {
                                  const newBreed = petBreedEdits[pet.petId];
                                  if (newBreed && newBreed !== pet.breed) {
                                    updatePetInfo(
                                      pet.petId,
                                      pet.petName,
                                      newBreed
                                    );
                                  }
                                }}
                                placeholder="Pet Breed"
                                placeholderTextColor={
                                  isDarkMode ? "#aaa" : "#5D4037"
                                }
                              />
                            </>
                          ) : (
                            <Text style={[styles.petName, dynamicTextStyle]}>
                              {pet.petName} ({pet.breed || "Unknown breed"})
                            </Text>
                          )}
                        </View>

                        {isEditingPets && (
                          <TouchableOpacity
                            style={styles.removePetButton}
                            onPress={() => removePetProfile(pet.petId)}
                          >
                            <Text style={styles.removePetButtonText}>
                              Remove
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  )}

                  {isEditingPets && (
                    <TouchableOpacity
                      style={styles.addPetButton}
                      // onPress={addPetProfile}
                      onPress={() => navigation.navigate("AddPet")}
                    >
                      <Text style={styles.addPetButtonText}>Add Pet</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Edit Pets Button */}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut
                    );
                    setIsEditingPets((prev) => !prev);
                  }}
                >
                  <Text style={styles.editButtonText}>
                    {isEditingPets ? "Done Editing Pets" : "Edit My Pets"}
                  </Text>
                </TouchableOpacity>

                {/* Back Button */}
                <TouchableOpacity
                  style={[styles.backButton, { marginTop: 20 }]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={[styles.backButtonText, dynamicTextStyle]}>
                    Go Back
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 1.2,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FBC02D",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FDD835",
    fontSize: 16,
  },
  errorText: {
    color: "#D32F2F",
    marginBottom: 8,
    alignSelf: "flex-start",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#FF7043",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 10,
    width: "100%",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#FFB74D",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
  },
  editButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 15,
  },
  backButtonText: {
    fontSize: 16,
  },
  petSection: {
    width: "100%",
    marginTop: 25,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#FDD835",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  petProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#FBC02D",
  },
  petName: {
    fontSize: 16,
    flex: 1,
  },
  petNameInput: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#FDD835",
    fontSize: 16,
    marginBottom: 5,
  },
  removePetButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  removePetButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  addPetButton: {
    backgroundColor: "#66BB6A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: "center",
    marginTop: 15,
  },
  addPetButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default UserProfile;
