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

export default function DiscussionDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { discussionId } = route.params; // Assume discussionId is passed as a parameter

  const [discussion, setDiscussion] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyContent, setEditingReplyContent] = useState('');

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

  const handleEditReply = (reply) => {
    setEditingReplyId(reply.id);
    setEditingReplyContent(reply.content);
  };

  const handleSaveReply = (replyId) => {
    const updatedReplies = discussion.replies.map((reply) => {
      if (reply.id === replyId) {
        return { ...reply, content: editingReplyContent };
      }
      return reply;
    });
    setDiscussion({ ...discussion, replies: updatedReplies });
    setEditingReplyId(null);
    setEditingReplyContent('');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={require('../assets/petBackground.jpg')} style={styles.background}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <View style={styles.overlay}>
            <Text style={styles.title}>{discussion.title}</Text>
            <Text style={styles.author}>Posted by: {discussion.author}</Text>
            <Text style={styles.content}>{discussion.content}</Text>
            <Text style={styles.repliesTitle}>Replies</Text>
            <FlatList
              data={discussion.replies}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                // Check if this reply is in edit mode (only for the current user's reply)
                if (item.author === "CurrentUser" && editingReplyId === item.id) {
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
                      {item.author === "CurrentUser" && (
                        <TouchableOpacity style={styles.editButton} onPress={() => handleEditReply(item)}>
                          <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }
              }}
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
