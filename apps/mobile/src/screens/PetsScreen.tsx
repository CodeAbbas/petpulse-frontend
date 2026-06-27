import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { Pet, petsApi } from "../lib/api";

interface PetsScreenProps {
  onAddPet: () => void;
}

/**
 * The owner's home screen: their pets, and a live feed of behavioural
 * alerts received via push (from NotificationContext, populated by
 * foreground pushes and killed-state cold starts).
 */
export function PetsScreen({ onAddPet }: PetsScreenProps) {
  const { user, logout } = useAuth();
  const { alerts, clearAlerts } = useNotifications();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPets = useCallback(async () => {
    setError(null);
    try {
      const result = await petsApi.list();
      setPets(result);
    } catch {
      setError("Could not load your pets.");
    }
  }, []);

  useEffect(() => {
    void loadPets().finally(() => setLoading(false));
  }, [loadPets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPets();
    setRefreshing(false);
  }, [loadPets]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello{user ? `, ${user.name}` : ""}</Text>
          <Text style={styles.subgreeting}>Your pets and recent alerts</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </View>

      {/* ── Live alerts feed ── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        {alerts.length > 0 && (
          <Pressable onPress={clearAlerts}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No alerts yet. You're all caught up.</Text>
        </View>
      ) : (
        alerts.map((alert) => (
          <View key={alert.event_id} style={styles.alertCard}>
            <View
              style={[
                styles.severityDot,
                {
                  backgroundColor:
                    alert.severity === "critical" ? "#ef4444" : "#fbbf24",
                },
              ]}
            />
            <View style={styles.alertBody}>
              <Text style={styles.alertText}>{alert.body}</Text>
              <Text style={styles.alertMeta}>
                {alert.event_type} ·{" "}
                {new Date(alert.received_at).toLocaleTimeString()}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* ── Pets list ── */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>My pets</Text>
        <Pressable onPress={onAddPet} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#0ea5e9" style={{ marginTop: 20 }} />
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : pets.length === 0 ? (
        <Pressable onPress={onAddPet} style={styles.emptyCard}>
          <Text style={styles.emptyText}>No pets yet — tap to add your first.</Text>
        </Pressable>
      ) : (
        pets.map((pet) => (
          <View key={pet.id} style={styles.petCard}>
            <View style={styles.petAvatar}>
              <Text style={styles.petAvatarText}>
                {pet.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petMeta}>
                {pet.breed ?? pet.species}
                {pet.age_years != null ? ` · ${pet.age_years}y` : ""}
              </Text>
            </View>
            {pet.metrics.current_weight_kg != null && (
              <View style={styles.petMetric}>
                <Text style={styles.petMetricValue}>
                  {pet.metrics.current_weight_kg}
                </Text>
                <Text style={styles.petMetricLabel}>kg</Text>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04060e" },
  content: { padding: 20, gap: 14, paddingBottom: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  greeting: { color: "#f1f5f9", fontSize: 22, fontWeight: "700" },
  subgreeting: { color: "#64748b", fontSize: 13, marginTop: 2 },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  logoutText: { color: "#94a3b8", fontSize: 13 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  sectionTitle: {
    color: "#cbd5e1",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clearText: { color: "#0ea5e9", fontSize: 13 },
  addBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(14,165,233,0.15)",
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  addBtnText: { color: "#0ea5e9", fontSize: 13, fontWeight: "600" },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  emptyText: { color: "#64748b", fontSize: 14 },
  errorCard: {
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.20)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  errorText: { color: "#ef4444", fontSize: 13 },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  severityDot: { width: 10, height: 10, borderRadius: 5 },
  alertBody: { flex: 1 },
  alertText: { color: "#f1f5f9", fontSize: 14, fontWeight: "500" },
  alertMeta: { color: "#64748b", fontSize: 12, marginTop: 2 },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(14,165,233,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  petAvatarText: { color: "#0ea5e9", fontSize: 18, fontWeight: "700" },
  petInfo: { flex: 1 },
  petName: { color: "#f1f5f9", fontSize: 16, fontWeight: "600" },
  petMeta: { color: "#64748b", fontSize: 13, marginTop: 2, textTransform: "capitalize" },
  petMetric: { alignItems: "flex-end" },
  petMetricValue: { color: "#a78bfa", fontSize: 18, fontWeight: "700" },
  petMetricLabel: { color: "#64748b", fontSize: 11 },
});