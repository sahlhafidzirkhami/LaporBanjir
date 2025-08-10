import FontAwesome from "@expo/vector-icons/FontAwesome";
import axios, { AxiosError } from "axios";
import { Link, useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView, // 1. Gunakan SafeAreaView, bukan ScrollView
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext"; // Sesuaikan path jika perlu

// --- KONFIGURASI API ---
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=-6.9175&lon=107.6191&appid=a6ab08ce4391df9af7a8c3ea7dc339f6&units=metric&lang=id`;
const NEWS_API_URL = `https://newsapi.org/v2/everything?q=(banjir OR longsor OR gempa OR bencana alam) AND (bandung OR "jawa barat")&language=id&sortBy=publishedAt&apiKey=699af798325c4d84b74edf64fb9f7aaa`;

// Tipe data untuk state
interface WeatherData {
  main: { temp: number };
  weather: { main: string; description: string; icon: string }[];
}
interface NewsArticle {
  title: string;
  urlToImage: string;
  url: string;
  source: { name: string };
}

// --- Komponen Header (Cuaca & Menu) ---
const ListHeader = () => {
  const { userInfo } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(WEATHER_API_URL);
        setWeatherData(response.data);
      } catch (error) {
        console.error("Gagal mengambil data cuaca:", error);
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, []);

  return (
    <>
      <View style={styles.weatherContainer}>
        <Text style={styles.greeting}>
          Halo, {userInfo?.nama || "Pengguna"}
        </Text>
        <Text style={styles.location}>Cuaca di Bandung</Text>
        {loadingWeather ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : weatherData ? (
          <>
            <Image
              style={styles.weatherIcon}
              source={{
                uri: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`,
              }}
            />
            <Text style={styles.temperature}>
              {Math.round(weatherData.main.temp)}°C
            </Text>
            <Text style={styles.weatherDescription}>
              {weatherData.weather[0].description}
            </Text>
          </>
        ) : (
          <Text style={styles.weatherDescription}>
            Gagal memuat data cuaca.
          </Text>
        )}
      </View>

      <View style={styles.menuContainer}>
        <Link href="/(tabs)/history" asChild>
          <TouchableOpacity style={styles.menuButton}>
            <FontAwesome name="history" size={30} color="#333" />
            <Text style={styles.menuText}>History</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/report" asChild>
          <TouchableOpacity style={styles.menuButton}>
            <FontAwesome name="plus-circle" size={30} color="#333" />
            <Text style={styles.menuText}>Lapor</Text>
          </TouchableOpacity>
        </Link>
        {userInfo?.isAdmin && (
          <Link href="/(tabs)/feed" asChild>
            <TouchableOpacity style={styles.menuButton}>
              <FontAwesome name="list-alt" size={30} color="#333" />
              <Text style={styles.menuText}>Laporan</Text>
            </TouchableOpacity>
          </Link>
        )}
      </View>
      <Text style={styles.newsSectionTitle}>Berita Bencana Terkini</Text>
    </>
  );
};

export default function HomeScreen() {
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchNews = async () => {
        setLoadingNews(true);
        try {
          const newsResponse = await axios.get(NEWS_API_URL);
          const filteredNews = newsResponse.data.articles
            .filter((a: NewsArticle) => a.urlToImage)
            .slice(0, 10);
          setNewsData(filteredNews);
        } catch (error) {
          const axiosError = error as AxiosError;
          console.error(
            "GAGAL MENGAMBIL DATA BERITA:", // 2. Perbaiki teks error di sini
            axiosError.response?.data || axiosError.message
          );
          setNewsData([]); // 3. Perbaiki ini dari setWeatherData menjadi setNewsData
        } finally {
          setLoadingNews(false);
        }
      };
      fetchNews();
    }, [])
  );

  const handleOpenBrowser = (url: string) => {
    WebBrowser.openBrowserAsync(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.url}
        ListHeaderComponent={<ListHeader />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.newsCard}
            onPress={() => handleOpenBrowser(item.url)}
          >
            <Image source={{ uri: item.urlToImage }} style={styles.newsImage} />
            <View style={styles.newsTextContainer}>
              <Text style={styles.newsSource}>{item.source.name}</Text>
              <Text style={styles.newsTitle} numberOfLines={3}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ padding: 20 }}>
            {loadingNews ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.emptyNews}>
                Tidak ada berita yang ditemukan.
              </Text>
            )}
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

// Stylesheet (dengan beberapa penyesuaian)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  weatherContainer: {
    backgroundColor: "#4a90e2",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
  },
  location: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
  weatherIcon: {
    width: 120,
    height: 120,
  },
  temperature: {
    fontSize: 48,
    color: "white",
    fontWeight: "200",
  },
  weatherDescription: {
    fontSize: 20,
    color: "white",
    textTransform: "capitalize",
  },
  menuContainer: {
    height: 100,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  menuButton: {
    alignItems: "center",
    padding: 10,
  },
  menuText: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
  },
  newsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
    paddingTop: 10,
  },
  newsCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  newsTextContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  newsSource: {
    fontSize: 12,
    color: "gray",
    marginBottom: 4,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyNews: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
});
