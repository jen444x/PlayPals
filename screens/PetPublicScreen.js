import React, { useState, useContext } from 'react';
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
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext } from '../ThemeContext';
import { BASE_URL } from '../config'; // adjust path if needed

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PetProfilesScreen() {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);

  const [petProfiles, setPetProfiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [editedBio, setEditedBio] = useState('');

  // Fetch pets from backend
  const fetchPets = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/pets/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pets');
      }

      const data = await response.json();
      console.log('Pets fetched:', data);
      setPetProfiles(data);

    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPets();
    }, [])
  );

  const openEditModal = (pet) => {
    setSelectedPet(pet);
    setEditedBio(pet.bio || ''); // Fallback if bio is missing
    setModalVisible(true);
  };

  const saveBio = () => {
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const updatedProfiles = petProfiles.map(pet => 
      pet.id === selectedPet.id ? { ...pet, bio: editedBio } : pet
    );
    setPetProfiles(updatedProfiles);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.itemContainer,
      {
        backgroundColor: isDarkMode ? '#333' : '#FFF5EE',
        borderColor: isDarkMode ? '#555' : '#F5DEB3',
      }
    ]}>
      <Image 
        source={item.petAvatar ? { uri: item.petAvatar } : require('../assets/pet-placeholder.png')} 
        style={styles.petAvatar} 
      />
      <View style={styles.infoContainer}>
        <Text style={[
          styles.petName,
          { color: isDarkMode ? '#FFDEAD' : '#8B4513' }
        ]}>
          {item.petName}
        </Text>
        <Text style={[
          styles.petBio,
          { color: isDarkMode ? '#D3D3D3' : '#6D4C41' }
        ]}>
          {item.breed}
        </Text>
      </View>
      {item.ownerId && (
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
      source={require('../assets/petBackground1.jpg')}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={[
        styles.container,
        { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,250,240,0.56)' }
      ]}>
        <View style={[
          styles.header,
          { backgroundColor: isDarkMode ? '#333' : '#FFD700', borderBottomColor: isDarkMode ? '#555' : '#F0E68C' }
        ]}>
          <Image source={require('../assets/pawIcon.png')} style={styles.pawIcon} />
          <Text style={[
            styles.headerText,
            { color: isDarkMode ? '#FFDEAD' : '#8B4513' }
          ]}>
            {isDarkMode ? "🌙 My Pet Profiles" : "☀️ My Pet Profiles"}
          </Text>
        </View>

        <FlatList
          data={petProfiles}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: isDarkMode ? '#fff' : '#000' }}>
              No pets found. 🐾
            </Text>
          }
        />

        {/* Modal Bottom Sheet */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.bottomSheetOverlay}>
              <TouchableOpacity
                style={{ flex: 1 }}
              />
              <View style={[
                styles.bottomSheetContainer,
                { backgroundColor: isDarkMode ? '#222' : '#FFF', borderColor: isDarkMode ? '#555' : '#F0E68C' }
              ]}>
                <View style={styles.bottomSheetHandle} />
                <Text style={[
                  styles.modalTitle,
                  { color: isDarkMode ? '#FFDEAD' : '#8B4513' }
                ]}>
                  Edit Bio for {selectedPet?.name}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: isDarkMode ? '#333' : '#FFF', color: isDarkMode ? '#FFF' : '#000' }
                  ]}
                  value={editedBio}
                  onChangeText={setEditedBio}
                  multiline
                />
                <View style={styles.modalButtons}>
                  <Button title="Cancel" onPress={() => setModalVisible(false)} />
                  <Button 
                    title="Save" 
                    onPress={saveBio} 
                    disabled={editedBio.trim() === '' || editedBio === selectedPet?.bio}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
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
  },
  list: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
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
  },
  petBio: {
    fontSize: 16,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F0E68C',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#D2B48C',
  },
  editButtonText: {
    fontSize: 14,
    color: '#8B4513',
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },
  bottomSheetHandle: {
    width: 60,
    height: 6,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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
    marginTop: 10,
  },
});
