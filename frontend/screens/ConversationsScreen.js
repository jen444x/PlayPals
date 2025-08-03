import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StyleSheet,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

export default function ConversationsScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) throw new Error("User not logged in");

        const res = await fetch(`${BASE_URL}api/chats/${userId}`);
        const data = await res.json();
        //console.log("Conversations:", data);
        setConversations(data);
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Render each conversation item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Chat', { 
        chatUser: item.chatUser,
        chatId: item.chatID })}
      accessibilityLabel={`Chat with ${item.chatUser}`}
    >
      <Text style={styles.itemText}>{item.chatUser}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={require('../assets/petBackground1.jpg')} // Ensure this image exists in your assets folder
        style={styles.background}
        resizeMode="cover"
      >
        {/* Header with pet icon and title */}
        <View style={styles.header}>
          <Image 
            source={require('../assets/petIcon.png')} // Ensure this image exists in your assets folder
            style={styles.headerIcon}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Pet Chats</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#8B4513" style={{ marginTop: 20 }} />
        ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.chatID}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
        )}
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 235, 215, 0.8)', // AntiqueWhite with transparency
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D2691E', // Chocolate border
    marginBottom: 10,
  },
  headerIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513', // SaddleBrown text color
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D2691E',
    backgroundColor: 'rgba(250, 243, 224, 0.9)', // Soft off-white with transparency
    marginBottom: 10,
    borderRadius: 10,
    // Subtle shadow for elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemText: {
    fontSize: 20,
    color: '#8B4513',
    fontWeight: '600',
  },
});
