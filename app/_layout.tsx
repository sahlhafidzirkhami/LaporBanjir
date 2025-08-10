import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { MenuProvider } from "react-native-popup-menu";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext"; // Sesuaikan path jika perlu

// Mencegah splash screen bawaan hilang otomatis
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Ini adalah bagian kunci yang akan menangani redirect
  useEffect(() => {
    // Tunggu sampai font dan status auth selesai dimuat
    if (loaded && !isLoading) {
      SplashScreen.hideAsync(); // Sembunyikan splash screen

      if (user) {
        // Jika ADA user (login berhasil), arahkan paksa ke halaman utama (tabs)
        router.replace("/(tabs)");
      } else {
        // Jika TIDAK ADA user (logout atau buka pertama kali), arahkan paksa ke halaman login
        router.replace("/(tabs)");
      }
    }
  }, [loaded, user, isLoading]); // Jalankan efek ini jika ada perubahan pada state ini

  // Selama masih loading, jangan tampilkan apa-apa (splash screen akan tetap terlihat)
  if (!loaded || isLoading) {
    return null;
  }

  // Tampilkan navigator utama
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{ presentation: "modal", title: "Login atau Daftar" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <MenuProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </MenuProvider>
  );
}
