import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { theme } from "../styles/theme";

type ProfileProps = {
  onLogout: () => void;
};

const Profile = ({ onLogout }: ProfileProps) => {
  return (
    <View style={styles.profileContainer}>
      <Image
        source={require("../../assets/images/profile.png")}
        style={styles.profileImage}
      />
      <Text style={styles.profileName}>Kullanıcı Adı</Text>
      <Text style={styles.profileEmail}>email@example.com</Text>
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Profili Düzenle</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
      >
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  logoutButton: {
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 40,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Profile;
