import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GIDA_VERITABANI } from "../../constants/ingredients";

const GOOGLE_CLOUD_VISION_API_KEY = "AIzaSyAskUv1Ur7DYfuoCT-2fTySs31x0Jwf5Js"; // 🔑 API Anahtarını buraya ekleyin.

const OCRScanScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("OCR Bileşeni Yüklendi");
  }, []);

  // 📌 Fotoğraf seçme işlemi
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setImage(selectedImage);
      processImage(selectedImage);
    }
  };

  // 📌 Taranan öğeleri kaydetme fonksiyonu
  const saveScannedImage = async (uri: string, extractedText: string) => {
    try {
      const storedImages = await AsyncStorage.getItem("scannedImages");
      let images = storedImages ? JSON.parse(storedImages) : [];
      const newImage = { uri, text: extractedText };
      images = [newImage, ...images];
      await AsyncStorage.setItem("scannedImages", JSON.stringify(images));
    } catch (error) {
      console.error("Görsel kaydedilirken hata oluştu:", error);
    }
  };

  // 📌 Google Vision API ile OCR İşlemi
  const processImage = async (uri: string) => {
    setLoading(true);

    try {
      // Fotoğrafı Base64 formatına çevir
      let base64Img = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Google Vision API için JSON isteği
      let body = JSON.stringify({
        requests: [{ image: { content: base64Img }, features: [{ type: "TEXT_DETECTION" }] }],
      });

      // API isteğini yap
      let response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_VISION_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: body }
      );

      // Yanıtı JSON olarak al
      let result = await response.json();

      if (!result.responses || result.responses.length === 0 || !result.responses[0].fullTextAnnotation) {
        console.error("OCR Hatası: API Yanıtı Boş veya Beklenmeyen Format");
        setText("Metin bulunamadı. Lütfen daha net bir fotoğraf çekin.");
      } else {
        let extractedText = result.responses[0].fullTextAnnotation.text;
        setText(extractedText);

        // 📌 Yeni tarama verisini kaydet
        await saveScannedImage(uri, extractedText);
      }
    } catch (error) {
      console.error("OCR Hatası:", error);
      setText("OCR işlemi başarısız oldu. Lütfen tekrar deneyin.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Fotoğraf Seç</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <ScrollView style={styles.textContainer}>
        {loading ? <ActivityIndicator size="large" color="blue" /> : <Text>{text}</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  button: {
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginTop: 10,
  },
  textContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    maxHeight: 300,
  },
});
export default OCRScanScreen;