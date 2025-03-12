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
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const UserProfile = () => {
  const navigation = useNavigation();
  
  // Profile state variables with required fields
  const [name, setName] = useState('Name');
  const [username, setUsername] = useState('username123');
  const [email, setEmail] = useState('example@example.com');
  const [password, setPassword] = useState('password'); // Simulated; do not store real passwords this way
  const [location, setLocation] = useState('Unknown Location');
  const [profileImage, setProfileImage] = useState(null);
  const [petProfiles, setPetProfiles] = useState([
    { id: 1, name: 'Buddy', image: null },
    { id: 2, name: 'Mittens', image: null }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({
    name: 'Name',
    username: 'username123',
    email: 'example@example.com',
    password: 'password',
    location: 'Unknown Location',
    profileImage: null,
    petProfiles: [
      { id: 1, name: 'Buddy', image: null },
      { id: 2, name: 'Mittens', image: null }
    ]
  });

  // Determine system theme (dark or light)
  const colorScheme = Appearance.getColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Helper function for toast notifications
  const showToast = (message) => {
      if (Platform.OS === 'android') {
          ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
          Alert.alert('', message);
      }
  };

  // Save user profile by updating the originalProfile state
  const saveUserProfile = () => {
      setOriginalProfile({
          name,
          username,
          email,
          password,
          location,
          profileImage,
          petProfiles,
      });
      setIsEditing(false);
      showToast('Profile Updated Successfully!');
  };

  // Cancel editing and revert changes to the original profile
  const cancelEditing = () => {
      setName(originalProfile.name);
      setUsername(originalProfile.username);
      setEmail(originalProfile.email);
      setPassword(originalProfile.password);
      setLocation(originalProfile.location);
      setProfileImage(originalProfile.profileImage);
      setPetProfiles(originalProfile.petProfiles);
      setIsEditing(false);
      showToast('Edit cancelled');
  };

  // Open Image Picker for profile image
  const pickImage = async () => {
      try {
          const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permissionResult.granted) {
              showToast('Permission to access media library is required!');
              return;
          }

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
      }
  };

  // Functions for managing pet profiles
  const addPetProfile = () => {
      const newPet = { id: Date.now(), name: 'New Pet', image: null };
      setPetProfiles([...petProfiles, newPet]);
      showToast('Pet profile added');
  };

  const removePetProfile = (petId) => {
      setPetProfiles(petProfiles.filter(pet => pet.id !== petId));
      showToast('Pet profile removed');
  };

  // Dynamic styles based on dark mode
  const dynamicContainerStyle = {
      backgroundColor: isDarkMode ? '#333' : '#FFEDD5',
  };

  const dynamicTextStyle = {
      color: isDarkMode ? '#fff' : '#6D4C41',
  };

  return (
      <ScrollView contentContainerStyle={[styles.container, dynamicContainerStyle]}>
          <Text style={[styles.title, dynamicTextStyle]}>User Profile</Text>

          {/* Profile Image */}
          <TouchableOpacity onPress={isEditing ? pickImage : null} disabled={!isEditing}>
              {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                  <Image source={require('../assets/avatar.png')} style={styles.profileImage} />
              )}
          </TouchableOpacity>

          {/* Editable TextInput fields for profile info */}
          <TextInput
              style={[styles.input, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
              placeholder="Enter Your Name"
              placeholderTextColor={isDarkMode ? "#ccc" : "#6D4C41"}
              value={name}
              onChangeText={setName}
              editable={isEditing}
          />

          <TextInput
              style={[styles.input, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
              placeholder="Enter Your Username"
              placeholderTextColor={isDarkMode ? "#ccc" : "#6D4C41"}
              value={username}
              onChangeText={setUsername}
              editable={isEditing}
          />

          <TextInput
              style={[styles.input, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
              placeholder="Enter Your Email"
              placeholderTextColor={isDarkMode ? "#ccc" : "#6D4C41"}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={isEditing}
          />

          <TextInput
              style={[styles.input, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
              placeholder="Enter Your Password"
              placeholderTextColor={isDarkMode ? "#ccc" : "#6D4C41"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={isEditing}
          />

          <TextInput
              style={[styles.input, { color: dynamicTextStyle.color, borderColor: dynamicTextStyle.color }]}
              placeholder="Enter Your Location"
              placeholderTextColor={isDarkMode ? "#ccc" : "#6D4C41"}
              value={location}
              onChangeText={setLocation}
              editable={isEditing}
          />

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
                      <Text style={[styles.petName, dynamicTextStyle]}>{pet.name}</Text>
                      {isEditing && (
                          <TouchableOpacity style={styles.removePetButton} onPress={() => removePetProfile(pet.id)}>
                              <Text style={styles.removePetButtonText}>Remove</Text>
                          </TouchableOpacity>
                      )}
                  </View>
              ))}
              {isEditing && (
                  <TouchableOpacity style={styles.addPetButton} onPress={addPetProfile}>
                      <Text style={styles.addPetButtonText}>Add Pet Profile</Text>
                  </TouchableOpacity>
              )}
          </View>

          {/* Edit / Save / Cancel Buttons */}
          {isEditing ? (
              <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.saveButton} onPress={saveUserProfile}>
                      <Text style={styles.saveButtonText}>Save Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={cancelEditing}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
              </View>
          ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                  <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
          )}

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={[styles.backButtonText, dynamicTextStyle]}>Go Back</Text>
          </TouchableOpacity>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
  },
  profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: 20,
  },
  input: {
      width: '100%',
      padding: 10,
      borderRadius: 5,
      backgroundColor: 'white',
      marginBottom: 15,
      borderWidth: 1,
  },
  buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
  },
  saveButton: {
      backgroundColor: '#F4A261',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginTop: 10,
      flex: 1,
      marginRight: 5,
  },
  saveButtonText: {
      fontSize: 18,
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
  },
  cancelButton: {
      backgroundColor: '#D9534F',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      marginTop: 10,
      flex: 1,
      marginLeft: 5,
  },
  cancelButtonText: {
      fontSize: 18,
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
  },
  editButton: {
      backgroundColor: '#F4A261',
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 25,
      marginTop: 10,
  },
  editButtonText: {
      fontSize: 18,
      color: 'white',
      fontWeight: 'bold',
  },
  backButton: {
      marginTop: 10,
  },
  backButtonText: {
      fontSize: 16,
  },
  petSection: {
      width: '100%',
      marginTop: 20,
  },
  sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
  },
  petProfile: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
  },
  petImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10,
  },
  petName: {
      fontSize: 16,
      flex: 1,
  },
  removePetButton: {
      backgroundColor: '#D9534F',
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 15,
  },
  removePetButtonText: {
      color: 'white',
      fontSize: 14,
  },
  addPetButton: {
      backgroundColor: '#F4A261',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 25,
      alignSelf: 'center',
      marginTop: 10,
  },
  addPetButtonText: {
      color: 'white',
      fontSize: 16,
  },
});

export default UserProfile;
