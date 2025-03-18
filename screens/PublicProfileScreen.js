import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Dummy data representing a public profile
const dummyProfile = {
  username: "JaneDoe",
  avatar: require('../assets/avatar.png'), // Ensure this image exists in your assets folder
  bio: "Lover of all animals and pet mom to a few adorable fur babies.",
  petProfile: {
    petName: "Buddy",
    petAvatar: require('../assets/pet.png'), // Ensure this image exists in your assets folder
    petBio: "My loyal companion who loves walks and treats!",
  },
  posts: [
    { id: '1', image: require('../assets/post1.jpg'), caption: "At the park with Buddy!" },
    { id: '2', image: require('../assets/post1.jpg'), caption: "Sunday morning cuddles." },
    { id: '3', image: require('../assets/post1.jpg'), caption: "Playtime in the backyard." },
  ],
};

export default function PublicProfileScreen() {
  const navigation = useNavigation();
  const [bio, setBio] = useState(dummyProfile.bio);
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Simulated logged-in user.
  // Replace this with your auth/user context logic.
  const currentUser = "JaneDoe";
  const isCurrentUserProfile = dummyProfile.username === currentUser;

  const handleSaveBio = () => {
    // Add your API call here to persist the updated bio if needed.
    setIsEditingBio(false);
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Image source={item.image} style={styles.postImage} />
      <Text style={styles.postCaption}>{item.caption}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Basic Profile Section */}
        <View style={styles.profileHeader}>
          <Image source={dummyProfile.avatar} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{dummyProfile.username}</Text>
            {isEditingBio ? (
              <>
                <TextInput
                  style={[styles.bio, styles.bioEditing]}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveBio}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.bio}>{bio}</Text>
                {isCurrentUserProfile && (
                  <TouchableOpacity 
                    style={styles.editButton} 
                    onPress={() => setIsEditingBio(true)}
                    accessibilityLabel="Edit Bio Button"
                  >
                    <Text style={styles.editButtonText}>Edit Bio</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
            <TouchableOpacity 
              style={styles.messageButton} 
              onPress={() => navigation.navigate('Chat', { chatUser: dummyProfile.username })}
              accessibilityLabel="Send Message Button"
            >
              <Text style={styles.messageButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pet Profile Section */}
        <View style={styles.petProfile}>
          <Text style={styles.sectionTitle}>Pet Profile</Text>
          <View style={styles.petInfo}>
            <Image source={dummyProfile.petProfile.petAvatar} style={styles.petAvatar} />
            <View style={styles.petDetails}>
              <Text style={styles.petName}>{dummyProfile.petProfile.petName}</Text>
              <Text style={styles.petBio}>{dummyProfile.petProfile.petBio}</Text>
            </View>
          </View>
        </View>

        {/* Posts Feed Section */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>
          <FlatList
            data={dummyProfile.posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.postsList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8DC', // Cornsilk background for a warm feel
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FAF3E0', // Soft off-white tone
    borderBottomWidth: 1,
    borderBottomColor: '#D2691E',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513', // SaddleBrown for text
  },
  bio: {
    fontSize: 16,
    color: '#6D4C41',
    marginVertical: 8,
  },
  bioEditing: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
  },
  editButton: {
    backgroundColor: '#E76F51',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  messageButton: {
    backgroundColor: '#E76F51',
    padding: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  messageButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  petProfile: {
    padding: 16,
    backgroundColor: '#FFF8DC',
    borderBottomWidth: 1,
    borderBottomColor: '#D2691E',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  petDetails: {
    marginLeft: 16,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  petBio: {
    fontSize: 14,
    color: '#6D4C41',
  },
  postsSection: {
    padding: 16,
    backgroundColor: '#FAF3E0',
  },
  postsList: {
    paddingVertical: 8,
  },
  postContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  postImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  postCaption: {
    marginTop: 8,
    fontSize: 14,
    color: '#6D4C41',
  },
});
