import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { AddPetScreen } from "../screens/AddPetScreen";
import { AlertsScreen } from "../screens/AlertsScreen";
import { HealthScreen } from "../screens/HealthScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { PetsScreen } from "../screens/PetsScreen";
import { TriageScreen } from "../screens/TriageScreen";

/**
 * The owner application shell.
 *
 * Auth gate first: spinner while hydrating, LoginScreen when logged out.
 * Once authenticated, a zero-dependency bottom tab bar switches between
 * Pets (with an add-pet sub-flow), Health (FR-03 records), Alerts (FR-07),
 * and Triage (FR-08).
 *
 * When a push notification is tapped, NotificationContext sets
 * pendingDeepLink; this component watches it and switches to the Alerts
 * tab automatically, satisfying the AT2 deep-link requirement.
 */
type Tab = "pets" | "health" | "alerts" | "triage";
type PetsSubScreen = "list" | "addPet";

export function AppTabs() {
  const { isAuthenticated, isLoading } = useAuth();
  const { alerts, pendingDeepLink, consumeDeepLink } = useNotifications();

  const [tab, setTab] = useState<Tab>("pets");
  const [petsSub, setPetsSub] = useState<PetsSubScreen>("list");
  const [refreshKey, setRefreshKey] = useState(0);
  const [deepLinkTarget, setDeepLinkTarget] = useState<string | null>(null);

  const goToAddPet = useCallback(() => setPetsSub("addPet"), []);
  const goToPetsList = useCallback(() => setPetsSub("list"), []);

  const handleCreated = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setPetsSub("list");
  }, []);

  // Deep-link: a tapped notification switches to the Alerts tab.
  useEffect(() => {
    if (pendingDeepLink) {
      setTab("alerts");
      setPetsSub("list");
      setDeepLinkTarget(pendingDeepLink);
      consumeDeepLink();
    }
  }, [pendingDeepLink, consumeDeepLink]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#0ea5e9" size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  if (tab === "pets" && petsSub === "addPet") {
    return <AddPetScreen onCreated={handleCreated} onCancel={goToPetsList} />;
  }

  const alertCount = alerts.length;

  return (
    <View style={styles.shell}>
      <View style={styles.screen}>
        {tab === "pets" && <PetsScreen key={refreshKey} onAddPet={goToAddPet} />}
        {tab === "health" && <HealthScreen />}
        {tab === "alerts" && <AlertsScreen deepLinkEventId={deepLinkTarget} />}
        {tab === "triage" && <TriageScreen />}
      </View>

      <View style={styles.tabBar}>
        <TabButton label="Pets" active={tab === "pets"} onPress={() => setTab("pets")} />
        <TabButton label="Health" active={tab === "health"} onPress={() => setTab("health")} />
        <TabButton
          label="Alerts"
          active={tab === "alerts"}
          onPress={() => setTab("alerts")}
          badge={alertCount > 0 ? alertCount : undefined}
        />
        <TabButton
          label="Triage"
          active={tab === "triage"}
          onPress={() => setTab("triage")}
          accent="#ef4444"
        />
      </View>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
  accent = "#0ea5e9",
  badge,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accent?: string;
  badge?: number;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabBtn}>
      <View
        style={[
          styles.tabIndicator,
          { backgroundColor: active ? accent : "transparent" },
        ]}
      />
      <View style={styles.tabLabelRow}>
        <Text style={[styles.tabLabel, active && { color: accent }]}>{label}</Text>
        {badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? "9+" : badge}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#04060e",
    alignItems: "center",
    justifyContent: "center",
  },
  shell: { flex: 1, backgroundColor: "#04060e" },
  screen: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    backgroundColor: "#04060e",
    paddingBottom: 8,
  },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12, gap: 6 },
  tabIndicator: { width: 28, height: 3, borderRadius: 2 },
  tabLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  tabLabel: { color: "#64748b", fontSize: 12, fontWeight: "600" },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});