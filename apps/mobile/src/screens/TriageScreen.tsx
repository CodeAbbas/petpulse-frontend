import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Location from "expo-location";
import Mapbox, {
  Camera,
  MapView,
  MarkerView,
  PointAnnotation,
} from "@rnmapbox/maps";
import { Clinic, clinicsApi } from "../lib/api";

// Public token (pk....) — safe to ship; rate-limited by Mapbox.
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "");

type LocationState =
  | { status: "resolving" }
  | { status: "granted"; lat: number; lng: number }
  | { status: "denied" }
  | { status: "error" };

/**
 * Smart Triage (FR-08): embedded Mapbox map of 24/7 emergency clinics with
 * the owner's live location, nearest-first list, and one-tap call /
 * directions. Tapping a map pin highlights the matching clinic card.
 */
export function TriageScreen() {
  const [location, setLocation] = useState<LocationState>({ status: "resolving" });
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cameraRef = useRef<Camera>(null);

  const resolveLocation = useCallback(async (): Promise<LocationState> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return { status: "denied" };
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        status: "granted",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch {
      return { status: "error" };
    }
  }, []);

  const loadClinics = useCallback(async (loc: LocationState) => {
    setError(null);
    try {
      const params =
        loc.status === "granted"
          ? { emergency: true, lat: loc.lat, lng: loc.lng }
          : { emergency: true };
      const result = await clinicsApi.list(params);
      setClinics(result);
    } catch {
      setError("Could not load nearby clinics. Check your connection.");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const loc = await resolveLocation();
      if (cancelled) return;
      setLocation(loc);
      await loadClinics(loc);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [resolveLocation, loadClinics]);

  function call(phone: string) {
    void Linking.openURL(`tel:${phone}`);
  }

  function directions(clinic: Clinic) {
    const { latitude, longitude } = clinic.location;
    const label = encodeURIComponent(clinic.name);
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${label}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });
    void Linking.openURL(url);
  }

  function focusClinic(clinic: Clinic) {
    setSelectedId(clinic.id);
    cameraRef.current?.setCamera({
      centerCoordinate: [clinic.location.longitude, clinic.location.latitude],
      zoomLevel: 13,
      animationDuration: 600,
    });
  }

  // Initial camera centre: user location if known, else first clinic, else London.
  const centre: [number, number] =
    location.status === "granted"
      ? [location.lng, location.lat]
      : clinics[0]
        ? [clinics[0].location.longitude, clinics[0].location.latitude]
        : [-0.1278, 51.5074];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Triage</Text>
        <Text style={styles.subtitle}>
          {location.status === "granted"
            ? "24/7 clinics, nearest first"
            : "24/7 emergency clinics"}
        </Text>
      </View>

      {/* ── Embedded Mapbox map ── */}
      {!loading && clinics.length > 0 && (
        <View style={styles.mapWrap}>
          <MapView style={styles.map} styleURL={Mapbox.StyleURL.Dark}>
            <Camera
              ref={cameraRef}
              defaultSettings={{ centerCoordinate: centre, zoomLevel: 11 }}
            />

            {/* User location dot */}
            {location.status === "granted" && (
              <PointAnnotation
                id="user-location"
                coordinate={[location.lng, location.lat]}
              >
                <View style={styles.userDot}>
                  <View style={styles.userDotInner} />
                </View>
              </PointAnnotation>
            )}

            {/* Clinic pins */}
            {clinics.map((clinic) => (
              <MarkerView
                key={clinic.id}
                id={clinic.id}
                coordinate={[clinic.location.longitude, clinic.location.latitude]}
              >
                <Pressable onPress={() => focusClinic(clinic)}>
                  <View
                    style={[
                      styles.pin,
                      selectedId === clinic.id && styles.pinSelected,
                    ]}
                  >
                    <Text style={styles.pinText}>✚</Text>
                  </View>
                </Pressable>
              </MarkerView>
            ))}
          </MapView>
        </View>
      )}

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          In a life-threatening emergency, call the nearest clinic before travelling.
        </Text>
      </View>

      {location.status === "denied" && (
        <View style={styles.locNotice}>
          <Text style={styles.locNoticeText}>
            Location off — clinics shown by rating. Enable location to see the
            nearest first and your position on the map.
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color="#0ea5e9" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : clinics.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No emergency clinics found.</Text>
        </View>
      ) : (
        clinics.map((clinic, index) => (
          <View
            key={clinic.id}
            style={[
              styles.card,
              selectedId === clinic.id && styles.cardSelected,
              index === 0 && location.status === "granted" && styles.cardNearest,
            ]}
          >
            {index === 0 && location.status === "granted" && (
              <View style={styles.nearestTag}>
                <Text style={styles.nearestTagText}>NEAREST</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              {clinic.rating != null && (
                <Text style={styles.rating}>★ {clinic.rating.toFixed(1)}</Text>
              )}
            </View>

            <Text style={styles.address}>
              {clinic.address.line_1}
              {clinic.address.line_2 ? `, ${clinic.address.line_2}` : ""}
              {`, ${clinic.address.city} ${clinic.address.postcode}`}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>24/7 Emergency</Text>
              </View>
              {clinic.distance_km != null && (
                <Text style={styles.distance}>{clinic.distance_km.toFixed(1)} km away</Text>
              )}
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() => call(clinic.phone_e164)}
                style={[styles.actionBtn, styles.callBtn]}
              >
                <Text style={styles.callBtnText}>Call</Text>
              </Pressable>
              <Pressable
                onPress={() => directions(clinic)}
                style={[styles.actionBtn, styles.routeBtn]}
              >
                <Text style={styles.routeBtnText}>Directions</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#04060e" },
  content: { padding: 20, gap: 14, paddingBottom: 60 },
  header: { marginBottom: 2 },
  title: { color: "#f1f5f9", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 2 },
  mapWrap: {
    height: 240,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  map: { flex: 1 },
  userDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(14,165,233,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  userDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0ea5e9",
    borderWidth: 2,
    borderColor: "#fff",
  },
  pin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  pinSelected: {
    backgroundColor: "#0ea5e9",
    transform: [{ scale: 1.15 }],
  },
  pinText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  banner: {
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.25)",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  bannerText: { color: "#fca5a5", fontSize: 13, lineHeight: 18 },
  locNotice: {
    backgroundColor: "rgba(251,191,36,0.10)",
    borderColor: "rgba(251,191,36,0.25)",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  locNoticeText: { color: "#fcd34d", fontSize: 12, lineHeight: 17 },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  cardSelected: { borderColor: "#0ea5e9", borderWidth: 1.5 },
  cardNearest: { borderColor: "#0ea5e9", borderWidth: 1.5 },
  nearestTag: {
    position: "absolute",
    top: -9,
    left: 16,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nearestTagText: { color: "#04060e", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clinicName: { color: "#f1f5f9", fontSize: 16, fontWeight: "700", flex: 1 },
  rating: { color: "#fbbf24", fontSize: 14, fontWeight: "600" },
  address: { color: "#94a3b8", fontSize: 13, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.30)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { color: "#fca5a5", fontSize: 11, fontWeight: "600" },
  distance: { color: "#cbd5e1", fontSize: 13, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  callBtn: { backgroundColor: "#22c55e" },
  callBtnText: { color: "#04060e", fontSize: 14, fontWeight: "700" },
  routeBtn: {
    backgroundColor: "rgba(14,165,233,0.15)",
    borderColor: "#0ea5e9",
    borderWidth: 1,
  },
  routeBtnText: { color: "#0ea5e9", fontSize: 14, fontWeight: "700" },
  emptyCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyText: { color: "#64748b", fontSize: 14 },
  errorCard: {
    backgroundColor: "rgba(239,68,68,0.10)",
    borderColor: "rgba(239,68,68,0.20)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
  },
  errorText: { color: "#ef4444", fontSize: 13 },
});