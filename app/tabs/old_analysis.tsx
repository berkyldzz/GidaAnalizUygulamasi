import React, { useState, useCallback } from "react";
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
import { PDFDocument, rgb } from "pdf-lib";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { encode as btoa } from "base-64";

const formatDate = (dateString: string) => {
  const parts = dateString.split(" ")[0].replace(",", "").split("/");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[0]}/${parts[2]}`; // gün/ay/yıl
  }
  return dateString;
};

const replaceTurkishChars = (text: string) => {
  const map: { [key: string]: string } = {
    ı: "i",
    İ: "I",
    ş: "s",
    Ş: "S",
    ç: "c",
    Ç: "C",
    ü: "u",
    Ü: "U",
    ö: "o",
    Ö: "O",
    ğ: "g",
    Ğ: "G",
  };
  return text.replace(/[\u0130\u0131\u015E\u015F\u00C7\u00E7\u00DC\u00FC\u00D6\u00F6\u011E\u011F]/g, (match) => map[match] || match);
};

const OldAnalysis = ({ scanTrigger }: { scanTrigger: number }) => {
  const [scannedItems, setScannedItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);

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

  const handleDownloadPdf = async () => {
    try {
      if (!selectedItem?.text) {
        console.error("PDF için analiz sonucu yok.");
        return;
      }
      
      const pdfDoc = await PDFDocument.create();
      const imageBytes = await FileSystem.readAsStringAsync(selectedItem.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageUint8 = Uint8Array.from(atob(imageBytes), (c) => c.charCodeAt(0));
      const jpgImage = await pdfDoc.embedJpg(imageUint8);
      const jpgDims = jpgImage.scale(0.4); // Görseli küçült

      const page = pdfDoc.addPage();
      page.drawImage(jpgImage, {
        x: 50,
        y: page.getHeight() - jpgDims.height - 50,
        width: jpgDims.width,
        height: jpgDims.height,
      });
      let y = page.getHeight() - jpgDims.height - 70;

      const fontSize = 12;
      
      const analysisDate = selectedItem?.date || "";
      page.drawText(`Tarih: ${analysisDate}`, {
        x: 50,
        y: y,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      y -= 30;

      const lines = selectedItem.text.split("\n");

      lines.forEach((line) => {
        if (y < 50) {
          page.drawText("---Devami icin yeni sayfa---", { x: 50, y, size: fontSize });
          y = page.getHeight() - 50;
        }
        const cleanedLine = replaceTurkishChars(line);
        page.drawText(cleanedLine, { x: 50, y, size: fontSize });
        y -= 20;
      });

      const pdfBytes = await pdfDoc.save();
      const pdfUri = FileSystem.cacheDirectory + "analysis_result.pdf";
      const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));
      await FileSystem.writeAsStringAsync(pdfUri, pdfBase64, { encoding: FileSystem.EncodingType.Base64 });

      await Sharing.shareAsync(pdfUri, { mimeType: "application/pdf" });
    } catch (error) {
      console.error("PDF oluşturulurken hata:", error);
    } finally {
      setOptionsVisible(false);
    }
  };


  const handleDeleteAnalysis = async () => {
    try {
      if (!selectedItem) return;

      const storedItems = await AsyncStorage.getItem("scannedImages");
      if (storedItems) {
        const parsedItems = JSON.parse(storedItems);

        // Seçilen item'ı URI'ye göre filtreleyerek sil
        const updatedItems = parsedItems.filter((item: any) => item.uri !== selectedItem.uri);

        // Güncellenmiş listeyi AsyncStorage'a kaydet
        await AsyncStorage.setItem("scannedImages", JSON.stringify(updatedItems));

        // Ekrandaki listeyi de güncelle
        setScannedItems(updatedItems);
      }
    } catch (error) {
      console.error("Analiz silinirken hata oluştu:", error);
    } finally {
      setOptionsVisible(false);
      setTextModalVisible(false);
    }
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
                      📅 {item.date ? formatDate(item.date) : "Tarih Yok"}
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
              <TouchableOpacity style={styles.optionsButton} onPress={() => setOptionsVisible(prev => !prev)}>
                <Text style={styles.optionsButtonText}>...</Text>
              </TouchableOpacity>
              {optionsVisible && (
                <View style={styles.optionsMenu}>
                  <TouchableOpacity onPress={handleDownloadPdf}>
                    <Text style={styles.optionText}>📄 PDF Olarak İndir</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteAnalysis}>
                    <Text style={styles.optionText}>🗑️ Analizi Sil</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={{ fontWeight: "bold", fontSize: 25, marginBottom: 10, textAlign: "center" }}>
                📊 Madde Analizi
              </Text>
              <ScrollView
                style={{ width: "100%" }}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={true}
              >
                <View style={{ paddingHorizontal: 10 }}>
                  {selectedItem?.text ? (
                    selectedItem.text.split("\n").map((line: string, index: number) => (
                      <Text
                        key={index}
                        style={{
                          fontSize: 16,
                          marginBottom: 8,
                          textAlign: "center",
                          fontWeight: "bold",
                          color:
                            line.toLowerCase().includes("güvenilirlik: zararlı")
                              ? "red"
                              : line.toLowerCase().includes("güvenilirlik: güvenli")
                              ? "green"
                              : "#333",
                        }}
                      >
                        {line}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.modalText}>Analiz sonucu bulunamadı.</Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

import { Platform } from "react-native";
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "web" ? 90 : 1,
    paddingHorizontal: 10,
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
    fontSize: 14,
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
    maxHeight: "80%", // Limit modal height
    width: "95%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  textScroll: {
    maxHeight: 600,
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
  },
  optionsButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  optionsButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  optionsMenu: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "#ffffff", // Opak beyaz
    padding: 10,
    borderRadius: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
    paddingVertical: 5,
    color: "#333",
  },
});

export default OldAnalysis;