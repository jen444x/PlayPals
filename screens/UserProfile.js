import React, { useState } from 'react';
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
  Appearance,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Formik } from 'formik';
import * as Yup from 'yup';

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

  // Original profile holds the saved state.
  const [originalProfile, setOriginalProfile] = useState({
    name: 'Fluffy Friend',
    username: 'petlover123',
    email: 'fluffy@example.com',
    password: 'password', // NOTE: Do not store real passwords like this in production!
    location: 'Unknown Location',
    profileImage: null,
    petProfiles: [
      { id: 1, name: 'Buddy', image: null },
      { id: 2, name: 'Mittens', image: null },
    ],
  });

  // Local state for profile image and pet profiles (managed outside of Formik)
  const [profileImage, setProfileImage] = useState(originalProfile.profileImage);
  const [petProfiles, setPetProfiles] = useState(originalProfile.petProfiles);

  // Editing and loading state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic styling based on system theme (pet-themed colors)
  const colorScheme = Appearance.getColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const dynamicContainerStyle = {
    backgroundColor: isDarkMode ? '#4E342E' : '#FFF3E0', // Dark brown vs. light orange cream
  };
  const dynamicTextStyle = {
    color: isDarkMode ? '#FFCCBC' : '#5D4037', // Light peach vs. dark brown
  };

  // Helper for toast notifications
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('', message);
    }
  };

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
  const addPetProfile = () => {
    const newPet = { id: Date.now(), name: 'New Pet', image: null };
    setPetProfiles([...petProfiles, newPet]);
    showToast('Pet profile added');
  };

  const removePetProfile = (petId) => {
    setPetProfiles(petProfiles.filter(pet => pet.id !== petId));
    showToast('Pet profile removed');
  };

  const updatePetName = (petId, newName) => {
    setPetProfiles(petProfiles.map(pet => pet.id === petId ? { ...pet, name: newName } : pet));
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
  const handleSaveProfile = (values, resetForm) => {
    setIsLoading(true);
    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setOriginalProfile({
        ...values,
        profileImage,
        petProfiles,
      });
      resetForm({ values });
      setIsEditing(false);
      setIsLoading(false);
      showToast('Profile Updated Successfully!');
    }, 1500);
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
    <ScrollView contentContainerStyle={[styles.container, dynamicContainerStyle]}>
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
              {petProfiles.map((pet) => (
                <View key={pet.id} style={styles.petProfile}>
                  {pet.image ? (
                    <Image source={{ uri: pet.image }} style={styles.petImage} />
                  ) : (
                    <Image source={require('../assets/pet-placeholder.png')} style={styles.petImage} />
                  )}
                  {isEditing ? (
                    <TextInput
                      style={[styles.petNameInput, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
                      value={pet.name}
                      onChangeText={(text) => updatePetName(pet.id, text)}
                      accessibilityLabel={`Pet name input for ${pet.name}`}
                    />
                  ) : (
                    <Text style={[styles.petName, dynamicTextStyle]}>{pet.name}</Text>
                  )}
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.removePetButton}
                      onPress={() => removePetProfile(pet.id)}
                      accessibilityLabel={`Remove pet profile for ${pet.name}`}
                    >
                      <Text style={styles.removePetButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {isEditing && (
                <TouchableOpacity
                  style={styles.addPetButton}
                  onPress={addPetProfile}
                  accessibilityLabel="Add pet profile button"
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
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go Back Button"
            >
              <Text style={[styles.backButtonText, dynamicTextStyle]}>Go Back</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </ScrollView>
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
