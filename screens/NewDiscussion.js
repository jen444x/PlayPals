import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function NewDiscussion() {
  const navigation = useNavigation();
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [discussionContent, setDiscussionContent] = useState('');

  const handlePostDiscussion = () => {
    if (!discussionTitle.trim() || !discussionContent.trim()) {
      Alert.alert('Missing Information', 'Please fill in both the title and content.');
      return;
    }
    
    // Simulate posting the discussion (replace with your API call if needed)
    Alert.alert('Discussion Posted', 'Your discussion has been posted successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <ImageBackground 
      source={require('../assets/petBackground.jpg')}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Start a New Discussion</Text>
        <TextInput
          style={styles.input}
          placeholder="Discussion Title"
          placeholderTextColor="#8B7E66"
          value={discussionTitle}
          onChangeText={setDiscussionTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Share your thoughts..."
          placeholderTextColor="#8B7E66"
          value={discussionContent}
          onChangeText={setDiscussionContent}
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity style={styles.button} onPress={handlePostDiscussion}>
          <Text style={styles.buttonText}>Post Discussion</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 15,
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
  button: {
    backgroundColor: '#E76F51',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
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
