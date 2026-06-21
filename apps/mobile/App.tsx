import React, { useEffect } from "react";
import { StyleSheet, StatusBar, Alert } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// Import the modular API methods explicitly
import { 
  getMessaging, 
  setBackgroundMessageHandler, 
  requestPermission, 
  getToken, 
  onMessage,
  AuthorizationStatus 
} from '@react-native-firebase/messaging';
import { AuthProvider } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { DebugScreen } from "./src/screens/DebugScreen";

const messagingInstance = getMessaging();

// 🚨 Headless Background Handler (Modular Syntax)
setBackgroundMessageHandler(messagingInstance, async remoteMessage => {
  console.log('Message handled in the background/quit state!', remoteMessage);
});

export default function App() {
  const demoPetId = "9db449be-4698-43fa-9dcc-7b3f81b89ff8";
  const demoPetName = "Luna";

  useEffect(() => {
    async function setupFirebase() {
      // Request permissions using modular function
      const authStatus = await requestPermission(messagingInstance);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // Fetch the Token using modular function
        const token = await getToken(messagingInstance);
        console.log('🚀 NATIVE FCM TOKEN:', token);
      }
    }

    setupFirebase();

    // Foreground listener using modular function
    const unsubscribe = onMessage(messagingInstance, async remoteMessage => {
      console.log('A new FCM message arrived in foreground!', remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title || "Alert",
        remoteMessage.notification?.body || "New event recorded."
      );
    });

    return unsubscribe; 
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <SafeAreaView style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#04060e" />
            <DebugScreen petId={demoPetId} petName={demoPetName} />
          </SafeAreaView>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#04060e",
  },
});