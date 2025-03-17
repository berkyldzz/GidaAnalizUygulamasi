import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExploreScreen from "./tabs/old_analysis";
import OCRScanScreen from "./tabs/ocr_scan";

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  const insets = useSafeAreaInsets(); // 📌 Safe Area için

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: [
          styles.tabBarStyle,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }, // 📌 iPhone X ve üzeri için güvenli alan
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8e8e93",
        headerShown: true,
        headerTitleStyle: {
          fontSize: 22, // 📌 Başlık yazı boyutu büyütüldü
          fontWeight: "bold", // 📌 Kalın yapıldı
          color: "#000", // 📌 Siyah renkte
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case "Gıda Analizi":
              iconName = focused ? "camera" : "camera-outline";
              break;
            case "📜 Geçmiş Analizler":
              iconName = focused ? "compass" : "compass-outline";
              break;
            
            default:
              iconName = "help-circle";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Gıda Analizi" component={OCRScanScreen} />
      <Tab.Screen name="📜 Geçmiş Analizler" component={ExploreScreen} />
    </Tab.Navigator>
  );
}

// 📌 Güncellenmiş Stil
const styles = StyleSheet.create({
  tabBarStyle: {
    position: "absolute",
    bottom: 0, // 📌 Alt bar en alta yerleştirildi
    left: 0,
    right: 0,
    backgroundColor: "white",
    height: Platform.OS === "ios" ? 80 : 70, // 📌 iOS'ta daha büyük, Android'te biraz daha küçük
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -5 },
    shadowRadius: 5,
    elevation: 5,
  },
});