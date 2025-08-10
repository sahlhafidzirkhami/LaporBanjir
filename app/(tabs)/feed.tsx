import FontAwesome from "@expo/vector-icons/FontAwesome";
import firestore from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";

// Tipe data untuk laporan (tidak berubah)
interface Laporan {
  id: string;
  teks: string;
  pelapor: string;
  waktu: {
    toDate: () => Date;
  };
}

// Data nomor darurat
const emergencyContacts = [
  { name: "Nomor Darurat Terpadu", number: "112", icon: "phone-square" },
  { name: "Ambulans", number: "118", icon: "ambulance" },
  { name: "Pemadam Kebakaran", number: "113", icon: "fire-extinguisher" },
  { name: "Polisi", number: "110", icon: "shield" },
  { name: "SAR / Basarnas", number: "115", icon: "life-ring" },
  { name: "BPBD Kota Bandung", number: "0227307761", icon: "globe" },
];

// ---------------- Komponen Tampilan Admin ----------------
function AdminFeed() {
  const [laporanList, setLaporanList] = useState<Laporan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userInfo } = useAuth(); // userInfo diperlukan di sini juga

  useEffect(() => {
    const query = firestore().collection("laporan").orderBy("waktu", "desc");
    const unsubscribe = query.onSnapshot(
      (querySnapshot) => {
        const reports: Laporan[] = [];
        querySnapshot.forEach((doc) => {
          reports.push({ id: doc.id, ...doc.data() } as Laporan);
        });
        setLaporanList(reports);
        if (isLoading) setIsLoading(false);
      },
      (error) => {
        console.error("Error mengambil data laporan: ", error);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleEscalateToAlert = (item: Laporan) => {
    Alert.alert(
      "Konfirmasi Peringatan",
      `Anda yakin ingin menjadikan laporan "${item.teks}" sebagai peringatan darurat?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Kirim Peringatan",
          onPress: async () => {
            try {
              await firestore().collection("alerts").add({
                teks: item.teks,
                waktu: firestore.FieldValue.serverTimestamp(),
                pelapor: item.pelapor,
              });
              await firestore().collection("laporan").doc(item.id).delete();
              Alert.alert("Sukses", "Peringatan darurat telah dikirim.");
            } catch (error) {
              console.error(
                "Gagal mengubah laporan menjadi peringatan:",
                error
              );
              Alert.alert("Error", "Gagal mengirim peringatan.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Laporan }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.teks}</Text>
      <View style={styles.itemFooter}>
        <Text style={styles.itemMeta}>Oleh: {item.pelapor}</Text>
        <Text style={styles.itemMeta}>
          {item.waktu
            ? item.waktu.toDate().toLocaleString("id-ID")
            : "Baru saja"}
        </Text>
      </View>
      {userInfo?.isAdmin && (
        <TouchableOpacity
          style={styles.alertButton}
          onPress={() => handleEscalateToAlert(item)}
        >
          <Text style={styles.alertButtonText}>Jadikan Peringatan</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Laporan Masuk dari Pengguna</Text>
      <FlatList
        data={laporanList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada laporan yang masuk.</Text>
        }
      />
    </SafeAreaView>
  );
}

// ---------------- Komponen Tampilan Pengguna Biasa ----------------
function UserEmergencyScreen() {
  const handlePhoneCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Nomor Darurat Bandung</Text>
      <View style={styles.cardContainer}>
        {emergencyContacts.map((contact) => (
          <TouchableOpacity
            key={contact.name}
            style={styles.emergencyCard}
            onPress={() => handlePhoneCall(contact.number)}
          >
            <FontAwesome name={contact.icon as any} size={32} color="#007AFF" />
            <Text style={styles.emergencyName}>{contact.name}</Text>
            <Text style={styles.emergencyNumber}>{contact.number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ---------------- Komponen Utama yang Memilih Tampilan ----------------
export default function FeedScreen() {
  const { userInfo } = useAuth();

  // Tampilkan loading jika userInfo belum ada
  if (userInfo === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Pilih komponen mana yang akan dirender berdasarkan peran
  return userInfo.isAdmin ? <AdminFeed /> : <UserEmergencyScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f7" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 20,
    backgroundColor: "white",
  },
  list: { padding: 16 },
  itemContainer: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  itemText: { fontSize: 16, marginBottom: 12 },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
  },
  itemMeta: { fontSize: 12, color: "#666" },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "gray",
  },
  alertButton: {
    backgroundColor: "#ff9500",
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
    alignItems: "center",
  },
  alertButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },

  // Style baru untuk halaman nomor darurat
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 16,
  },
  emergencyCard: {
    backgroundColor: "white",
    width: "45%",
    aspectRatio: 1, // Membuat kartu menjadi persegi
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },
  emergencyNumber: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
});
