import React, { useState, useEffect, useRef } from 'react';
import { 
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // Assume chatUser is passed via route params; default to 'User2'
  const { chatUser } = route.params || { chatUser: 'User2' };

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    // Simulate fetching initial messages
    const initialMessages = [
      { id: '1', sender: 'CurrentUser', content: 'Hi there!' },
      { id: '2', sender: chatUser, content: 'Hello! How are you?' },
      { id: '3', sender: 'CurrentUser', content: 'I’m good, thanks! How about you?' },
    ];
    setMessages(initialMessages);
  }, [chatUser]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      sender: 'CurrentUser',
      content: inputMessage,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    // Scroll to bottom after sending a message
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.sender === 'CurrentUser';
    return (
      <View style={[
          styles.messageContainer, 
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
        ]}>
        <Text style={styles.messageSender}>{item.sender}</Text>
        <Text style={styles.messageContent}>{item.content}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={require('../assets/petBackground.jpg')} 
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <View style={styles.chatContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Chat with {chatUser}</Text>
            </View>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessageItem}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor="#8B7E66"
                value={inputMessage}
                onChangeText={setInputMessage}
                accessibilityLabel="Message Input Field"
              />
              <TouchableOpacity 
                style={styles.sendButton} 
                onPress={handleSendMessage}
                accessibilityLabel="Send Message Button"
              >
                <Text style={styles.sendButtonText}>Send</Text>
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
  chatContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(255, 250, 240, 0.9)',
  },
  header: {
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#8D6E63',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8D6E63',
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingVertical: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  currentUserMessage: {
    backgroundColor: '#E76F51',
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    backgroundColor: '#FFF9C4',
    alignSelf: 'flex-start',
  },
  messageSender: {
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#6D4C41',
  },
  messageContent: {
    fontSize: 16,
    color: '#6D4C41',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#8D6E63',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#6D4C41',
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#E76F51',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginLeft: 10,
  },
  sendButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});
