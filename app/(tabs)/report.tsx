import firestore from "@react-native-firebase/firestore";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";

// Komponen untuk pengguna yang belum login
function GuestView() {
  return (
    <View style={styles.centered}>
      <Text style={styles.infoText}>
        Anda harus login untuk dapat membuat laporan bencana.
      </Text>
      <Link href="/login" asChild>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login atau Daftar Sekarang</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// Komponen untuk pengguna yang sudah login (form laporan)
function LoggedInView() {
  const [laporan, setLaporan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userInfo } = useAuth();

  const handleSubmit = async () => {
    // ... (kode handleSubmit Anda yang sudah ada, tidak perlu diubah)
    if (laporan.trim() === "") {
      Alert.alert("Error", "Laporan tidak boleh kosong.");
      return;
    }
    setIsSubmitting(true);
    Keyboard.dismiss();
    try {
      const targetCollection = userInfo?.isAdmin ? "alerts" : "laporan";
      await firestore()
        .collection(targetCollection)
        .add({
          teks: laporan,
          waktu: firestore.FieldValue.serverTimestamp(),
          pelapor: userInfo?.email || "anonim",
        });
      const successMessage = userInfo?.isAdmin
        ? "Peringatan darurat berhasil dikirim."
        : "Laporan berhasil dikirim. Terima kasih!";
      Alert.alert("Sukses", successMessage);
      setLaporan("");
    } catch (error) {
      console.error("Error mengirim pesan: ", error);
      Alert.alert("Error", "Terjadi kesalahan saat mengirim pesan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {userInfo?.isAdmin ? "Kirim Peringatan Darurat" : "Buat Laporan Baru"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Tuliskan detail laporan..."
        placeholderTextColor="gray"
        multiline
        value={laporan}
        onChangeText={setLaporan}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {userInfo?.isAdmin ? "Kirim Peringatan" : "Kirim Laporan"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

export default function ReportScreen() {
  const { user } = useAuth();

  // Pilih tampilan mana yang akan dirender berdasarkan status login
  return user ? <LoggedInView /> : <GuestView />;
}

// Stylesheet digabung untuk kedua view
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  infoText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "gray",
  },
  loginButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  loginButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    color: "black",
    height: 150,
    padding: 15,
    borderRadius: 10,
    textAlignVertical: "top",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
