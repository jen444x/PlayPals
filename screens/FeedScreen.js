import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Image, 
  Text, 
  Dimensions, 
  TouchableOpacity,
  Modal, 
  TextInput, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config.js'; // Adjust path as needed
import exitIcon from '../assets/reject.png';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const dummyFeedData = [
  {
    id: '1',
    type: 'image',
    uri: require('../assets/post1.jpg'), // Replace with your local image asset
    caption: 'Look at my adorable pup playing in the park!',
    timestamp: '2 hours ago',
    username: 'JohnDoe',
    likeCount: 1420,
    commentCount: 76,
  },
  {
    id: '2',
    type: 'video',
    uri: require('../assets/myVideo.mp4'),
    caption: 'Enjoying a sunny day at the beach!',
    timestamp: '3 hours ago',
    username: 'JaneSmith',
    likeCount: 1,
    commentCount: 1,
  },
  // Add more posts as needed.
];

export default function FeedScreen() {
  console.log("BAse URL" + BASE_URL)
  const navigation = useNavigation();
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [disabledLikes, setDisabledLikes] = useState(new Set());
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [currentUsername, setUsername] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`${BASE_URL}api/posts/getPosts/${userId}`);
      const data = await response.json();
      setFeedData(data);

      const likedPostIds = data
      .filter(post => post.likedByUser)
      .map(post => post.id.toString());

      setLikedPosts(new Set(likedPostIds));
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed(); 
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchUsername = async () => {
      const savedUsername = await AsyncStorage.getItem('username');
      if (savedUsername) {
        setUsername(savedUsername);
      }
    };
  
    fetchUsername();
  }, []);

  const likePost = async (postId) => {
    const postIdStr = postId.toString();

    setDisabledLikes((prev) => new Set(prev).add(postIdStr));

    setFeedData((prevFeed) =>
      prevFeed.map((post) => {
        if (post.id.toString() === postIdStr) {
          const isLiked = !post.likedByUser;
          const newLikeCount = isLiked ? Number(post.likeCount) + 1 : Number(post.likeCount) - 1;
          return {
            ...post,
            likedByUser: isLiked,
            likeCount: Number(newLikeCount),
          };
        }
        return post;
      })
    );

    try {
      const userId = await AsyncStorage.getItem('userId');
      await fetch(`${BASE_URL}/api/posts/likePost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, userId }),
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }

    setTimeout(() => {
      setDisabledLikes((prev) => {
        const updated = new Set(prev);
        updated.delete(postIdStr);
        return updated;
      });
    }, 3000);
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const formatCount = (count, singularWord) => {
    let formattedCount = Number(count);
  
    if (count >= 1_000_000_000) {
      formattedCount = (count / 1_000_000_000).toFixed(1).replace('.0', '') + 'B';
    } else if (count >= 1_000_000) {
      formattedCount = (count / 1_000_000).toFixed(1).replace('.0', '') + 'M';
    } else if (count >= 1000) {
      formattedCount = (count / 1000).toFixed(1).replace('.0', '') + 'k';
    }
  
    return `${formattedCount} ${formattedCount === 1 ? singularWord : singularWord + 's'}`;
  };

  const formatTimestamp = (timestamp) => {
    return dayjs(timestamp).fromNow();
  };

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
        <TouchableOpacity onPress={() => navigation.navigate('PublicProfile', { userId: item.userId })}>
          <Text style={styles.username}>{item.username}</Text>
        </TouchableOpacity>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[
            styles.likeButton,
            item.likedByUser && { backgroundColor: '#E91E63' },
          ]}
          onPress={() => likePost(item.id)}
          disabled={disabledLikes.has(item.id.toString())}
        >
          <Text style={styles.likeButtonText}>
            {item.likedByUser ? '💔 Unlike' : '❤️ Like'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.countText}>
          {formatCount(item.likeCount, 'like')}
        </Text>
        </View>

        <View style={styles.buttonRow}>
        <TouchableOpacity 
        style={styles.commentButton}
        onPress={() => openComments(item.id)}
        >
        <Text style={styles.commentButtonText}>💬 Comment</Text>
        </TouchableOpacity>  
        <Text style={styles.countText}>
          {formatCount(item.commentCount, 'comment')}
        </Text>
        </View>
      </View>
    </View>
  );

  const openComments = async (postId) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
    // Dummy comments
    try {
      const response = await fetch(`${BASE_URL}api/posts/getComments/${postId}`);
      const data = await response.json();
      //console.log('Fetched comments:', data);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };
  
  const postComment = async () => {
    if (newComment.trim() === '') return;
  
    try {
      const userId = await AsyncStorage.getItem('userId');
      const username = await AsyncStorage.getItem('username');
      const response = await fetch(`${BASE_URL}api/posts/addComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: selectedPostId,
          userId,
          comment: newComment,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const formattedComment = {
          id: data.id,
          username: username || "You",
          comment: data.comment,
          createdAt: new Date().toISOString(),
        };

        setComments((prev) => [formattedComment, ...prev]);
        setNewComment('');
        
        setFeedData((prevFeed) =>
          prevFeed.map((post) => {
            if (post.id === selectedPostId) {
              return {
                ...post,
                commentCount: Number(post.commentCount) + 1,
              };
            }
            return post;
          })
        );

      } else {
        console.warn('Failed to post comment:', data?.error);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const deleteComment = async (item, index) => {
    try {
      const response = await fetch(`${BASE_URL}api/posts/deleteComment/${item.id}`, {
        method: 'DELETE',
      });
      
      console.log('Trying to delete comment:', item);

      if (response.ok) {
        setComments((prevComments) => prevComments.filter((_, i) => i !== index));
        setFeedData((prevFeed) =>
          prevFeed.map((post) => {
            if (post.id === selectedPostId) {
              return {
                ...post,
                commentCount: Math.max(0, Number(post.commentCount) - 1),
              };
            }
            return post;
          })
        );
      } else {
        console.warn('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleDeleteComment = (item, index) => {
    if (item.username !== currentUsername) return; 
    
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteComment(item, index)
        },
      ]
    );
  };
  
  const closeComments = () => {
    setCommentModalVisible(false);
    setSelectedPostId(null);
    setComments([]);
  };

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
        refreshing={refreshing}  
        onRefresh={onRefresh}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={closeComments}
      >
        <KeyboardAvoidingView
          style={styles.modalBackground}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0} // adjust this if needed
        >
          <View style={styles.modalContainer}>
            <View style={styles.topBar}>
              <Text style={{ width: 40 }}> </Text> 
              <Text style={styles.modalTitle}>Comments</Text>            
              <TouchableOpacity onPress={closeComments} style={styles.closeButtonContainer}>
                <Image 
                  source={exitIcon} 
                  style={styles.exitIcon} 
                />
              </TouchableOpacity>
            </View>

            <FlatList 
              data={comments}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
              <TouchableOpacity 
                onLongPress={() => handleDeleteComment(item, index)} 
                disabled={item.username !== currentUsername}
              >
              <View style={styles.commentItem}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <TouchableOpacity
                    onPress={() => {
                      closeComments();
                      navigation.navigate('PublicProfile', { userId: item.userId });
                    }}
                  >
                    <Text style={styles.commentUsername}>{item.username}</Text>
                  </TouchableOpacity>
                  <Text style={styles.commentText}>: {item.comment}</Text>
                </View>

                {item.createdAt && (
                  <Text style={styles.commentTimestamp}>
                    {dayjs(item.createdAt).fromNow()}
                  </Text>
                )}
              </View>
              </TouchableOpacity>
              )}
            />
            
            <View style={styles.commentInputContainer}>
              <TextInput 
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#999"
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity onPress={postComment} style={styles.postCommentButton}>
                <Text style={styles.postCommentButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    //marginTop: 10,
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
  commentButton: {
    //marginTop: 10,
    backgroundColor: '#64B5F6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  commentButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '70%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  commentItem: {
    marginBottom: 10,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  postCommentButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  postCommentButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitIcon: {
    width: 20,
    height: 20,
    tintColor: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  countText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  commentTimestamp: {
    fontSize: 11,
    color: '#999',
  },

});