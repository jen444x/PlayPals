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
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';
import * as Haptics from 'expo-haptics';
import { BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const route = useRoute();
  const { userId } = route.params;

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
  //const currentUser = "JaneDoe";

  // State management for bio and API simulation
  const [bio, setBio] = useState(profile?.bio);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [loading, setLoading] = useState(false);  // Simulate loading state
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);

  const isCurrentUserProfile = profile?.username === currentUsername;

  // Simulated API call to fetch profile data
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        const username = await AsyncStorage.getItem('username');
        setCurrentUserId(Number(id));
        setCurrentUsername(username);
      } catch (err) {
        console.error("Failed to get current user", err);
      }
    };

    getCurrentUser();
  }, [])

  useEffect(() => {
    if (!userId || currentUserId === null) return;

    const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}api/profile/${userId}?viewerId=${currentUserId}`)
      if (!res.ok) {
        throw new Error("User not found");
      }
      const data = await res.json();
      setProfile(data);
      setBio(data.bio || "");
      setIsFollowing(data.isFollowing || false);
    } catch (err) {
      setError("Failed to load user profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
    }
    fetchProfile();
  }, [userId, currentUserId]);

  const handleSaveBio = async () => {
    // In a real app, update the backend here.
    setIsEditingBio(false);
    if (!currentUserId) return;

  try {
    const res = await fetch(`${BASE_URL}api/profile/updateBio/${currentUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bio }),
    });

    const data = await res.json();
    
    if (res.ok) {
      console.log('Bio updated successfully');
      setProfile((prev) => ({ ...prev, bio })); // Update local profile bio immediately
      setIsEditingBio(false); // Exit edit mode
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      console.warn('Failed to update bio:', data?.error);
    }
  } catch (error) {
    console.error('Error updating bio:', error);
  }
    // Trigger haptic feedback using Expo Haptics
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStartChat = async () => {
    if (!currentUserId || !profile?.id) return;

    try {
      const res = await fetch(`${BASE_URL}api/chats/spawnChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1Id: currentUserId,
          user2Id: profile?.id
        })
      });
  
      const data = await res.json();
  
      if (data.chatId) {
        navigation.navigate("Chat", {
          chatUser: profile?.username,
          currentUser: currentUsername,
          chatId: data.chatId,
        });
      }
    } catch (err) {
      console.error("Chat creation failed:", err);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || !profile?.id) return;

    try {
      const url = isFollowing
        ? `${BASE_URL}api/users/unfollowUser`
        : `${BASE_URL}api/users/followUser`;

      const res = await fetch(`${url}?viewerId=${currentUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          followerId: currentUserId,
          followedId: profile.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log(isFollowing ? "Unfollow successful!" : "Follow successful!");
        setIsFollowing(!isFollowing);
      } else {
        console.warn('Failed to follow:', data?.error)
      }
    } catch (err) {
      console.error("Follow requst failed:", err)
    }
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
          source={{ uri: `${BASE_URL}${item.image}` }}
          style={[styles.postImage, { width: imageSize - 2, height: imageSize - 2 }]} 
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
          source={{ uri: `${BASE_URL}${profile?.avatar}` }}
          style={styles.avatar}
          resizeMode="cover"
          accessibilityLabel="User avatar"
        />
        {profile && (
          <Text style={[styles.username, dynamicTextStyle]}>
            {profile?.username}
          </Text>
        )}
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
            <Text style={[styles.statValue, dynamicTextStyle]}>{profile?.stats?.followers}</Text>
            <Text style={[styles.statLabel, dynamicTextStyle]}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, dynamicTextStyle]}>{profile?.stats?.following}</Text>
            <Text style={[styles.statLabel, dynamicTextStyle]}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, dynamicTextStyle]}>{profile?.stats?.likes}</Text>
            <Text style={[styles.statLabel, dynamicTextStyle]}>Likes</Text>
          </View>
        </View>
        {/* Action Buttons */}
        { !isCurrentUserProfile ? (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.followButton, { backgroundColor: isFollowing ? '#4CAF50':'#fe2c55' }]}
              onPress={handleFollow}
              accessibilityLabel="Follow Button"
              accessibilityHint="Tap to follow this user"
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageButton, { backgroundColor: '#2196F3' }]}
              onPress={handleStartChat}
              accessibilityLabel="Send Message Button"
              accessibilityHint="Tap to send a text message"
            >
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.petButton, { backgroundColor: '#007AFF' }]}
              onPress={() => navigation.navigate('PetPublic')}
              accessibilityLabel="View Pet Profiles Button"
              accessibilityHint="Tap to view pet profiles"
            >
              <Text style={styles.petButtonText}>View Pet Profiles</Text>
            </TouchableOpacity>
          </View>
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
        data={profile?.posts}
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
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginRight: 10,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageButton: {
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginRight: 10,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  petButton: {
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
