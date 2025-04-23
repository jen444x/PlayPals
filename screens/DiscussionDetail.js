import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  StyleSheet, 
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

export default function DiscussionDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { discussionId } = route.params; // Assume discussionId is passed as a parameter

  const [discussion, setDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');
  const [currentUsername, setCurrentUsername] = useState('');

  // Simulated API call to fetch discussion details including replies
  useEffect(() => {
    const loadCurrentUser = async () => {
      const username = await AsyncStorage.getItem('username');
      setCurrentUsername(username);
    };

    const fetchDiscussion = async () => {
      try {
        const res = await fetch(`${BASE_URL}api/discussions/thread/${discussionId}`);
        const data = await res.json();
        setDiscussion(data);
      } catch (err) {
        console.error("Error fetching discussion:", err);
        Alert.alert("Error", "Failed to load discussion.");
      }
    };

    loadCurrentUser();
    fetchDiscussion();
  }, [discussionId]);

  const handlePostReply = async () => {
    if (!replyContent.trim()) {
      Alert.alert('Error', 'Please enter a reply.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error("User not authenticated");

      const res = await fetch(`${BASE_URL}api/discussions/thread/${discussion.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          content: replyContent.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to post reply");

      // Refresh discussion to include new reply
      const updated = await res.json();
      setReplyContent('');
      Alert.alert('Reply Posted', 'Your reply has been added.');
      // Better: re-fetch replies only
      const threadRes = await fetch(`${BASE_URL}api/discussions/thread/${discussion.id}`);
      const updatedThread = await threadRes.json();
      setDiscussion(updatedThread);
    } catch (err) {
      console.error("Reply post failed:", err);
      Alert.alert("Error", err.message);
    }

  };

  const handleEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditingReplyContent(reply.content);
  };

  const handleSaveReply = async (replyId) => {
    try {
        const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error("User not authenticated");
      
      const res = await fetch(`${BASE_URL}api/discussions/thread/reply/${replyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editingReplyContent,
          userId: parseInt(userId)
        }),
      });
    
      if (!res.ok) throw new Error("Failed to save reply");
    
      const data = await res.json();
    
      const updatedReplies = discussion.replies.map((reply) =>
        reply.id === replyId ? { ...reply, content: data.updatedReply.content } : reply
      );
      setDiscussion({ ...discussion, replies: updatedReplies });
      setEditingReplyId(null);
      setEditingReplyContent('');
    } catch (err) {
      console.error("Failed to save reply:", err);
      Alert.alert("Error", err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingReplyId(null);
    setEditingReplyContent('');
  };

  if (!discussion) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading discussion...</Text>
      </SafeAreaView>
    );
  }

  // Render the discussion post as a header for the FlatList
  const renderDiscussionHeader = () => (
    <View style={styles.discussionHeader}>
      <Text style={styles.title}>{discussion.title}</Text>
      <Text style={styles.author}>Posted by: {discussion.author}</Text>
      <Text style={styles.content}>{discussion.content}</Text>
      <Text style={styles.repliesTitle}>Replies</Text>
    </View>
  );

  const renderReplyItem = ({ item }) => {
    // Check if this reply is in edit mode (only for the current user's reply)
    if (item.author === currentUsername && editingReplyId === item.id) {
      return (
        <View style={styles.replyContainer}>
          <Text style={styles.replyAuthor}>{item.author}:</Text>
          <TextInput
            style={[styles.input, styles.editInput]}
            value={editingReplyContent}
            onChangeText={setEditingReplyContent}
            accessibilityLabel="Edit Reply Input"
          />
          <View style={styles.editButtonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveReply(item.id)}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelEditButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelEditButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.replyContainer}>
          <Text style={styles.replyAuthor}>{item.author}:</Text>
          <Text style={styles.replyContent}>{item.content}</Text>
          {item.author === currentUsername && (
            <TouchableOpacity style={styles.editButton} onPress={() => handleEditReply(item)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={require('../assets/petBackground.jpg')} style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <View style={styles.overlay}>
            <FlatList
              data={discussion.replies}
              keyExtractor={(item) => item.id}
              renderItem={renderReplyItem}
              ListHeaderComponent={renderDiscussionHeader}
              // Uncomment the following line if you want the header to remain sticky
              // stickyHeaderIndices={[0]}
              contentContainerStyle={styles.repliesList}
            />
            <View style={styles.replyInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Write your reply..."
                placeholderTextColor="#8B7E66"
                value={replyContent}
                onChangeText={setReplyContent}
                accessibilityLabel="Reply Input Field"
              />
              <TouchableOpacity 
                style={styles.replyButton} 
                onPress={handlePostReply}
                accessibilityLabel="Post Reply Button"
              >
                <Text style={styles.replyButtonText}>Post Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,250,240,0.9)',
    padding: 20,
  },
  discussionHeader: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 10,
  },
  author: {
    fontSize: 16,
    color: '#6D4C41',
    marginBottom: 10,
  },
  content: {
    fontSize: 18,
    color: '#6D4C41',
    marginBottom: 20,
  },
  repliesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginVertical: 10,
  },
  repliesList: {
    paddingBottom: 20,
  },
  replyContainer: {
    backgroundColor: '#FFF9C4',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#6D4C41',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  replyAuthor: {
    fontWeight: 'bold',
    color: '#6D4C41',
  },
  replyContent: {
    fontSize: 16,
    color: '#6D4C41',
  },
  replyInputContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderColor: '#6D4C41',
    borderWidth: 1,
    color: '#000',
  },
  replyButton: {
    backgroundColor: '#E76F51',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginLeft: 10,
  },
  replyButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  editButtonText: {
    fontSize: 14,
    color: '#E76F51',
  },
  editInput: {
    marginTop: 5,
    backgroundColor: '#FFF',
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#E76F51',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cancelEditButton: {
    backgroundColor: '#ccc',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  cancelEditButtonText: {
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6D4C41',
  },
});
