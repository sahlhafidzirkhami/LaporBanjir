import firestore from "@react-native-firebase/firestore";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

// Mengatur bagaimana notifikasi ditampilkan saat aplikasi terbuka
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function useNotifications() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Query yang sudah diperbaiki (tanpa filter 'where')
    const queryRef = firestore()
      .collection("alerts")
      .where("waktu", ">", firestore.Timestamp.now());

    const unsubscribe = queryRef.onSnapshot((querySnapshot) => {
      querySnapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const alertBaru = change.doc.data();
          console.log("Peringatan baru terdeteksi:", alertBaru.teks);
          schedulePushNotification(alertBaru.teks);
        }
      });
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notifikasi diterima:", notification);
      });
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Pengguna berinteraksi dengan notifikasi:", response);
      });

    return () => {
      unsubscribe();
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return null;
}

async function schedulePushNotification(bodyText) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🚨 PERINGATAN BENCANA 🚨",
      body:
        bodyText.length > 100 ? `${bodyText.substring(0, 97)}...` : bodyText,
      sound: "default",
    },
    trigger: null,
  });
}

async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Gagal mendapatkan izin untuk notifikasi!");
      return;
    }
  }
}
