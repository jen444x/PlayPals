import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
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
import { BASE_URL } from '../config.js';
import exitIcon from '../assets/reject.png';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ThemeContext } from '../ThemeContext'; // Adjust path if needed

dayjs.extend(relativeTime);

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function FeedScreen() {
  const navigation = useNavigation();
  const { isDarkMode } = useContext(ThemeContext);
  const styles = createStyles(isDarkMode);

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
      const likedPostIds = data.filter(post => post.likedByUser).map(post => post.id.toString());
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
    fetchFeed();
    AsyncStorage.getItem('username').then(setUsername);
  }, []);

  const likePost = async (postId) => {
    const postIdStr = postId.toString();
    setDisabledLikes(prev => new Set(prev).add(postIdStr));

    setFeedData(prev =>
      prev.map(post => {
        if (post.id.toString() === postIdStr) {
          const isLiked = !post.likedByUser;
          const newLikeCount = isLiked ? Number(post.likeCount) + 1 : Number(post.likeCount) - 1;
          return { ...post, likedByUser: isLiked, likeCount: newLikeCount };
        }
        return post;
      })
    );

    try {
      const userId = await AsyncStorage.getItem('userId');
      await fetch(`${BASE_URL}/api/posts/likePost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId }),
      });
    } catch (error) {
      console.error('Error toggling like:', error);
    }

    setTimeout(() => {
      setDisabledLikes(prev => {
        const updated = new Set(prev);
        updated.delete(postIdStr);
        return updated;
      });
    }, 3000);
  };

  const formatCount = (count, singular) => {
    if (count >= 1_000_000_000) return `${(count / 1e9).toFixed(1).replace('.0', '')}B ${singular}s`;
    if (count >= 1_000_000) return `${(count / 1e6).toFixed(1).replace('.0', '')}M ${singular}s`;
    if (count >= 1000) return `${(count / 1e3).toFixed(1).replace('.0', '')}k ${singular}s`;
    return `${count} ${count === 1 ? singular : singular + 's'}`;
  };

  const formatTimestamp = (timestamp) => dayjs(timestamp).fromNow();

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  const renderItem = ({ item, index }) => (
    <View style={[styles.card, { height: screenHeight }]}>
      {item.type === 'image' && (
        <Image source={{ uri: `${BASE_URL}${item.uri}` }} style={styles.media} resizeMode="cover" />
      )}
      {item.type === 'video' && (
        <Video
          source={typeof item.uri === 'number' ? item.uri : { uri: item.uri }}
          style={styles.media}
          useNativeControls
          resizeMode="cover"
          isLooping
          shouldPlay={activeIndex === index}
        />
      )}
      <View style={styles.postDetails}>
        <TouchableOpacity onPress={() => navigation.navigate('PublicProfile', { userId: item.userId })}>
          <Text style={styles.username}>{item.username}</Text>
        </TouchableOpacity>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.likeButton, item.likedByUser && { backgroundColor: '#E91E63' }]}
            onPress={() => likePost(item.id)}
            disabled={disabledLikes.has(item.id.toString())}
          >
            <Text style={styles.likeButtonText}>
              {item.likedByUser ? '💔 Unlike' : '❤️ Like'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{formatCount(item.likeCount, 'like')}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.commentButton} onPress={() => openComments(item.id)}>
            <Text style={styles.commentButtonText}>💬 Comment</Text>
          </TouchableOpacity>
          <Text style={styles.countText}>{formatCount(item.commentCount, 'comment')}</Text>
        </View>
      </View>
    </View>
  );

  const openComments = async (postId) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
    try {
      const response = await fetch(`${BASE_URL}api/posts/getComments/${postId}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      const userId = await AsyncStorage.getItem('userId');
      const username = await AsyncStorage.getItem('username');
      const response = await fetch(`${BASE_URL}api/posts/addComment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: selectedPostId, userId, comment: newComment }),
      });

      const data = await response.json();
      if (response.ok) {
        const newEntry = {
          id: data.id,
          username: username || 'You',
          comment: data.comment,
          createdAt: new Date().toISOString(),
        };
        setComments(prev => [newEntry, ...prev]);
        setNewComment('');
        setFeedData(prev =>
          prev.map(post =>
            post.id === selectedPostId
              ? { ...post, commentCount: Number(post.commentCount) + 1 }
              : post
          )
        );
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

      if (response.ok) {
        setComments(prev => prev.filter((_, i) => i !== index));
        setFeedData(prev =>
          prev.map(post =>
            post.id === selectedPostId
              ? { ...post, commentCount: Math.max(0, Number(post.commentCount) - 1) }
              : post
          )
        );
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
        { text: 'Delete', style: 'destructive', onPress: () => deleteComment(item, index) },
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
        keyExtractor={(item) => item.id.toString()}
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
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalContainer}>
            <View style={styles.topBar}>
              <Text style={{ width: 40 }} />
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={closeComments} style={styles.closeButtonContainer}>
                <Image source={exitIcon} style={styles.exitIcon} />
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
                    {item.createdAt && <Text style={styles.commentTimestamp}>{dayjs(item.createdAt).fromNow()}</Text>}
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

const createStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#121212' : '#FFF8E1',// Soft cream background
  },
  card: {
    width: screenWidth,
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFDE7',
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: screenHeight * 0.6, // Allocate 60% of screen height to media
  },
  postDetails: {
    padding: 15,
    backgroundColor: isDarkMode ? '#1E1E1E' : 'rgba(255, 255, 255, 0.9)',
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: isDarkMode ? '#90CAF9' : '#007AFF',
    marginBottom: 5,
  },
  caption: {
    fontSize: 16,
    color: isDarkMode ? '#E0E0E0' : '#424242',
    fontWeight: '600',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: isDarkMode ? '#B0B0B0' : '#7D7D7D',
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
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
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
    color: isDarkMode ? '#FFF' : '#000',
  },
  commentText: {
    fontSize: 14,
    color: isDarkMode ? '#CCC' : '#333',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderColor: isDarkMode ? '#555' : '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: isDarkMode ? '#2C2C2C' : '#f9f9f9',
    color: isDarkMode ? '#FFF' : '#000',
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
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? '#FFF' : '#333',
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
    tintColor: isDarkMode ? '#FFF' : '#333',
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
    color: isDarkMode ? '#999' : '#999',
  },

});