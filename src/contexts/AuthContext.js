import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Panggil onAuthStateChanged langsung dari instance auth()
    const subscriber = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await firestore()
          .collection("users")
          .doc(firebaseUser.uid)
          .get();
        if (userDoc.exists) {
          setUserInfo(userDoc.data());
        }
      } else {
        setUserInfo(null);
      }
      setIsLoading(false);
    });
    return subscriber;
  }, []);

  async function signIn(email, password) {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      Alert.alert("Login Gagal", error.message);
    }
  }

  async function signUp(email, password, nama) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );
      await firestore().collection("users").doc(userCredential.user.uid).set({
        nama: nama,
        email: email,
        isAdmin: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      Alert.alert("Pendaftaran Gagal", error.message);
    }
  }

  async function signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      Alert.alert("Logout Gagal", error.message);
    }
  }

  const value = { user, userInfo, isLoading, signIn, signUp, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};
