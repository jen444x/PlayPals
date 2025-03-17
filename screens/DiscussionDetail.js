import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function DiscussionDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { discussionId } = route.params; // Assume discussionId is passed as a parameter

  const [discussion, setDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Simulated API call to fetch discussion details including replies
  useEffect(() => {
    const fetchDiscussion = async () => {
      // Replace with your actual API call
      const discussionData = {
        id: discussionId,
        title: 'Discussion Title',
        content: 'This is the content of the discussion post. Share your thoughts!',
        author: 'User1',
        replies: [
          { id: 'r1', author: 'User2', content: 'Great post!' },
          { id: 'r2', author: 'User3', content: 'I agree with your thoughts.' },
        ],
      };
      setDiscussion(discussionData);
    };

    fetchDiscussion();
  }, [discussionId]);

  const handlePostReply = () => {
    if (!replyContent.trim()) {
      Alert.alert('Error', 'Please enter a reply.');
      return;
    }
    // Create a new reply object
    const newReply = {
      id: Date.now().toString(),
      author: 'CurrentUser', // Replace with the actual current user's name
      content: replyContent,
    };
    // Simulate adding the reply (update state)
    setDiscussion({
      ...discussion,
      replies: [newReply, ...discussion.replies],
    });
    setReplyContent('');
    Alert.alert('Reply Posted', 'Your reply has been added.');
  };

  if (!discussion) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading discussion...</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require('../assets/petBackground.jpg')} style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>{discussion.title}</Text>
        <Text style={styles.author}>Posted by: {discussion.author}</Text>
        <Text style={styles.content}>{discussion.content}</Text>
        <Text style={styles.repliesTitle}>Replies</Text>
        <FlatList
          data={discussion.replies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.replyContainer}>
              <Text style={styles.replyAuthor}>{item.author}:</Text>
              <Text style={styles.replyContent}>{item.content}</Text>
            </View>
          )}
        />
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Write your reply..."
            placeholderTextColor="#8B7E66"
            value={replyContent}
            onChangeText={setReplyContent}
          />
          <TouchableOpacity style={styles.replyButton} onPress={handlePostReply}>
            <Text style={styles.replyButtonText}>Post Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 20,
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
  replyContainer: {
    backgroundColor: '#F4A261',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
