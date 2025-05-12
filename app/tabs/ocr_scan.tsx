import React, { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";
import TextRecognition from "react-native-text-recognition";
import Tesseract from "tesseract.js";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "../styles/theme";
import { gida_database } from "../../assets/database";

const formatAnalysis = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  return Object.keys(gida_database)
    .filter((code) => lowerText.includes(code))
    .map((code) => {
      const madde = gida_database[code];
      let sonuc = `${code.toUpperCase()} | Güvenilirlik: ${madde.güvenilirlik}`;
      if (madde.etiklik === "haram") {
        sonuc += ` | Etiklik: Haram`;
      }
      sonuc += `\nAçıklama: ${madde.açıklama}`;
      return sonuc;
    });
};

const OcrScan = ({ onScanComplete }: { onScanComplete: () => void }) => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [analizSonuclari, setAnalizSonuclari] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Kamera erişimi verilmedi. Lütfen ayarlardan izin verin.");
      }
    })();
  }, []);

  const handlePickImage = () => {
    // Web desteği için Platform.OS kontrolü
    // @ts-ignore
    if (typeof Platform !== "undefined" && Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageUri = reader.result as string;
            setImage(imageUri);
            processImage(imageUri);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert(
        "Fotoğraf Seç",
        "Lütfen bir seçenek seçin:",
        [
          {
            text: "📷 Kamera",
            onPress: async () => {
              let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
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
                mediaTypes: ["images"],
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
    }
  };

  const processImage = async (uri: string) => {
    setLoading(true);
    try {
      let detectedText = "";

      if (Platform.OS === "web") {
        const result = await Tesseract.recognize(uri, 'eng');
        detectedText = result.data.text;
      } else {
        const recognizedText = await TextRecognition.recognize(uri);
        detectedText = recognizedText.join(" ");
      }

      if (detectedText) {
        const analiz = formatAnalysis(detectedText);
        setAnalizSonuclari(analiz);
        await saveScannedImage(uri, analiz.join("\n"));
        onScanComplete();
      } else {
        setText("Görselde metin bulunamadı.");
      }
    } catch (error) {
      console.error("OCR işlemi sırasında hata oluştu:", error);
      setText("OCR işlemi başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  const saveScannedImage = async (uri: string, extractedText: string) => {
    if (!extractedText) {
      console.error("Analiz sonuçları mevcut değil, kaydetme işlemi iptal edildi.");
      return;
    }
    try {
      let savedUri = uri;

      if (Platform.OS !== "web") {
        const fileName = uri.split("/").pop();
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: uri,
          to: newPath,
        });
        savedUri = newPath;
      }

      const storedItems = await AsyncStorage.getItem("scannedImages");
      let images = storedItems ? JSON.parse(storedItems) : [];

      const newImage = {
        uri: savedUri,
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
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => setImageModalVisible(true)}
            />
            {loading && (
              <Text style={{ fontSize: 16, marginBottom: 10, color: theme.colors.primary }}>
                🔄 Analiz yapılıyor...
              </Text>
            )}
            {analizSonuclari.length > 0 && (
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 20,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                📊 Madde Analizi
              </Text>
            )}
            <ScrollView style={styles.resultBox} nestedScrollEnabled={true}>
              {analizSonuclari.length > 0 ? (
                <>
                  <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, overflow: "hidden" }}>
                    {analizSonuclari.map((sonuc, index) => (
                      <View
                        key={index}
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: "#ddd",
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          backgroundColor: "#f9f9f9",
                          marginVertical: 6,
                          borderRadius: 10,
                        }}
                      >
                        {sonuc.split("\n").map((line, lineIndex) => (
                          <Text
                            key={lineIndex}
                            style={{
                              fontSize: 16,
                              color:
                                line.toLowerCase().includes("güvenilirlik: zararlı")
                                  ? "red"
                                  : line.toLowerCase().includes("güvenilirlik: güvenli")
                                  ? "green"
                                  : "#333",
                              fontWeight: "bold",
                              textAlign: "center",
                              marginBottom: 4,
                            }}
                          >
                            {line}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                </>
              ) : !loading && (
                <Text style={styles.resultText}>Analiz edilecek içerik bulunamadı.</Text>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.resetButton} onPress={() => {
              setImage(null);
              setText("");
              setAnalizSonuclari([]);
            }}>
              <Text style={styles.resetButtonText}>🔄 Yeniden Analiz Et</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Modal visible={imageModalVisible} transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity style={{ flex: 1, width: "100%" }} onPress={() => setImageModalVisible(false)}>
            {image && (
              <Image
                source={{ uri: image }}
                style={{ width: "100%", height: "100%", resizeMode: "contain" }}
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
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
    paddingBottom: 20,
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
    marginTop: 40, // 📌 Daha fazla boşluk
    paddingTop: 10,
  },
  image: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    marginBottom: 20,
    resizeMode: "contain",
    alignSelf: "center", // 📌 Ortalamak için eklendi
  },
  resultBox: {
    backgroundColor: theme.colors.cardBackground,
    padding: 8,
    borderRadius: 30,
    maxHeight: 375, // 📌 Kaydırma alanı artırıldı
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
    marginBottom: 150,
    backgroundColor: "#FF6347", // Kırmızı
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
}); 

export default OcrScan;