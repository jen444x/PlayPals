import "react-native-get-random-values";
import { io } from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
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
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import Video from "react-native-video";
import { BASE_URL } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import mime from "mime";
import { URL } from "../config";

const host = `wss://${URL}`;

const socket = io(host, {
  transports: ["websocket"],
  timeout: 10000,
  autoConnect: false,
});

// Component to render each message along with its timestamp and media (if available)
const MessageItem = ({ item, currentUser }) => {
  //const { currentUser } = route.params;
  const isCurrentUser = item.sender === currentUser;
  const dateTimeString = new Date(item.timestamp).toLocaleString();
  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
      ]}
    >
      <Text style={styles.messageSender}>{item.sender}</Text>
      {item.content ? (
        <Text style={styles.messageContent}>{item.content}</Text>
      ) : null}
      {item.media && item.media.type === "image" && (
        <Image source={{ uri: item.media.uri }} style={styles.mediaImage} />
      )}
      {item.media && item.media.type === "video" && (
        <Video
          source={{ uri: item.media.uri }}
          style={styles.mediaVideo}
          paused={true}
          controls={true}
        />
      )}
      <Text style={styles.messageTimestamp}>{dateTimeString}</Text>
    </View>
  );
};

// Component for the message input area with media attachment support
const MessageInput = ({
  inputMessage,
  setInputMessage,
  handleSendMessage,
  handlePickMedia,
}) => {
  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        style={styles.mediaButton}
        onPress={handlePickMedia}
        accessibilityLabel="Pick Media Button"
      >
        <Text style={styles.mediaButtonText}>Media</Text>
      </TouchableOpacity>
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
  const { chatUser, chatId } = route.params;
  const roomId = chatId;
  const [sentLocalIds, setSentLocalIds] = useState(new Set());
  //const { chatUser } = route.params || { chatUser: 'User2' };

  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [typingIndicator, setTypingIndicator] = useState("");
  const flatListRef = useRef(null);

  useEffect(() => {
    // Simulate fetching initial messages with timestamps (without media)
    /* const initialMessages = [
      { id: uuidv4(), sender: 'CurrentUser', content: 'Hi there!', timestamp: new Date().toISOString() },
      { id: uuidv4(), sender: chatUser, content: 'Hello! How are you?', timestamp: new Date().toISOString() },
      { id: uuidv4(), sender: 'CurrentUser', content: 'I’m good, thanks! How about you?', timestamp: new Date().toISOString() },
    ]; */

    const fetchUserInfo = async () => {
      try {
        const username = await AsyncStorage.getItem("username");
        const id = await AsyncStorage.getItem("userId");
        if (username && id) {
          setCurrentUser(username);
          setCurrentUserId(id);

          socket.connect();

          socket.emit("enterRoom", {
            name: username,
            room: roomId,
            chatId: chatId,
            userId: id,
          });

          socket.on("message", (data) => {
            const media = data.mediaUrl
              ? {
                  type: data.mediaType,
                  uri: BASE_URL + data.mediaUrl,
                }
              : null;

            // SKIP if a message was sent
            if (data.localId && sentLocalIds.has(data.localId)) {
              console.log("Duplicate local message received, skipping.");
              return;
            }

            setMessages((prev) => [
              ...prev,
              {
                id: uuidv4(),
                sender: data.name,
                content: data.text,
                timestamp: new Date().toISOString(),
                media: media,
              },
            ]);
          });

          socket.on("chatHistory", (history) => {
            const formatted = history.map((msg) => ({
              id: uuidv4(),
              sender: msg.name,
              content: msg.text,
              timestamp: msg.time,
              media: msg.mediaUrl
                ? {
                    type: msg.mediaType,
                    uri: BASE_URL + msg.mediaUrl,
                  }
                : null,
            }));
            setMessages(formatted);
          });

          socket.on("activity", (name) => {
            if (name !== username) {
              setTypingIndicator(`${name} is typing...`);
              setTimeout(() => setTypingIndicator(""), 3000);
            }
          });
        }
      } catch (err) {
        console.error("Failed to load currentUser from AsyncStorage", err);
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BASE_URL}api/chat/${chatId}`);
        const data = await res.json();

        const formatted = data.map((msg) => ({
          id: msg.messageId.toString(),
          sender: msg.senderName,
          content: msg.message,
          timestamp: msg.timeSent,
        }));

        setMessages(formatted);
      } catch (err) {
        console.error("Error fetching messages: ", err);
      }
    };

    fetchUserInfo();
    fetchMessages();

    return () => {
      socket.disconnect();
    };

    //setMessages(initialMessages);
  }, [roomId]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      Alert.alert("Empty Message", "Please enter a message before sending.");
      return;
    }
    const localMessageId = uuidv4();
    const newMessage = {
      id: uuidv4(),
      sender: currentUser,
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    socket.emit("message", {
      name: currentUser,
      userId: currentUserId,
      chatId: chatId,
      text: inputMessage,
      localId: localMessageId,
    });

    setInputMessage("");
    // Scroll to the bottom after sending a message
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
    setSentLocalIds((prev) => new Set(prev).add(localMessageId));
  };

  const handleTyping = () => {
    socket.emit("activity", currentUser);
  };

  // Allow the user to pick images or videos from their library using expo-image-picker
  const handlePickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access media was not granted."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (result.canceled) {
      // User canceled media selection
      return;
    }
    // Get the first asset from the assets array
    const asset = result.assets[0];
    if (!asset) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      const uri = asset.uri;
      let fileName = uri.split("/").pop();
      const fileType = asset.mimeType;

      if (!fileName.includes(".")) {
        const extension = mime.getExtension(fileType);
        fileName = `${fileName}.${extension}`;
      }

      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append("media", blob, fileName);
      } else {
        formData.append("media", {
          uri,
          name: fileName,
          type: fileType,
        });
      }
      formData.append("chatId", chatId); // you might need this
      formData.append("userId", userId); // and this if your API expects it

      const uploadResponse = await fetch(
        `${BASE_URL}api/chats/uploadMedia/${chatId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const uploadResult = await uploadResponse.json();

      if (uploadResponse.ok) {
        const localMessageId = uuidv4();

        socket.emit("mediaMessage", {
          name: currentUser,
          userId: currentUserId,
          chatId: chatId,
          mediaUrl: uploadResult.mediaUrl,
          mediaType: asset.type,
          localId: localMessageId,
        });
        setSentLocalIds((prev) => new Set(prev).add(localMessageId));
      } else {
        throw new Error(uploadResult.message || "Failed to upload media.");
      }
    } catch (error) {
      console.error("Media upload error:", error);
      Alert.alert("Upload Failed", "There was an error uploading your media.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/petBackground.jpg")}
        style={styles.background}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            if (Platform.OS !== "web") Keyboard.dismiss();
          }}
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
              <Text style={{ textAlign: "center", color: "gray" }}>
                {typingIndicator}
              </Text>
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <MessageItem item={item} currentUser={currentUser} />
                )}
                contentContainerStyle={styles.messagesList}
                initialNumToRender={10}
                windowSize={5}
                onContentSizeChange={() =>
                  flatListRef.current.scrollToEnd({ animated: true })
                }
              />
              <MessageInput
                inputMessage={inputMessage}
                setInputMessage={(text) => {
                  setInputMessage(text);
                  handleTyping();
                }}
                handleSendMessage={handleSendMessage}
                handlePickMedia={handlePickMedia}
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
    resizeMode: "cover",
  },
  chatContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "rgba(255, 250, 240, 0.9)",
  },
  header: {
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#8D6E63",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8D6E63",
  },
  messagesList: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingVertical: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: "80%",
  },
  currentUserMessage: {
    backgroundColor: "#EBAB9B",
    alignSelf: "flex-end",
  },
  otherUserMessage: {
    backgroundColor: "#FFF9C4",
    alignSelf: "flex-start",
  },
  messageSender: {
    fontWeight: "bold",
    marginBottom: 3,
    color: "#6D4C41",
  },
  messageContent: {
    fontSize: 16,
    color: "#6D4C41",
  },
  messageTimestamp: {
    fontSize: 12,
    color: "#4D4B4B",
    marginTop: 5,
    textAlign: "right",
  },
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  mediaVideo: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#8D6E63",
  },
  mediaButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: "#E76F51",
    borderRadius: 25,
  },
  mediaButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#6D4C41",
    color: "#000",
  },
  sendButton: {
    backgroundColor: "#E76F51",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginLeft: 10,
  },
  sendButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
  },
});
