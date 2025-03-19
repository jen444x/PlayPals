// ProfileScreen.js
import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  TextInput, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';
import * as Haptics from 'expo-haptics';

// Dummy data representing a user profile 
const dummyProfile = {
  username: "JaneDoe",
  avatar: require('../assets/avatar.png'), // Replace with your image asset
  bio: "Lover of all animals. Follow for daily pet vibes!",
  stats: {
    followers: "1.2M",
    following: "500",
    likes: "3.4M",
  },
  posts: [
    { id: '1', image: require('../assets/post1.jpg') },
    { id: '2', image: require('../assets/post1.jpg') },
    { id: '3', image: require('../assets/post1.jpg') },
    { id: '4', image: require('../assets/post1.jpg') },
    // Add more posts as needed
  ],
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext); // Assume ThemeContext provides an isDarkMode boolean

  // Dynamic styling based on ThemeContext (pet-themed colors)
  const dynamicContainerStyle = {
    backgroundColor: isDarkMode ? '#252526' : '#FFF3E0', // Dark brown vs. light orange cream
  };
  const dynamicTextStyle = {
    color: isDarkMode ? '#0BA385' : '#5D4037', // Light peach vs. dark brown
  };

  const numColumns = 3;
  const screenWidth = Dimensions.get('window').width;
  const imageSize = useMemo(() => screenWidth / numColumns, [screenWidth, numColumns]);

  // Simulated current logged-in user. In a real app, replace with your auth logic.
  const currentUser = "JaneDoe";
  const isCurrentUserProfile = dummyProfile.username === currentUser;

  // State management for bio and API simulation
  const [bio, setBio] = useState(dummyProfile.bio);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [loading, setLoading] = useState(false);  // Simulate loading state
  const [error, setError] = useState(null);

  // Simulated API call to fetch profile data
  useEffect(() => {
    setLoading(true);
    // Replace with your actual API call
    setTimeout(() => {
      // Simulate success: set loading to false
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveBio = () => {
    // In a real app, update the backend here.
    setIsEditingBio(false);
    // Trigger haptic feedback using Expo Haptics
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Inline memoized component for a post item
  const PostItem = React.memo(({ item, imageSize }) => {
    return (
      <TouchableOpacity 
        style={styles.postWrapper}
        onPress={() => navigation.navigate('PostFull', { image: item.image })}
        activeOpacity={0.8}
        accessibilityLabel="Post item"
        accessibilityHint="Tap to view full post"
      >
        <Image 
          source={item.image} 
          style={[styles.postImage, { width: imageSize - 2, height: imageSize - 2 }]} 
          accessibilityLabel="Post image"
        />
      </TouchableOpacity>
    );
  });

  // Memoized render function for the FlatList
  const renderPost = useCallback(
    ({ item }) => <PostItem item={item} imageSize={imageSize} />,
    [imageSize]
  );

  // Display loading or error states if needed
  if (loading) {
    return (
      <View style={[styles.centered, dynamicContainerStyle]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, dynamicContainerStyle]}>
        <Text style={dynamicTextStyle}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, dynamicContainerStyle]}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image 
          source={dummyProfile.avatar} 
          style={styles.avatar} 
          accessibilityLabel="User avatar"
        />
        <Text style={[styles.username, dynamicTextStyle]}>{dummyProfile.username}</Text>
        {isEditingBio ? (
          <>
            <TextInput
              style={[styles.bio, styles.bioEditing, dynamicTextStyle, { borderColor: dynamicTextStyle.color }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Add your bio here..."
              placeholderTextColor={dynamicTextStyle.color}
              multiline
              accessibilityLabel="Edit bio text input"
            />
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: '#4CAF50' }]} 
              onPress={handleSaveBio}
              accessibilityLabel="Save Bio Button"
              accessibilityHint="Tap to save your bio"
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.bio, dynamicTextStyle]}>
              {bio || "No bio yet. Click to add one!"}
            </Text>
            {isCurrentUserProfile && (
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: dynamicTextStyle.color }]}
                onPress={() => setIsEditingBio(true)}
                accessibilityLabel="Edit Bio Button"
                accessibilityHint="Tap to edit your bio"
              >
                <Text style={styles.editButtonText}>
                  {bio ? "Edit Bio" : "Add Bio"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, dynamicTextStyle]}>{dummyProfile.stats.followers}</Text>
            <Text style={[styles.statLabel, dynamicTextStyle]}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, dynamicTextStyle]}>{dummyProfile.stats.following}</Text>
            <Text style={[styles.statLabel, dynamicTextStyle]}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, dynamicTextStyle]}>{dummyProfile.stats.likes}</Text>
            <Text style={[styles.statLabel, dynamicTextStyle]}>Likes</Text>
          </View>
        </View>
        {/* Follow Button for non-current user or Pet Profiles Button for current user */}
        { !isCurrentUserProfile ? (
          <TouchableOpacity 
            style={[styles.followButton, { backgroundColor: '#fe2c55' }]}
            accessibilityLabel="Follow Button"
            accessibilityHint="Tap to follow this user"
          >
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.petButton, { backgroundColor: '#007AFF' }]}
            onPress={() => navigation.navigate('PetPublic')}
            accessibilityLabel="View Pet Profiles Button"
            accessibilityHint="Tap to view pet profiles"
          >
            <Text style={styles.petButtonText}>View Pet Profiles</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Posts Grid */}
      <FlatList
        data={dummyProfile.posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        numColumns={numColumns}
        contentContainerStyle={styles.postsContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    // Pet-themed extra padding and border style
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // Adding a playful border to the avatar
    borderWidth: 2,
    borderColor: '#0BA385',
  },
  username: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: 'bold',
    // Pet-themed font (custom font can be added if available)
    fontFamily: 'Arial',
  },
  bio: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bioEditing: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    width: '80%',
    textAlign: 'center',
  },
  editButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 15,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  followButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  petButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  petButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postsContainer: {
    marginTop: 5,
  },
  postWrapper: {
    flex: 1,
    margin: 1,
  },
  postImage: {
    borderRadius: 2,
    resizeMode: 'cover',
  },
});
