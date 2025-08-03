import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config.js';

export default function NewDiscussion() {
  const navigation = useNavigation();
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionContent, setDiscussionContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Topics list and selected topic state
  //const topics = ["Training", "Toys", "Nutrition", "Health", "Behavior", "General"];
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const MAX_TITLE_LENGTH = 150;
  const MAX_CONTENT_LENGTH = 500;

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${BASE_URL}api/discussions/getTopics`);
        const data = await res.json();
        setTopics(data);
        setSelectedTopicId(data[0]?.id);
      } catch (err) {
        console.error("Failed to fetch topics", err);
      }
    };
  
    fetchTopics();
  }, []);

  const handlePostDiscussion =  async () => {
    if (!discussionTitle.trim() || !discussionContent.trim()) {
      Alert.alert('Missing Information', 'Please fill in both the title and content.');
      return;
    }
    
    try {
      setIsLoading(true);

      const userId = await AsyncStorage.getItem('userId');
    if (!userId) throw new Error("User not authenticated");

    const res = await fetch(`${BASE_URL}api/discussions/submitForumThread`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicId: selectedTopicId,
        title: discussionTitle.trim(),
        content: discussionContent.trim(),
        userId: parseInt(userId),
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unknown error");

    Alert.alert('Success', 'Your discussion has been posted.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);

    } catch (err) {
      console.error("Post failed:", err);
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
    
  };

  return (
    <ImageBackground 
      source={require('../assets/petBackground.jpg')}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.overlay}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Start a New Discussion</Text>

          {/* Updated Topic Selection View as a Grid of Chips */}
          <View style={styles.topicsContainer}>
            {topics.map((topic, index) => (
              <TouchableOpacity 
                key={topic.id}
                style={[
                  styles.topicChip, 
                  selectedTopicId === topic.id && styles.selectedTopicChip
                ]}
                onPress={() => setSelectedTopicId(topic.id)}
                accessibilityLabel={`Select topic ${topic.id}`}
              >
                <Text style={[
                  styles.topicChipText,
                  selectedTopicId === topic.id && styles.selectedTopicChipText
                ]}>
                  {topic.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Discussion Title"
            placeholderTextColor="#8B7E66"
            value={discussionTitle}
            onChangeText={setDiscussionTitle}
            maxLength={MAX_TITLE_LENGTH}
            accessibilityLabel="Discussion Title Input"
          />
          <Text style={styles.counter}>
            {discussionTitle.length}/{MAX_TITLE_LENGTH} characters
          </Text>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Share your thoughts..."
            placeholderTextColor="#8B7E66"
            value={discussionContent}
            onChangeText={setDiscussionContent}
            multiline
            numberOfLines={4}
            maxLength={MAX_CONTENT_LENGTH}
            accessibilityLabel="Discussion Content Input"
          />
          <Text style={styles.counter}>
            {discussionContent.length}/{MAX_CONTENT_LENGTH} characters
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.disabledButton]} 
            onPress={handlePostDiscussion}
            disabled={isLoading}
            accessibilityLabel="Post Discussion Button"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Post Discussion</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
            accessibilityLabel="Cancel Button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 20,
  },
  // New grid style for topics view
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  topicChip: {
    backgroundColor: '#FCE4EC',
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 5,
  },
  selectedTopicChip: {
    backgroundColor: '#E91E63',
  },
  topicChipText: {
    fontSize: 16,
    color: '#E91E63',
  },
  selectedTopicChipText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 5,
    borderColor: '#6D4C41',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    marginBottom: 15,
    color: '#6D4C41',
    fontSize: 12,
  },
  button: {
    backgroundColor: '#E76F51',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 15,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6D4C41',
  },
});
