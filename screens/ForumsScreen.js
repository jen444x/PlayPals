import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

export default function ForumsScreen({ navigation }) {
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    // Simulated API call to fetch discussions
    const fetchDiscussions = async () => {
      // Replace this with your actual API call to fetch discussions
      const fetchedDiscussions = [
        {
          id: 'd1',
          title: 'How do I train my puppy?',
          author: 'Alice',
          content: 'I need tips on training my new puppy. Any suggestions on effective methods?',
          replyCount: 2,
          previewReply: 'Try using positive reinforcement techniques…',
        },
        {
          id: 'd2',
          title: 'Best interactive pet toys?',
          author: 'Bob',
          content: 'Looking for recommendations for toys that can keep my cat engaged...',
          replyCount: 1,
          previewReply: 'I recently tried a puzzle toy and my cat loves it!',
        },
      ];
      setDiscussions(fetchedDiscussions);
    };

    fetchDiscussions();
  }, []);

  const renderDiscussionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.discussionItem}
      onPress={() => navigation.navigate('DiscussionDetail', { discussionId: item.id })}
    >
      <Text style={styles.discussionTitle}>{item.title}</Text>
      <Text style={styles.discussionAuthor}>Posted by: {item.author}</Text>
      <Text style={styles.discussionContent}>{item.content}</Text>
      <View style={styles.replyPreviewContainer}>
        <Text style={styles.replyCount}>{item.replyCount} {item.replyCount === 1 ? 'reply' : 'replies'}</Text>
        <Text style={styles.replyPreview}>Preview: {item.previewReply}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={require('../assets/petBackground.jpg')} 
      style={styles.background}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Pet Forums</Text>
        <TouchableOpacity 
          style={styles.newDiscussionButton}
          onPress={() => navigation.navigate('NewDiscussion')}
        >
          <Text style={styles.newDiscussionButtonText}>Start a New Discussion</Text>
        </TouchableOpacity>
        <FlatList 
          data={discussions}
          keyExtractor={(item) => item.id}
          renderItem={renderDiscussionItem}
          contentContainerStyle={styles.discussionsList}
        />
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
    textAlign: 'center',
  },
  newDiscussionButton: {
    backgroundColor: '#E76F51',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  newDiscussionButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  discussionsList: {
    paddingBottom: 20,
  },
  discussionItem: {
    backgroundColor: '#F4A261',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  discussionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6D4C41',
    marginBottom: 5,
  },
  discussionAuthor: {
    fontSize: 16,
    color: '#6D4C41',
    marginBottom: 5,
  },
  discussionContent: {
    fontSize: 16,
    color: '#6D4C41',
    marginBottom: 10,
  },
  replyPreviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  replyCount: {
    fontSize: 14,
    color: '#6D4C41',
  },
  replyPreview: {
    fontSize: 14,
    color: '#6D4C41',
    fontStyle: 'italic',
  },
});

