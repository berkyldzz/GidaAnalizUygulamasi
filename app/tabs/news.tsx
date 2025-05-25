

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Image,
  Platform,
} from "react-native";
import { theme } from "../styles/theme";

const API_KEY = "cedbce920d1920929c447e47f45dee80"; // TODO: Replace with your actual key
// Fallback query to "food" for debugging API results
const NEWS_URL = `https://gnews.io/api/v4/search?q=gıda&lang=tr&token=${API_KEY}`;

const NewsScreen = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const response = await fetch(NEWS_URL);
      const data = await response.json();
      // Debug output for API response
      console.log("Gelen veri:", data);
      setNews(data.articles || []);
    } catch (error) {
      console.error("Haberler alınırken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => openLink(item.url)}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        <Text style={styles.source}>{item.source.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📰 Gıda Haberleri</Text>
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === "web" ? 90 : 1,
    paddingHorizontal: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
  },
  textContainer: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: theme.colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
  },
  source: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
});

export default NewsScreen;