import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../lib/api";

/**
 * AT3 Demonstration Simulation Controller.
 *
 * Fires an authentic behavioural-event payload at the Laravel webhook so
 * the full FCM push loop can be demonstrated on-stage without a live pet
 * in front of a camera. The payload mirrors exactly what the Python edge
 * service emits.
 */

interface SimResult {
  ok: boolean;
  message: string;
  at: number;
}

const EVENT_TYPES = ["pacing", "prolonged_waiting", "vocalization"] as const;
type EventType = (typeof EVENT_TYPES)[number];

// A UUID v4 generator (no external dependency needed for the demo panel).
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface DebugScreenProps {
  /** The pet whose context drives the simulated event. */
  petId: string;
  petName: string;
}

export function DebugScreen({ petId, petName }: DebugScreenProps) {
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<EventType>("pacing");
  const [log, setLog] = useState<SimResult[]>([]);

  async function triggerMockEvent() {
    setBusy(true);

    const payload = {
      event_id: uuidv4(),
      pet_id: petId,
      event_type: selected,
      severity: selected === "pacing" ? "critical" : "warning",
      confidence_score: 0.85,
      recorded_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(process.env.EXPO_PUBLIC_WEBHOOK_URL ?? "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": process.env.EXPO_PUBLIC_WEBHOOK_SECRET ?? ""
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setLog((prev) => [
          { ok: true, message: `Dispatched "${selected}" for ${petName}`, at: Date.now() },
          ...prev,
        ]);
      } else {
        const errorText = await response.text();
        setLog((prev) => [
          { ok: false, message: `Server Error (${response.status}): ${errorText}`, at: Date.now() },
          ...prev,
        ]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setLog((prev) => [
        { ok: false, message: `Failed: ${message}`, at: Date.now() },
        ...prev,
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.panel}>
        <Text style={styles.title}>Simulation Controller</Text>
        <Text style={styles.subtitle}>
          AT3 demonstration · fires a mock event at the Laravel webhook
        </Text>

        <Text style={styles.label}>Event type</Text>
        <View style={styles.chipRow}>
          {EVENT_TYPES.map((type) => (
            <Pressable
              key={type}
              onPress={() => setSelected(type)}
              style={[styles.chip, selected === type && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, selected === type && styles.chipTextActive]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.context}>
          Target pet: <Text style={styles.contextValue}>{petName}</Text>
        </Text>

        <Pressable
          onPress={triggerMockEvent}
          disabled={busy}
          style={[styles.button, busy && styles.buttonDisabled]}
        >
          {busy ? (
            <ActivityIndicator color="#04060e" />
          ) : (
            <Text style={styles.buttonText}>Trigger Mock Separation Anxiety Event</Text>
          )}
        </Pressable>
      </View>

      {log.length > 0 && (
        <View style={styles.panel}>
          <Text style={styles.label}>Dispatch log</Text>
          {log.map((entry) => (
            <View key={entry.at} style={styles.logRow}>
              <View
                style={[styles.dot, { backgroundColor: entry.ok ? "#22c55e" : "#ef4444" }]}
              />
              <Text style={styles.logText}>{entry.message}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04060e" },
  content: { padding: 20, gap: 16 },
  panel: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  title: { color: "#f1f5f9", fontSize: 20, fontWeight: "700" },
  subtitle: { color: "#94a3b8", fontSize: 13 },
  label: {
    color: "#cbd5e1",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  chipActive: { backgroundColor: "rgba(14,165,233,0.15)", borderColor: "#0ea5e9" },
  chipText: { color: "#94a3b8", fontSize: 13 },
  chipTextActive: { color: "#0ea5e9", fontWeight: "600" },
  context: { color: "#94a3b8", fontSize: 14, marginTop: 4 },
  contextValue: { color: "#a78bfa", fontWeight: "600" },
  button: {
    backgroundColor: "#0ea5e9",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#04060e", fontSize: 15, fontWeight: "700" },
  logRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  logText: { color: "#cbd5e1", fontSize: 13, flex: 1 },
});