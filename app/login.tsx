import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../src/contexts/AuthContext";

export default function LoginScreen() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nama, setNama] = useState(""); // Hanya untuk daftar
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuthAction = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password tidak boleh kosong.");
      return;
    }
    if (!isLoginView && !nama) {
      Alert.alert("Error", "Nama tidak boleh kosong saat mendaftar.");
      return;
    }

    setIsLoading(true);
    if (isLoginView) {
      await signIn(email, password);
    } else {
      await signUp(email, password, nama);
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isLoginView ? "Login Akun" : "Daftar Akun Baru"}
      </Text>

      {!isLoginView && (
        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap Anda"
          placeholderTextColor="gray"
          value={nama}
          onChangeText={setNama}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Alamat Email"
        placeholderTextColor="gray"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min. 6 karakter)"
        placeholderTextColor="gray"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAuthAction}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isLoginView ? "Login" : "Daftar"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLoginView(!isLoginView)}>
        <Text style={styles.switchText}>
          {isLoginView
            ? "Belum punya akun? Daftar di sini"
            : "Sudah punya akun? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#007AFF",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "white",
    color: "black",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchText: {
    marginTop: 20,
    textAlign: "center",
    color: "#007AFF",
    fontSize: 14,
  },
});
