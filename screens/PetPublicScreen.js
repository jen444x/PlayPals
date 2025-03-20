import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ImageBackground,
  FlatList, 
  TouchableOpacity, 
  SafeAreaView,
  Modal,
  TextInput,
  Button
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Dummy data representing a list of pet profiles with an ownerId
const initialPetProfiles = [
  { id: '1', petName: "Buddy", ownerId: "1", petAvatar: require('../assets/pet-placeholder.png'), petBio: "Loyal and energetic." },
  { id: '2', petName: "Max", ownerId: "2", petAvatar: require('../assets/pet-placeholder.png'), petBio: "Curious and playful." },
  { id: '3', petName: "Bella", ownerId: "1", petAvatar: require('../assets/pet-placeholder.png'), petBio: "Small and adorable." },
  // Add more pet profiles as needed
];

// Assume currentUserId represents the logged in user
const currentUserId = "1";

export default function PetProfilesScreen() {
  const navigation = useNavigation();
  const [petProfiles, setPetProfiles] = useState(initialPetProfiles);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [editedBio, setEditedBio] = useState('');

  const openEditModal = (pet) => {
    setSelectedPet(pet);
    setEditedBio(pet.petBio);
    setModalVisible(true);
  };

  const saveBio = () => {
    // Update the petProfiles state with the new bio
    const updatedProfiles = petProfiles.map(pet => 
      pet.id === selectedPet.id ? { ...pet, petBio: editedBio } : pet
    );
    setPetProfiles(updatedProfiles);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={item.petAvatar} style={styles.petAvatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.petName}>{item.petName}</Text>
        <Text style={styles.petBio}>{item.petBio}</Text>
      </View>
      {/* Render Edit button only if the current user is the owner */}
      {item.ownerId === currentUserId && (
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/petBackground1.jpg')} // Add your background image here
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        {/* Pet themed header */}
        <View style={styles.header}>
          <Image source={require('../assets/pawIcon.png')} style={styles.pawIcon} />
          <Text style={styles.headerText}>My Pet Profiles</Text>
        </View>

        <FlatList
          data={petProfiles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />

        {/* Modal for editing pet bio */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Edit Bio for {selectedPet?.petName}</Text>
              <TextInput
                style={styles.input}
                value={editedBio}
                onChangeText={setEditedBio}
                multiline
              />
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
                <Button title="Save" onPress={saveBio} />
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 250, 240, 0.56)', // Semi-transparent overlay to soften background image
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700', // Gold background for a playful pet vibe
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E68C',
  },
  pawIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  list: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF5EE', // Seashell color for a light, pet-friendly vibe
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F5DEB3', // Wheat color border for extra pet theme
  },
  petAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#F0E68C',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  petBio: {
    fontSize: 16,
    color: '#6D4C41',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F0E68C',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D2B48C',
  },
  editButtonText: {
    fontSize: 14,
    color: '#8B4513',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0E68C',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#8B4513',
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    textAlignVertical: 'top',
    borderRadius: 5,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
