import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, StyleSheet, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native"; // 📌 Sayfa açıldığında veriyi güncelle
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ScannedItem {
  uri: string;
  text: string;
}

const ExploreScreen = () => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 📌 AsyncStorage'dan taranan öğeleri getir
  const fetchScannedItems = async () => {
    try {
      const storedItems = await AsyncStorage.getItem("scannedImages");
      if (storedItems) {
        setScannedItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error("Geçmiş analizleri alırken hata oluştu:", error);
    }
  };

  // 📌 Sayfa açıldığında en güncel verileri al
  useFocusEffect(
    React.useCallback(() => {
      fetchScannedItems();
    }, [])
  );

  // 📌 Aşağı çekerek yenileme fonksiyonu
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScannedItems(); // 📌 En güncel verileri getir
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {scannedItems.length === 0 ? (
          <Text>Henüz tarama yapılmadı.</Text>
        ) : (
          scannedItems.map((item, index) => (
            <View key={index} style={styles.scanItem}>
              <Image source={{ uri: item.uri }} style={styles.image} />
              <Text>{item.text}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scanItem: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});

export default ExploreScreen;