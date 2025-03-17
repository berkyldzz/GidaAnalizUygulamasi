import React, { useState, useEffect } from "react";
import { 
  View, Text, FlatList, Image, StyleSheet, RefreshControl, TouchableOpacity, Modal, ScrollView 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";

interface ScannedItem {
  uri: string;
  text: string;
  date: string;
}

const ExploreScreen = () => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScannedItem | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);

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
    <SafeAreaView style={styles.safeContainer}>  
          <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />

      <View style={styles.container}>
        {scannedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz tarama yapılmadı.</Text>
          </View>
        ) : (
          <FlatList
            data={scannedItems}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={styles.scanItem}
                onPress={() => {
                  setSelectedItem(item);
                  setTextModalVisible(true); // 📌 Metin popup'ını aç
                }}
              >
                <View style={styles.row}>
                  <TouchableOpacity onPress={() => {
                    setSelectedItem(item);
                    setImageModalVisible(true); // 📌 Tam ekran resim aç
                  }}>
                    <Image source={{ uri: item.uri }} style={styles.image} />
                  </TouchableOpacity>
                  <View style={styles.textContainer}>
                    <View style={styles.dateContainer}>
                      <Text style={styles.dateText}>📅 {item.date}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* 📌 Tam ekran resim görüntüleme modalı */}
        <Modal visible={imageModalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalBackground} onPress={() => setImageModalVisible(false)} />
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setImageModalVisible(false)}>
                <Text style={styles.closeButtonText}>← Geri</Text>
              </TouchableOpacity>
              <Image source={{ uri: selectedItem?.uri }} style={styles.fullImage} />
            </View>
          </View>
        </Modal>

        {/* 📌 Taranan metni detaylı gösteren modal */}
        <Modal visible={textModalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalBackground} onPress={() => setTextModalVisible(false)} />
            <View style={styles.textModal}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setTextModalVisible(false)}>
                <Text style={styles.closeButtonText}>← Geri</Text>
              </TouchableOpacity>
              <ScrollView style={styles.textScroll}>
                <Text style={styles.modalText}>{selectedItem?.text}</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff", // 📌 Safe Area için arka plan
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#8e8e8e",
  },
  scanItem: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  dateContainer: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  dateText: {
    fontSize: 14,
    color: "#555",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  fullImage: {
    width: 300,
    height: 400,
    resizeMode: "contain",
    borderRadius: 10,
  },
  textModal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  textScroll: {
    maxHeight: 400, // 📌 Uzun metinlerde kaydırma
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  closeButton: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "#007AFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ExploreScreen;