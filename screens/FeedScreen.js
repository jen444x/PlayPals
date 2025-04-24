import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Image, 
  Text, 
  Dimensions, 
  TouchableOpacity 
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config.js';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const dummyFeedData = [
  {
    id: '1',
    type: 'image',
    uri: require('../assets/post1.jpg'), // Replace with your local image asset
    caption: 'Look at my adorable pup playing in the park!',
    timestamp: '2 hours ago',
    username: 'JohnDoe',
  },
  {
    id: '2',
    type: 'video',
    uri: require('../assets/myVideo.mp4'),
    caption: 'Enjoying a sunny day at the beach!',
    timestamp: '3 hours ago',
    username: 'JaneSmith',
  },
  // Add more posts as needed.
];

export default function FeedScreen() {
  console.log("BAse URL" + BASE_URL)
  const navigation = useNavigation();
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const fetchFeed = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${BASE_URL}api/posts/getPosts/${userId}`);
      const data = await response.json();
      setFeedData(data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // Use onViewableItemsChanged to update the active index as the user scrolls
  const onViewRef = useRef((viewableItems) => {
    if (viewableItems.viewableItems.length > 0) {
      setActiveIndex(viewableItems.viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  const renderItem = ({ item, index }) => (
    <View style={[styles.card, { height: screenHeight }]}>
      {item.type === 'image' && (
        <Image 
          source={{ uri: `${BASE_URL}${item.uri}` }} 
          style={styles.media}
          resizeMode="cover"
        />
      )}
      {item.type === 'video' && (
        <Video 
          source={typeof item.uri === 'number' ? item.uri : { uri: item.uri }}
          style={styles.media}
          useNativeControls
          resizeMode="cover"
          isLooping
          // Only play the video if this item is currently visible
          shouldPlay={activeIndex === index}
        />
      )}
      <View style={styles.postDetails}>
        {/* Clickable username navigates to PublicProfile */}
        <TouchableOpacity onPress={() => navigation.navigate('PublicProfile', { username: item.username })}>
          <Text style={styles.username}>{item.username}</Text>
        </TouchableOpacity>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        <TouchableOpacity style={styles.likeButton}>
          <Text style={styles.likeButtonText}>❤️ Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList 
        data={feedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        snapToInterval={screenHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1', // Soft cream background
  },
  card: {
    width: screenWidth,
    backgroundColor: '#FFFDE7',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: screenHeight * 0.6, // Allocate 60% of screen height to media
  },
  postDetails: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF', // Blue color for links
    marginBottom: 5,
  },
  caption: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '600',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#7D7D7D',
  },
  likeButton: {
    marginTop: 10,
    backgroundColor: '#FFB74D',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  likeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
