import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { BASE_URL } from "../config.js";

export default function ForumsScreen({ navigation }) {
  const [discussions, setDiscussions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);

  // Updated topics including "All" and other categories
  const topics = [
    "All",
    "Training",
    "Toys",
    "Nutrition",
    "Health",
    "Behavior",
    "General",
  ];
  const [selectedTopic, setSelectedTopic] = useState("All");

  // Updated static data with each post covering a unique topic
  const allPosts = [
    {
      id: "1",
      title: "How do I train my puppy?",
      author: "Alice",
      content:
        "I need tips on training my new puppy. Any suggestions on effective methods?",
      replyCount: 2,
      previewReply: "Try using positive reinforcement techniques…",
      topic: "Training",
    },
    {
      id: "2",
      title: "Best interactive pet toys?",
      author: "Bob",
      content:
        "Looking for recommendations for toys that can keep my cat engaged...",
      replyCount: 1,
      previewReply: "I recently tried a puzzle toy and my cat loves it!",
      topic: "Toys",
    },
    {
      id: "3",
      title: "Optimal nutrition for pets",
      author: "Charlie",
      content: "What kind of diet is best for maintaining my pet’s health?",
      replyCount: 3,
      previewReply: "Consider a balanced diet with high-quality ingredients...",
      topic: "Nutrition",
    },
    {
      id: "4",
      title: "Managing pet health issues",
      author: "Diana",
      content:
        "What are some common health problems in pets and how can I prevent them?",
      replyCount: 2,
      previewReply: "Regular vet check-ups can make a big difference...",
      topic: "Health",
    },
    {
      id: "5",
      title: "Understanding pet behavior",
      author: "Eve",
      content: "How do I deal with unwanted pet behaviors?",
      replyCount: 0,
      previewReply: "Behavior training and socialization might help...",
      topic: "Behavior",
    },
    {
      id: "6",
      title: "General pet care tips for new owners",
      author: "Frank",
      content: "What are some essential tips for taking care of a new pet?",
      replyCount: 4,
      previewReply: "Regular grooming and proper diet are key...",
      topic: "General",
    },
  ];

  const postsPerPage = 2;

  // Simulated API call to fetch discussions with pagination using a slice of the static data
  const fetchDiscussions = async (pageNumber = 1, isRefreshing = false) => {
    try {
      const topicQuery =
        selectedTopic === "All" ? "" : `&topic=${selectedTopic}`;
      const res = await fetch(
        `${BASE_URL}api/discussions/getThreads?page=${pageNumber}${topicQuery}`
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Backend error response:", text);
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Expected an array but got something else");
      }

      if (isRefreshing) {
        setDiscussions(data);
      } else {
        setDiscussions((prev) => {
          const combined = [...prev, ...data];
          // Filter out duplicates based on the unique post ID
          return combined.filter(
            (item, index) =>
              combined.findIndex((d) => d.id === item.id) === index
          );
        });
      }

      if (!data || data.length === 0 || data.length < postsPerPage) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching discussions:", error);
    }
  };

  // useEffect(() => {
  //   setPage(1);
  //   fetchDiscussions(1, true);
  // }, [selectedTopic]);

  // make feed refresh when new post is added
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setPage(1);
      setHasMore(true);
      fetchDiscussions(1, true);
    });

    return unsubscribe;
  }, [navigation, selectedTopic]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchDiscussions(1, true);
    setRefreshing(false);
  };

  const onEndReached = async () => {
    if (!hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    const nextPage = page + 1;
    setLoadingMore(true);
    await fetchDiscussions(nextPage);
    setPage(nextPage);
    setLoadingMore(false);
    loadingMoreRef.current = false;
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#8D6E63" />
      </View>
    );
  };

  const renderDiscussionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.discussionItem}
      onPress={() =>
        navigation.navigate("DiscussionDetail", { discussionId: item.id })
      }
      accessibilityLabel={`Discussion titled ${item.title}, posted by ${item.author}`}
    >
      <View style={styles.itemHeader}>
        <Image
          source={require("../assets/pawIcon.png")}
          style={styles.pawIcon}
        />
        <Text style={styles.discussionTitle}>{item.title}</Text>
      </View>
      <Text style={styles.discussionAuthor}>Posted by: {item.author}</Text>
      <Text style={styles.discussionContent}>{item.content}</Text>
      <View style={styles.replyPreviewContainer}>
        <Text style={styles.replyCount}>
          {item.replyCount} {item.replyCount === 1 ? "reply" : "replies"}
        </Text>
        <Text style={styles.replyPreview}>Preview: {item.previewReply}</Text>
      </View>
    </TouchableOpacity>
  );

  // Filter discussions based on the selected topic
  const filteredDiscussions = discussions.filter(
    (discussion) =>
      selectedTopic === "All" || discussion.topic === selectedTopic
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/petBackground.jpg")}
        style={styles.background}
      >
        <View style={styles.overlay}>
          <View style={styles.headerContainer}>
            <Image
              source={require("../assets/pawIcon.png")}
              style={styles.headerPaw}
            />
            <Text style={styles.headerTitle}>Pet Forums</Text>
          </View>
          <TouchableOpacity
            style={styles.newDiscussionButton}
            onPress={() => navigation.navigate("NewDiscussion")}
            accessibilityLabel="Start a new discussion"
          >
            <Text style={styles.newDiscussionButtonText}>
              Start a New Discussion
            </Text>
          </TouchableOpacity>
          {/* Topics Tab */}
          <View style={styles.topicsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.topicButton,
                    selectedTopic === topic && styles.selectedTopicButton,
                  ]}
                  onPress={() => setSelectedTopic(topic)}
                  accessibilityLabel={`Filter by ${topic} topic`}
                >
                  <Text
                    style={[
                      styles.topicButtonText,
                      selectedTopic === topic && styles.selectedTopicButtonText,
                    ]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <FlatList
            data={filteredDiscussions}
            keyExtractor={(item) => item.id}
            renderItem={renderDiscussionItem}
            contentContainerStyle={styles.discussionsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        </View>
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
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 250, 240, 0.9)",
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerPaw: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#8D6E63",
  },
  newDiscussionButton: {
    backgroundColor: "#FFB6C1",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  newDiscussionButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  topicsContainer: {
    marginBottom: 15,
  },
  topicButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    marginRight: 10,
  },
  selectedTopicButton: {
    backgroundColor: "#8D6E63",
  },
  topicButtonText: {
    fontSize: 16,
    color: "#424242",
  },
  selectedTopicButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  discussionsList: {
    paddingBottom: 20,
  },
  discussionItem: {
    backgroundColor: "#FFF9C4",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#8D6E63",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  pawIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  discussionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8D6E63",
  },
  discussionAuthor: {
    fontSize: 16,
    color: "#8D6E63",
    marginBottom: 8,
  },
  discussionContent: {
    fontSize: 16,
    color: "#8D6E63",
    marginBottom: 12,
  },
  replyPreviewContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  replyCount: {
    fontSize: 14,
    color: "#8D6E63",
  },
  replyPreview: {
    fontSize: 14,
    color: "#8D6E63",
    fontStyle: "italic",
  },
  footer: {
    paddingVertical: 20,
  },
});
