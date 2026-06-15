import React from "react";
import { SafeAreaView, StyleSheet, StatusBar } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { DebugScreen } from "./src/screens/DebugScreen";

export default function App() {
  const demoPetId = "9db449be-4698-43fa-9dcc-7b3f81b89ff8";
  const demoPetName = "Luna";

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