import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";

// Data untuk 3 halaman onboarding
const pages = [
  {
    key: "1",
    title: "Selamat Datang!",
    description:
      "Dapatkan informasi histori dan laporan bencana banjir di sekitar Anda.",
    image: require("../assets/images/splash1.png"), // Ganti dengan path gambar Anda
  },
  {
    key: "2",
    title: "Lapor & Peringatkan",
    description:
      "Laporkan kejadian bencana secara real-time dan bantu sesama warga.",
    image: require("../assets/images/splash2.png"), // Ganti dengan path gambar Anda
  },
  {
    key: "3",
    title: "Jadilah Pahlawan",
    description:
      "Partisipasi Anda sangat berarti untuk menciptakan lingkungan yang lebih aman.",
    image: require("../assets/images/splash3.png"), // Ganti dengan path gambar Anda
  },
];

export default function OnboardingScreen() {
  const router = useRouter();

  const handleFinishOnboarding = async () => {
    try {
      // Simpan status bahwa onboarding sudah selesai
      await AsyncStorage.setItem("@hasOnboarded", "true");
      // Arahkan pengguna ke alur utama aplikasi (login/home)
      router.replace("/(tabs)");
    } catch (e) {
      console.error("Gagal menyimpan status onboarding", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PagerView style={styles.pagerView} initialPage={0}>
        {pages.map((page, index) => (
          <View key={page.key} style={styles.page}>
            <Image source={page.image} style={styles.image} />
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.description}>{page.description}</Text>

            {/* Tampilkan tombol hanya di halaman terakhir */}
            {index === pages.length - 1 && (
              <TouchableOpacity
                style={styles.button}
                onPress={handleFinishOnboarding}
              >
                <Text style={styles.buttonText}>Mulai</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </PagerView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pagerView: { flex: 1 },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: { width: 250, height: 250, resizeMode: "contain", marginBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  description: { fontSize: 16, textAlign: "center", color: "gray" },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 60,
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
