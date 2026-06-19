import React, { useEffect } from "react"; // Added useEffect import here
import { SafeAreaView, StyleSheet, StatusBar } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { DebugScreen } from "./src/screens/DebugScreen";
import * as Notifications from 'expo-notifications';

export default function App() {
  const demoPetId = "9db449be-4698-43fa-9dcc-7b3f81b89ff8";
  const demoPetName = "Luna";

  // Placed hooks safely inside the functional component body
  useEffect(() => {
    async function getDebugFcmToken() {
      try {
        // Pulls the native device registration token from the Firebase client wrapper
        const tokenData = await Notifications.getDevicePushTokenAsync();
        console.log("=================================================");
        console.log("🔥 YOUR REAL DEVICE FCM TOKEN IS:");
        console.log(tokenData.data);
        console.log("=================================================");
      } catch (error) {
        console.log("❌ Failed to fetch native device token:", error);
      }
    }

    getDebugFcmToken();
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="light-content" backgroundColor="#04060e" />
          <DebugScreen petId={demoPetId} petName={demoPetName} />
        </SafeAreaView>
      </NotificationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#04060e",
  },
});