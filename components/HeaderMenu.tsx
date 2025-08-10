import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text } from "react-native";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import { useAuth } from "../src/contexts/AuthContext"; // Sesuaikan path jika perlu

export default function HeaderMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSelect = (value: string) => {
    if (value === "login") {
      router.push("/login");
    } else if (value === "signup") {
      // Kita bisa arahkan ke halaman login dan mengubah view-nya
      // Untuk saat ini, kita arahkan ke login saja.
      router.push("/login");
    } else if (value === "logout") {
      signOut();
    }
  };

  return (
    <Menu onSelect={(value) => handleSelect(value as string)}>
      <MenuTrigger style={{ marginRight: 15 }}>
        <FontAwesome name="user-circle" size={25} color="gray" />
      </MenuTrigger>
      <MenuOptions customStyles={optionsStyles}>
        {user ? (
          // Menu jika sudah login
          <MenuOption value="logout">
            <Text style={styles.menuText}>Logout</Text>
          </MenuOption>
        ) : (
          // Menu jika belum login
          <>
            <MenuOption value="login">
              <Text style={styles.menuText}>Login</Text>
            </MenuOption>
            <MenuOption value="signup">
              <Text style={styles.menuText}>Daftar Akun</Text>
            </MenuOption>
          </>
        )}
      </MenuOptions>
    </Menu>
  );
}

// Style untuk pop-up menu
const optionsStyles = {
  optionsContainer: {
    borderRadius: 8,
    padding: 5,
  },
};

const styles = StyleSheet.create({
  menuText: {
    fontSize: 16,
    padding: 5,
  },
});
