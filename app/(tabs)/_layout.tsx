import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";
import HeaderMenu from "../../components/HeaderMenu"; // Sesuaikan path jika perlu
import useNotifications from "../../hooks/useNotifications";
import { useAuth } from "../../src/contexts/AuthContext"; // 1. Impor useAuth
export default function TabLayout() {
  const { userInfo } = useAuth(); // 2. Dapatkan userInfo
  useNotifications();
  return (
    <Tabs
      screenOptions={{
        headerRight: () => <HeaderMenu />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="history" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Lapor",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="plus-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          // 3. Buat title menjadi dinamis
          title: userInfo?.isAdmin ? "Feed" : "Emergency",
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={28}
              // Ikon juga bisa dibuat dinamis
              name={userInfo?.isAdmin ? "list-alt" : "warning"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
