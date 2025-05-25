

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
// @ts-ignore
import Logo from "../../assets/images/logo.png";
import { theme } from "../styles/theme";

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Giriş işlemleri buraya yazılacak
    console.log("Email:", email);
    console.log("Password:", password);
    // Simulate login success
    onLoginSuccess();
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />
      <View style={styles.container}>
        <Image source={Logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Gıda Dedektifi</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="E-posta"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          <View style={styles.checkboxContainer}>
            <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.checkbox}>
              <View style={[styles.checkboxBox, rememberMe && styles.checkboxBoxChecked]} />
              <Text style={styles.checkboxLabel}>Beni Hatırla</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
    backgroundColor: "#fff",
  },
  logo: {
    width: 250 ,
    height: 250,
    marginBottom: 10,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    width: Platform.OS === "web" ? 320 : "100%",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#F0F2F5",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 15,
    borderColor: "#ccc",
    borderWidth: 1,
    width: "100%",
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 100,
    borderRadius: 8,
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  checkboxContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    marginRight: 8,
    borderRadius: 3,
  },
  checkboxBoxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#333",
  },
});

export default LoginScreen;