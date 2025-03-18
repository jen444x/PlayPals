import 'react-native-get-random-values';
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
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// Component to render each message along with its timestamp
const MessageItem = ({ item }) => {
  const isCurrentUser = item.sender === 'CurrentUser';
  const dateTimeString = new Date(item.timestamp).toLocaleString();
  return (
    <View style={[
      styles.messageContainer, 
      isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
    ]}>
      <Text style={styles.messageSender}>{item.sender}</Text>
      <Text style={styles.messageContent}>{item.content}</Text>
      <Text style={styles.messageTimestamp}>{dateTimeString}</Text>
    </View>
  );
};

// Component for the message input area
const MessageInput = ({ inputMessage, setInputMessage, handleSendMessage }) => {
  return (
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
  );
};

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { chatUser } = route.params || { chatUser: 'User2' };

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    // Simulate fetching initial messages with timestamps
    const initialMessages = [
      { id: uuidv4(), sender: 'CurrentUser', content: 'Hi there!', timestamp: new Date().toISOString() },
      { id: uuidv4(), sender: chatUser, content: 'Hello! How are you?', timestamp: new Date().toISOString() },
      { id: uuidv4(), sender: 'CurrentUser', content: 'I’m good, thanks! How about you?', timestamp: new Date().toISOString() },
    ];
    setMessages(initialMessages);
  }, [chatUser]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      Alert.alert("Empty Message", "Please enter a message before sending.");
      return;
    }
    const newMessage = {
      id: uuidv4(),
      sender: 'CurrentUser',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    // Scroll to the bottom after sending a message
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={require('../assets/petBackground.jpg')} 
        style={styles.background}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                renderItem={({ item }) => <MessageItem item={item} />}
                contentContainerStyle={styles.messagesList}
                initialNumToRender={10}
                windowSize={5}
                onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
              />
              <MessageInput 
                inputMessage={inputMessage} 
                setInputMessage={setInputMessage} 
                handleSendMessage={handleSendMessage}
              />
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
  messageTimestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
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
