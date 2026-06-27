import React, { useEffect, useState } from "react";
import { Alert, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import messaging from "@react-native-firebase/messaging";
import { AuthProvider } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { AppTabs } from "./src/navigation/AppTabs";
import { DebugScreen } from "./src/screens/DebugScreen";

// 🚨 Keep this outside the component lifecycle so MIUI doesn't kill the thread execution path
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Message handled in the background/quit state!", remoteMessage);
});

export default function App() {
  useEffect(() => {
    // Foreground listener handler setup
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("A new FCM message arrived in foreground!", remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title || "Alert",
        remoteMessage.notification?.body || "New event recorded.",
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
            <RootContent />
          </SafeAreaView>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/**
 * Selects what renders. In production (__DEV__ === false) only the real
 * owner application is reachable — the dev shell and Debug panel are
 * excluded at compile time and tree-shaken from the production bundle.
 */
function RootContent() {
  if (__DEV__) {
    return <DevModeShell />;
  }
  return <AppTabs />;
}

// ─── Development-only dual-mode shell ────────────────────────────────────
// Unreachable in production via the __DEV__ guard. A demonstration scaffold
// that lets the presenter switch between the real owner app and the
// Simulation Controller without rebuilding.

function DevModeShell() {
  const [mode, setMode] = useState<"app" | "debug">("app");

  return (
    <View style={styles.flex}>
      {mode === "app" ? (
        <AppTabs />
      ) : (
        <DebugScreen petId={DEMO_PET_ID} petName={DEMO_PET_NAME} />
      )}

      <Pressable
        style={styles.toggle}
        onPress={() => setMode((m) => (m === "app" ? "debug" : "app"))}
      >
        <Text style={styles.toggleText}>{mode === "app" ? "DBG" : "APP"}</Text>
      </Pressable>
    </View>
  );
}

// Fallback pet context for the Debug panel. On the day, create a pet first
// so a real UUID drives the simulated event.
const DEMO_PET_ID = "9db449be-4698-43fa-9dcc-7b3f81b89ff8";
const DEMO_PET_NAME = "Luna";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#04060e" },
  flex: { flex: 1 },
  toggle: {
    position: "absolute",
    bottom: 40,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(167,139,250,0.25)",
    borderColor: "#a78bfa",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleText: { color: "#a78bfa", fontSize: 11, fontWeight: "700" },
});