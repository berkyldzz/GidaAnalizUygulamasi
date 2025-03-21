import React, { useState } from "react";
import { 
  View, TouchableOpacity, Text, StyleSheet, SafeAreaView, StatusBar, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 📌 Modern ikonlar için Ionicons kullanıldı
import OcrScan from "./tabs/ocr_scan";
import OldAnalysis from "./tabs/old_analysis";
import { theme } from "./styles/theme";

const _layout = () => {
  const [activePage, setActivePage] = useState<"scan" | "analysis">("scan");
  const [scanTrigger, setScanTrigger] = useState(0); // 📌 Tarama sonrası tetikleyici

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 📌 Üst Durum Çubuğu */}
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      {/* 📌 İçerik Alanı */}
      <View style={{ flex: 1 }}>
        {activePage === "scan" ? (
          <OcrScan onScanComplete={() => setScanTrigger(prev => prev + 1)} />
        ) : (
          <OldAnalysis scanTrigger={scanTrigger} />
        )}
      </View>

      {/* 📌 Alt Navigasyon Bar */}
      <View style={styles.navbar}>
        <TouchableOpacity 
          onPress={() => setActivePage("scan")} 
          style={[styles.navButton, activePage === "scan" && styles.activeButton]}
        >
          <Ionicons name="scan-outline" size={24} color={activePage === "scan" ? "#FFF" : theme.colors.buttonText} />
          <Text style={[styles.navText, activePage === "scan" && styles.activeText]}>Gıda Analizi</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActivePage("analysis")} 
          style={[styles.navButton, activePage === "analysis" && styles.activeButton]}
        >
          <Ionicons name="documents-outline" size={24} color={activePage === "analysis" ? "#FFF" : theme.colors.buttonText} />
          <Text style={[styles.navText, activePage === "analysis" && styles.activeText]}>Geçmiş</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  mainContainer: {
    flex: 1,
    paddingBottom: 100, // 📌 Alt barın kaplamaması için boşluk
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingBottom: Platform.OS === "ios" ? 15 : 10,
    paddingHorizontal: 20,
  },
  navButton: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
  },
  activeButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 18,
    paddingHorizontal: 25,
    paddingVertical: 14,
  },
  navText: {
    color: theme.colors.buttonText,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  activeText: {
    color: "#FFF",
  },
});

export default _layout;