import React, { useState, useEffect, useContext } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ThemeContext } from '../ThemeContext'; // Adjust the path as needed

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(4, 'Too Short!').required('Password is required'),
  location: Yup.string().required('Location is required'),
});

const UserProfile = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext); // Use the ThemeContext here

  // Original profile holds the saved state.
  const [originalProfile, setOriginalProfile] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    location: '',
    profileImage: null,
    petProfiles: [],
  });

  // Local state for profile image and pet profiles (managed outside of Formik)
  const [profileImage, setProfileImage] = useState(originalProfile.profileImage);
  const [petProfiles, setPetProfiles] = useState([]);
  const [petNameEdits, setPetNameEdits] = useState({});


  

  // Editing and loading state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic styling based on ThemeContext (pet-themed colors)
  const dynamicContainerStyle = {
    backgroundColor: isDarkMode ? '#252526' : '#FFF3E0', // Dark brown vs. light orange cream
  };
  const dynamicTextStyle = {
    color: isDarkMode ? '#0BA385' : '#5D4037', // Light peach vs. dark brown
  };

  // Helper for toast notifications
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };
 // Fetch user profile from backend
 useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      // Fetch user info
      const res = await fetch(`${BASE_URL}api/users/${userId}`);
      const userData = await res.json();

      // Fetch pets
      const petsRes = await fetch(`${BASE_URL}api/pets/${userId}`);
      const petData = await petsRes.json();

      // Save both in state
      setOriginalProfile({ ...userData, petProfiles: petData });
      setProfileImage(userData.profileImage);
      setPetProfiles(petData);
    } catch (err) {
      console.error('Error fetching profile or pets:', err);
    }
  };

  fetchUserProfile();
}, []);


  // Pick profile image with loading indicator and error handling
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        showToast('Permission to access media library is required!');
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
        showToast('Profile image updated');
      }
    } catch (error) {
      console.error('Error picking image: ', error);
      showToast('An error occurred while picking the image');
    } finally {
      setIsLoading(false);
    }
  };

  // Pet Profiles Management
  const addPetProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        showToast("User ID not found.");
        return;
      }
  
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
      showToast("Pet profile added successfully!");
    } catch (error) {
      console.error("Add pet failed:", error);
      showToast("Could not save pet profile.");
    }
  };
  

  const removePetProfile = async (petId) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const res = await fetch(`${BASE_URL}api/pets/${userId}/${petId}`, {
        method: 'DELETE',
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to delete pet: ${errorText}`);
      }
  
      setPetProfiles((prevPets) => prevPets.filter((pet) => pet.petId !== petId));
      showToast('Pet profile removed');
    } catch (error) {
      console.error('❌ Delete pet failed:', error);
      showToast('Failed to delete pet');
    }
  };
  
  const updatePetName = async (petId, newName) => {
    if (!newName.trim()) {
      showToast('Please enter a valid pet name.');
      return;
    }
  
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
  
      const payload = {
        petName: newName,
      };
  
      const url = `${BASE_URL}api/pets/${userId}/${petId}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const responseText = await response.text();
      if (!response.ok) throw new Error(responseText || 'Failed to update pet.');
  
      // Update local state
      setPetProfiles((prevPets) =>
        prevPets.map((pet) =>
          pet.petId === petId ? { ...pet, petName: newName } : pet
        )
      );
  
      showToast('Pet name updated!');
    } catch (err) {
      console.error('Error updating pet:', err);
      showToast('An error occurred while updating pet name.');
    } finally {
      setIsLoading(false);
    }
  };
  

  // Function to fetch current location and set city, state using reverse geocoding
  const fetchCurrentLocation = async (setFieldValue) => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const addressArray = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (addressArray.length > 0) {
        const { city, region } = addressArray[0];
        const formattedLocation = `${city || 'Unknown City'}, ${region || 'Unknown State'}`;
        setFieldValue("location", formattedLocation);
        showToast(`Location set to ${formattedLocation}`);
      } else {
        setFieldValue("location", "Unknown Location");
      }
    } catch (error) {
      Alert.alert('Error', 'Could not fetch location');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving profile (simulate API call with timeout)
  const handleSaveProfile = async (values, resetForm) => {
    setIsLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
  
      // ✅ Build payload from allowed DB columns
      const [city = '', state = ''] = values.location?.split(',').map(s => s.trim()) || [];
  
      const payload = {
        email: values.email,
        username: values.username,
        password: values.password,
        city,
        state,
      };
  
      const res = await fetch(`${BASE_URL}api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const resText = await res.text();
      console.log('🔍 Server response:', resText);
  
      if (!res.ok) throw new Error(resText || 'Update failed');
  
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setOriginalProfile({ ...values, profileImage, petProfiles });
      resetForm({ values });
      setIsEditing(false);
      showToast('Profile updated');
    } catch (e) {
      console.error('Save error:', e);
      showToast('Save failed');
    } finally {
      setIsLoading(false);
    }
  };
  

  // Handle canceling editing and reverting changes
  const handleCancelEditing = (resetForm) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    resetForm({
      values: {
        name: originalProfile.name,
        username: originalProfile.username,
        email: originalProfile.email,
        password: originalProfile.password,
        location: originalProfile.location,
      }
    });
    setProfileImage(originalProfile.profileImage);
    setPetProfiles(originalProfile.petProfiles);
    setIsEditing(false);
    showToast('Edit cancelled');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // adjust offset for iOS if needed
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[styles.container, dynamicContainerStyle]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, dynamicTextStyle]}>My Pet Profile</Text>
          <Formik
            enableReinitialize
            initialValues={{
              name: originalProfile.name,
              username: originalProfile.username,
              email: originalProfile.email,
              password: originalProfile.password,
              location: originalProfile.location,
            }}
            validationSchema={ProfileSchema}
            onSubmit={(values, { resetForm }) => handleSaveProfile(values, resetForm)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, resetForm }) => (
              <>
            {/* Profile Image */}
            <TouchableOpacity
              onPress={isEditing ? pickImage : null}
              disabled={!isEditing || isLoading}
              accessibilityLabel="Profile Image"
            >
              {isLoading ? (
                <ActivityIndicator size="large" color={isDarkMode ? '#FFCCBC' : '#5D4037'} />
              ) : profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Image source={require('../assets/avatar.png')} style={styles.profileImage} />
              )}
            </TouchableOpacity>

            {/* Profile Fields */}
            <TextInput
              style={[styles.input, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
              placeholder="Your Name"
              placeholderTextColor={isDarkMode ? "#ccc" : "#5D4037"}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
              editable={isEditing}
              accessibilityLabel="Name Input"
            />
            {errors.name && touched.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <TextInput
              style={[styles.input, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
              placeholder="Your Username"
              placeholderTextColor={isDarkMode ? "#ccc" : "#5D4037"}
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
              editable={isEditing}
              accessibilityLabel="Username Input"
            />
            {errors.username && touched.username && <Text style={styles.errorText}>{errors.username}</Text>}

            <TextInput
              style={[styles.input, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
              placeholder="Your Email"
              placeholderTextColor={isDarkMode ? "#ccc" : "#5D4037"}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              editable={isEditing}
              accessibilityLabel="Email Input"
            />
            {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              style={[styles.input, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
              placeholder="Your Password"
              placeholderTextColor={isDarkMode ? "#ccc" : "#5D4037"}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
              editable={isEditing}
              accessibilityLabel="Password Input"
            />
            {errors.password && touched.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, { flex: 1, color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
                placeholder="Location (City, State)"
                placeholderTextColor={isDarkMode ? "#ccc" : "#5D4037"}
                onChangeText={handleChange('location')}
                onBlur={handleBlur('location')}
                value={values.location}
                editable={false} // Location is set via the "Use Current Location" button
                accessibilityLabel="Location Input"
              />
              {isEditing && (
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() => fetchCurrentLocation(setFieldValue)}
                  accessibilityLabel="Use Current Location Button"
                >
                  <Text style={styles.locationButtonText}>Use Current</Text>
                </TouchableOpacity>
              )}
            </View>
            {errors.location && touched.location && <Text style={styles.errorText}>{errors.location}</Text>}

            {/* Pet Profiles Section */}
            <View style={styles.petSection}>
  <Text style={[styles.sectionTitle, dynamicTextStyle]}>My Pets</Text>
  {Array.isArray(petProfiles) && petProfiles.length === 0 ?(
    <Text style={{ textAlign: 'center', color: dynamicTextStyle.color }}>
      You don't have any pets yet.
    </Text>
  ) : (
    Array.isArray(petProfiles) &&
  petProfiles.map((pet) => (
      <View key={pet.petId} style={styles.petProfile}>
        <Image
          source={ require('../assets/pet-placeholder.png')}
          style={styles.petImage}
        />
        {isEditing ? (
          <TextInput
          style={[styles.petNameInput, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
          value={petNameEdits[pet.petId] ?? pet.petName}
          onChangeText={(text) =>
            setPetNameEdits((prev) => ({ ...prev, [pet.petId]: text }))
          }
          onBlur={() => {
            const newName = petNameEdits[pet.petId];
            if (newName && newName !== pet.petName) {
              updatePetName(pet.petId, newName);
            }
          }}
        />
        
        ) : (
          <Text style={[styles.petName, dynamicTextStyle]}>
  {pet.petName} ({pet.breed || 'Unknown breed'})
</Text>

        )}
        {isEditing && (
          <TouchableOpacity
            style={styles.removePetButton}
            onPress={() => removePetProfile(pet.petId)} 

          >
            <Text style={styles.removePetButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    ))
  )}
  {/* Add Pet Button */}
  {isEditing && (
    <TouchableOpacity
      style={styles.addPetButton}
      onPress={addPetProfile}
      accessibilityLabel="Add Pet Button"
    >
      <Text style={styles.addPetButtonText}>Add Pet</Text>
    </TouchableOpacity>
  )}
  </View>

            {/* Edit / Save / Cancel Buttons */}
            {isEditing ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSubmit}
                  accessibilityLabel="Save Profile Button"
                >
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelEditing(resetForm)}
                  accessibilityLabel="Cancel Editing Button"
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsEditing(true);
                }}
                accessibilityLabel="Edit Profile Button"
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}

            {/* Back Button */}
            <TouchableOpacity
              style={[styles.backButton, { marginLeft: 10 }]}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go Back Button"
            >
              <Text style={[styles.backButtonText, dynamicTextStyle]}>Go Back</Text>
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
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FBC02D', // playful golden border
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FDD835',
    fontSize: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 8,
    alignSelf: 'flex-start',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  saveButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    flex: 1,
    marginRight: 5,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#FFB74D',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 15,
  },
  editButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 15,
  },
  backButtonText: {
    fontSize: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationButton: {
    backgroundColor: '#FFB74D',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginLeft: 10,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  petSection: {
    width: '100%',
    marginTop: 25,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#FDD835',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  petProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FBC02D',
  },
  petName: {
    fontSize: 16,
    flex: 1,
  },
  petNameInput: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#FDD835',
    fontSize: 16,
    marginRight: 10,
  },
  removePetButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  removePetButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addPetButton: {
    backgroundColor: '#66BB6A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 15,
  },
  addPetButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UserProfile;
