import React, { useState } from 'react';
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

export default function NewDiscussion() {
  const navigation = useNavigation();
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionContent, setDiscussionContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Topics list and selected topic state
  const topics = ["Training", "Toys", "Nutrition", "Health", "Behavior", "General"];
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);

  const MAX_TITLE_LENGTH = 150;
  const MAX_CONTENT_LENGTH = 500;

  const handlePostDiscussion = () => {
    if (!discussionTitle.trim() || !discussionContent.trim()) {
      Alert.alert('Missing Information', 'Please fill in both the title and content.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate posting the discussion (replace with your API call if needed)
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Discussion Posted', 
        `Your discussion on "${selectedTopic}" has been posted successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1500);
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
                key={index}
                style={[
                  styles.topicChip, 
                  selectedTopic === topic && styles.selectedTopicChip
                ]}
                onPress={() => setSelectedTopic(topic)}
                accessibilityLabel={`Select topic ${topic}`}
              >
                <Text style={[
                  styles.topicChipText,
                  selectedTopic === topic && styles.selectedTopicChipText
                ]}>
                  {topic}
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
