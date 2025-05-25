import React, { useState } from "react";
import { 
  View, TouchableOpacity, Text, StyleSheet, SafeAreaView, StatusBar, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 📌 Modern ikonlar için Ionicons kullanıldı
import OcrScan from "./tabs/ocr_scan";
import OldAnalysis from "./tabs/old_analysis";
import Profile from "./tabs/profile";
import LoginScreen from "./tabs/login";
import NewsScreen from "./tabs/news";
import { theme } from "./styles/theme";

const _layout = () => {
  const [activePage, setActivePage] = useState<"scan" | "analysis" | "profile" | "news">("scan");
  const [scanTrigger, setScanTrigger] = useState(0); // 📌 Tarama sonrası tetikleyici
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      {!isLoggedIn ? (
        <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <>
          {Platform.OS === "web" && (
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
                <Text style={[styles.navText, activePage === "analysis" && styles.activeText]}>Geçmiş Analizler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivePage("news")}
                style={[styles.navButton, activePage === "news" && styles.activeButton]}
              >
                <Ionicons name="newspaper-outline" size={24} color={activePage === "news" ? "#FFF" : theme.colors.buttonText} />
                <Text style={[styles.navText, activePage === "news" && styles.activeText]}>Haberler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivePage("profile")}
                style={[styles.navButton, activePage === "profile" && styles.activeButton]}
              >
                <Ionicons name="person-outline" size={24} color={activePage === "profile" ? "#FFF" : theme.colors.buttonText} />
                <Text style={[styles.navText, activePage === "profile" && styles.activeText]}>Profil</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flex: 1 }}>
            {activePage === "news" ? (
              <NewsScreen />
            ) : activePage === "scan" ? (
              <OcrScan onScanComplete={() => setScanTrigger(prev => prev + 1)} />
            ) : activePage === "analysis" ? (
              <OldAnalysis scanTrigger={scanTrigger} />
            ) : activePage === "profile" ? (
              <Profile onLogout={() => setIsLoggedIn(false)} />
            ) : null}
          </View>
          {Platform.OS !== "web" && (
            <View style={styles.navbar}>
              <TouchableOpacity
                onPress={() => setActivePage("scan")}
                style={[styles.navButton, activePage === "scan" && styles.activeButton]}
              >
                <Ionicons name="scan-outline" size={24} color={activePage === "scan" ? "#FFF" : theme.colors.buttonText} />
                <Text style={[styles.navText, activePage === "scan" && styles.activeText]}>Analiz</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivePage("analysis")}
                style={[styles.navButton, activePage === "analysis" && styles.activeButton]}
              >
                <Ionicons name="documents-outline" size={24} color={activePage === "analysis" ? "#FFF" : theme.colors.buttonText} />
                <Text style={[styles.navText, activePage === "analysis" && styles.activeText]}>Geçmiş</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivePage("news")}
                style={[styles.navButton, activePage === "news" && styles.activeButton]}
              >
                <Ionicons name="newspaper-outline" size={24} color={activePage === "news" ? "#FFF" : theme.colors.buttonText} />
                <Text style={[styles.navText, activePage === "news" && styles.activeText]}>Haberler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActivePage("profile")}
                style={[styles.navButton, activePage === "profile" && styles.activeButton]}
              >
                <Ionicons name="person-outline" size={24} color={activePage === "profile" ? "#FFF" : theme.colors.buttonText} />
                <Text style={[styles.navText, activePage === "profile" && styles.activeText]}>Profil</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
    ...(Platform.OS === "web"
      ? {
          height: 70,
          position: "relative",
          top: 0,
          width: "100%",
          zIndex: 10,
        }
      : {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
          paddingBottom: Platform.OS === "ios" ? 10 : 5,
          paddingHorizontal: 20,
          flexWrap: "wrap",
        }),
  },
  navButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 15,
    minWidth: 80,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  fullImage: {
    width: "90%",
    height: "80%",
    resizeMode: "contain",
  },
  profileContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 16,
    color: theme.colors.secondary,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default _layout;