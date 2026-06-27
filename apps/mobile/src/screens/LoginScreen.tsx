import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

/**
 * Minimal authentication screen. Toggles between login and register
 * against the Sanctum endpoints wired in AuthContext. On success,
 * AuthContext flips isAuthenticated and AppTabs swaps this screen out.
 */
export function LoginScreen() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, confirm);
      }
    } catch (e) {
      setError(
        mode === "login"
          ? "Login failed. Check your email and password."
          : "Registration failed. The email may already be in use.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Text style={styles.brandMark}>PetPulse</Text>
          <Text style={styles.brandSub}>Owner companion</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.tabRow}>
            <Pressable
              onPress={() => setMode("login")}
              style={[styles.tab, mode === "login" && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === "login" && styles.tabTextActive]}>
                Sign in
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("register")}
              style={[styles.tab, mode === "register" && styles.tabActive]}
            >
              <Text
                style={[styles.tabText, mode === "register" && styles.tabTextActive]}
              >
                Register
              </Text>
            </Pressable>
          </View>

          {mode === "register" && (
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Sarah Mitchell"
                placeholderTextColor="#475569"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#475569"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              secureTextEntry
            />
          </View>

          {mode === "register" && (
            <View style={styles.field}>
              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                style={styles.input}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry
              />
            </View>
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            onPress={submit}
            disabled={busy}
            style={[styles.button, busy && styles.buttonDisabled]}
          >
            {busy ? (
              <ActivityIndicator color="#04060e" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === "login" ? "Sign in" : "Create account"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#04060e" },
  content: { padding: 24, paddingTop: 80, gap: 28 },
  brand: { alignItems: "center", gap: 4 },
  brandMark: { color: "#0ea5e9", fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  brandSub: { color: "#64748b", fontSize: 14 },
  panel: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  tabActive: { backgroundColor: "rgba(14,165,233,0.15)" },
  tabText: { color: "#64748b", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#0ea5e9" },
  field: { gap: 6 },
  label: {
    color: "#cbd5e1",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: "#f1f5f9",
    fontSize: 15,
  },
  error: { color: "#ef4444", fontSize: 13 },
  button: {
    backgroundColor: "#0ea5e9",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#04060e", fontSize: 15, fontWeight: "700" },
});