import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BehavioralAlert, useNotifications } from "../context/NotificationContext";

/**
 * Behavioural Events screen (FR-07).
 *
 * The dedicated, persistent view a notification tap deep-links into. The
 * most recent critical alert is rendered as a high-contrast banner pinned
 * to the top, ensuring the incident stays salient hours after the push
 * (per the AT2 UX spec). When opened via deep-link, the targeted alert is
 * briefly highlighted.
 */
export function AlertsScreen({ deepLinkEventId }: { deepLinkEventId?: string | null }) {
  const { alerts, clearAlerts } = useNotifications();

  // Most recent critical alert drives the persistent banner.
  const headline = alerts.find((a) => a.severity === "critical") ?? alerts[0] ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Behavioural Alerts</Text>
          <Text style={styles.subtitle}>
            {alerts.length === 0
              ? "No events recorded"
              : `${alerts.length} event${alerts.length === 1 ? "" : "s"} logged`}
          </Text>
        </View>
        {alerts.length > 0 && (
          <Pressable onPress={clearAlerts} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {/* High-contrast persistent banner for the latest critical incident. */}
      {headline && headline.severity === "critical" && (
        <View style={styles.banner}>
          <View style={styles.bannerPulse} />
          <View style={styles.bannerBody}>
            <Text style={styles.bannerLabel}>ACTIVE ALERT</Text>
            <Text style={styles.bannerText}>{headline.body}</Text>
            <Text style={styles.bannerMeta}>
              {formatEventType(headline.event_type)} ·{" "}
              {new Date(headline.received_at).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      )}

      {alerts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🐾</Text>
          <Text style={styles.emptyText}>No behavioural events yet.</Text>
          <Text style={styles.emptySub}>
            You'll be alerted here when the monitor detects unusual behaviour.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          <Text style={styles.sectionTitle}>Event history</Text>
          {alerts.map((alert) => (
            <AlertRow
              key={alert.event_id}
              alert={alert}
              highlighted={alert.event_id === deepLinkEventId}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function AlertRow({
  alert,
  highlighted,
}: {
  alert: BehavioralAlert;
  highlighted: boolean;
}) {
  // Briefly flash the deep-linked row so a tapped notification is obvious.
  const flash = useRef(new Animated.Value(highlighted ? 1 : 0)).current;

  useEffect(() => {
    if (highlighted) {
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.delay(1400),
        Animated.timing(flash, { toValue: 0, duration: 600, useNativeDriver: false }),
      ]).start();
    }
  }, [highlighted, flash]);

  const backgroundColor = flash.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.05)", "rgba(14,165,233,0.18)"],
  });

  const isCritical = alert.severity === "critical";

  return (
    <Animated.View style={[styles.row, { backgroundColor }]}>
      <View
        style={[
          styles.severityDot,
          { backgroundColor: isCritical ? "#ef4444" : "#fbbf24" },
        ]}
      />
      <View style={styles.rowBody}>
        <Text style={styles.rowText}>{alert.body}</Text>
        <Text style={styles.rowMeta}>
          {formatEventType(alert.event_type)} ·{" "}
          {new Date(alert.received_at).toLocaleString()}
        </Text>
      </View>
      <View
        style={[
          styles.severityBadge,
          isCritical ? styles.severityBadgeCritical : styles.severityBadgeWarn,
        ]}
      >
        <Text
          style={[
            styles.severityBadgeText,
            { color: isCritical ? "#fca5a5" : "#fcd34d" },
          ]}
        >
          {alert.severity}
        </Text>
      </View>
    </Animated.View>
  );
}

function formatEventType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04060e" },
  content: { padding: 20, gap: 16, paddingBottom: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { color: "#f1f5f9", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 2 },
  clearBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  clearText: { color: "#94a3b8", fontSize: 13 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderColor: "#ef4444",
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
  },
  bannerPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
  },
  bannerBody: { flex: 1, gap: 2 },
  bannerLabel: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  bannerText: { color: "#f1f5f9", fontSize: 15, fontWeight: "600" },
  bannerMeta: { color: "#94a3b8", fontSize: 12 },
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
  list: { gap: 10 },
  sectionTitle: {
    color: "#cbd5e1",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  severityDot: { width: 10, height: 10, borderRadius: 5 },
  rowBody: { flex: 1, gap: 2 },
  rowText: { color: "#f1f5f9", fontSize: 14, fontWeight: "500" },
  rowMeta: { color: "#64748b", fontSize: 12 },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  severityBadgeCritical: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.30)",
    borderWidth: 1,
  },
  severityBadgeWarn: {
    backgroundColor: "rgba(251,191,36,0.15)",
    borderColor: "rgba(251,191,36,0.30)",
    borderWidth: 1,
  },
  severityBadgeText: { fontSize: 11, fontWeight: "600", textTransform: "capitalize" },
});