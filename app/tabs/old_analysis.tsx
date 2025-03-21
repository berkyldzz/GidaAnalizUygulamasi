import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../styles/theme";

const OldAnalysis = ({ scanTrigger }: { scanTrigger: number }) => {
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      fetchScannedItems();
    }, [scanTrigger])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchScannedItems();
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
            numColumns={2} // 📌 2 sütun görünüm için eklendi
            columnWrapperStyle={styles.row} // 📌 Sütunları hizalamak için eklendi
            contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 10 }} // 📌 Sağdan ve soldan boşluk eklendi
            renderItem={({ item }) => (
              <View style={styles.scanItem}>
                <View style={styles.imageContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedItem(item);
                      setImageModalVisible(true);
                    }}
                  >
                    <Image source={{ uri: item.uri }} style={styles.image} />
                  </TouchableOpacity>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                      📅 {item.date ? item.date.split(" ")[0].replace(",", "") : "Tarih Yok"}
                    </Text>
                    <Text style={styles.timeText}>
                      ⏰ {item.date ? item.date.split(" ")[1] : "Saat Yok"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.resultButton}
                  onPress={() => {
                    setSelectedItem(item);
                    setTextModalVisible(true);
                  }}
                >
                  <Text style={styles.resultButtonText} numberOfLines={1} ellipsizeMode="tail">📊 Analiz Sonuçları</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
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
    flex: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    width: "95%", // 📌 İçeriği ekrana ortala
    alignSelf: "center", // 📌 Ortalamayı güçlendir
  },
  imageContainer: {
    alignItems: "center", // 📌 Resim ve tarih ortada olacak
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 16, // 📌 Tarih yazısı büyütüldü
    fontWeight: "bold",
    color: "#555",
    marginTop: 5,
    textAlign: "center", // 📌 Tarih ortalandı
  },
  dateContainer: {
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 2, // 📌 Saat ile tarih arasında boşluk bırakıldı
  },
  resultButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: "center"
  },
  resultButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center"
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
    maxHeight: 400,
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
  row: {
    justifyContent: "space-between", // 📌 2 sütun görünüm için hizalama
  }
});

export default OldAnalysis;