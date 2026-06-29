import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { HealthRecord, healthRecordsApi } from "../lib/api";

/**
 * Health Records (FR-03 visibility on mobile).
 *
 * Lists the owner's pets' health records, each showing the BMI and BMR
 * that the Laravel BiometricCalculator computed server-side. The mobile
 * client never computes these — it displays what the API returned, which
 * is the whole point of FR-03 (server-side biometric computation).
 */
export function HealthScreen() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await healthRecordsApi.list();
      // Newest first.
      result.sort(
        (a, b) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime(),
      );
      setRecords(result);
    } catch {
      setError("Could not load health records.");
    }
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Health Records</Text>
        <Text style={styles.subtitle}>
          BMI & BMR computed by the server from logged vitals
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#0ea5e9" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No health records yet.</Text>
          <Text style={styles.emptySub}>
            Records logged at the clinic appear here with computed metrics.
          </Text>
        </View>
      ) : (
        records.map((record) => (
          <View key={record.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.petName}>{record.pet.name ?? "Pet"}</Text>
                <Text style={styles.recordType}>
                  {formatType(record.record_type)} ·{" "}
                  {new Date(record.recorded_at).toLocaleDateString()}
                </Text>
              </View>
              {record.vitals.weight_kg != null && (
                <View style={styles.weightChip}>
                  <Text style={styles.weightValue}>{record.vitals.weight_kg}</Text>
                  <Text style={styles.weightUnit}>kg</Text>
                </View>
              )}
            </View>

            <Text style={styles.summary}>{record.summary}</Text>

            {/* Server-computed metrics — the FR-03 proof. */}
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>BMI</Text>
                <Text style={styles.metricValue}>
                  {record.computed_metrics.bmi != null
                    ? record.computed_metrics.bmi.toFixed(2)
                    : "—"}
                </Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>BMR</Text>
                <Text style={styles.metricValue}>
                  {record.computed_metrics.bmr_kcal != null
                    ? `${record.computed_metrics.bmr_kcal.toFixed(0)}`
                    : "—"}
                  {record.computed_metrics.bmr_kcal != null && (
                    <Text style={styles.metricUnit}> kcal/d</Text>
                  )}
                </Text>
              </View>
            </View>

            {/* Secondary vitals if present. */}
            {(record.vitals.height_cm != null ||
              record.vitals.temperature_c != null ||
              record.vitals.heart_rate_bpm != null) && (
              <View style={styles.vitalsRow}>
                {record.vitals.height_cm != null && (
                  <Text style={styles.vital}>↕ {record.vitals.height_cm} cm</Text>
                )}
                {record.vitals.temperature_c != null && (
                  <Text style={styles.vital}>🌡 {record.vitals.temperature_c}°C</Text>
                )}
                {record.vitals.heart_rate_bpm != null && (
                  <Text style={styles.vital}>♥ {record.vitals.heart_rate_bpm} bpm</Text>
                )}
              </View>
            )}

            {record.detail && <Text style={styles.detail}>{record.detail}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function formatType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04060e" },
  content: { padding: 20, gap: 14, paddingBottom: 60 },
  header: { marginBottom: 2 },
  title: { color: "#f1f5f9", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  petName: { color: "#f1f5f9", fontSize: 17, fontWeight: "700" },
  recordType: { color: "#64748b", fontSize: 12, marginTop: 2 },
  weightChip: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
    backgroundColor: "rgba(167,139,250,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  weightValue: { color: "#a78bfa", fontSize: 16, fontWeight: "700" },
  weightUnit: { color: "#a78bfa", fontSize: 11 },
  summary: { color: "#cbd5e1", fontSize: 14 },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(14,165,233,0.08)",
    borderColor: "rgba(14,165,233,0.20)",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  metric: { flex: 1, alignItems: "center", gap: 2 },
  metricDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.10)" },
  metricLabel: {
    color: "#0ea5e9",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  metricValue: { color: "#f1f5f9", fontSize: 22, fontWeight: "700" },
  metricUnit: { color: "#64748b", fontSize: 12, fontWeight: "400" },
  vitalsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  vital: { color: "#94a3b8", fontSize: 13 },
  detail: {
    color: "#94a3b8",
    fontSize: 13,
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 10,
  },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  emptyIcon: { fontSize: 32 },
  emptyText: { color: "#cbd5e1", fontSize: 15, fontWeight: "600" },
  emptySub: { color: "#64748b", fontSize: 13, textAlign: "center", lineHeight: 18 },
  errorCard: {
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.20)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  errorText: { color: "#ef4444", fontSize: 13 },
});