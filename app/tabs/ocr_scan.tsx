import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../styles/theme";

const GOOGLE_VISION_API_KEY = "AIzaSyAskUv1Ur7DYfuoCT-2fTySs31x0Jwf5Js";

const OcrScan = ({ onScanComplete }: { onScanComplete: () => void }) => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Kamera erişimi verilmedi. Lütfen ayarlardan izin verin.");
      }
    })();
  }, []);

  const handlePickImage = () => {
    Alert.alert(
      "Fotoğraf Seç",
      "Lütfen bir seçenek seçin:",
      [
        {
          text: "📷 Kamera",
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"], // ✅ yenisi
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled && result.assets.length > 0) {
              const selectedImage = result.assets[0].uri;
              setImage(selectedImage);
              processImage(selectedImage);
            }
          },
        },
        {
          text: "🖼️ Galeri",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"], // ✅ yenisi
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled && result.assets.length > 0) {
              const selectedImage = result.assets[0].uri;
              setImage(selectedImage);
              processImage(selectedImage);
            }
          },
        },
        { text: "İptal", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const processImage = async (uri: string) => {
    try {
      const base64Img = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const body = JSON.stringify({
        requests: [
          {
            image: { content: base64Img },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      });

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body,
        }
      );

      const result = await response.json();

      if (
        result.responses &&
        result.responses.length > 0 &&
        result.responses[0].fullTextAnnotation
      ) {
        const detectedText = result.responses[0].fullTextAnnotation.text;
        setText(detectedText);
        await saveScannedImage(uri, detectedText);
        onScanComplete();
      } else {
        setText("Görselde metin bulunamadı.");
      }
    } catch (error) {
      console.error("OCR işlemi sırasında hata oluştu:", error);
      setText("OCR işlemi başarısız oldu.");
    }
  };

  const saveScannedImage = async (uri: string, extractedText: string) => {
    try {
      const storedItems = await AsyncStorage.getItem("scannedImages");
      let images = storedItems ? JSON.parse(storedItems) : [];

      const newImage = {
        uri,
        text: extractedText,
        date: new Date().toLocaleString(),
      };
      images.unshift(newImage);

      await AsyncStorage.setItem("scannedImages", JSON.stringify(images));
    } catch (error) {
      console.error("Veri kaydedilirken hata oluştu:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.scrollContent}>
        {!image && (
          <View style={styles.centerContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.titleBold}>Analiz İçin Ürünün</Text>
              <Text style={styles.title}>İçindekiler Bölümünü</Text>
              <Text style={styles.titleBold}>Yükleyin!</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handlePickImage}>
              <Text style={styles.buttonText}>📷 Fotoğraf Çek / Yükle</Text>
            </TouchableOpacity>
          </View>
        )}

        {image && (
          <View style={styles.resultContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <ScrollView style={styles.resultBox} nestedScrollEnabled={true}>
              <Text style={styles.resultText}>{text}</Text>
            </ScrollView>

            <TouchableOpacity style={styles.resetButton} onPress={() => {
              setImage(null);
              setText("");
            }}>
              <Text style={styles.resetButtonText}>🔄 Yeniden Analiz Et</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 120, // 📌 Alt bardan kaçınmak için boşluk bırakıldı
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 35,
    color: theme.colors.secondary,
    textAlign: "center",
    marginBottom: 4,
  },
  titleBold: {
    fontSize: 38,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 20,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 25,
    fontWeight: "bold",
  },
  resultContainer: {
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  image: {
    width: "100%",
    height: 280,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    marginBottom: 20,
  },
  resultBox: {
    backgroundColor: theme.colors.cardBackground,
    padding: 15,
    borderRadius: 8,
    maxHeight: 300, // 📌 Kaydırma alanı artırıldı
    width: "100%",
  },
  resultText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontWeight: "bold",
    textAlign: "center",
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default OcrScan;