import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { api } from "./api";

/**
 * Register the Android notification channel at app startup, before any
 * push can arrive. Must run independently of authentication — a channel
 * referenced by an incoming FCM message must already exist or Android
 * (8.0+) silently drops the notification, including in killed state.
 */
export async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "PetPulse Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0ea5e9",
    });
  }
}

// Foreground display behaviour: show the alert even when the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request permission and fetch the device push token, then register it
 * with the Laravel backend. Returns the token or null if unavailable.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push tokens are not available on simulators/emulators.
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "PetPulse Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0ea5e9",
    });
  }

  const tokenResponse = await Notifications.getDevicePushTokenAsync();
  const deviceToken = tokenResponse.data;

  // Register with the backend (Sanctum bearer auto-injected by the interceptor).
  try {
    await api.post("/auth/fcm-token", { fcm_token: deviceToken });
  } catch {
    // Registration failure is non-fatal; the token can be re-sent later.
  }

  return deviceToken;
}
/**
 * Retrieve the notification that cold-started the app from a killed state
 * (user tapped a push while the app was not running). Returns the parsed
 * alert data, or null if the app was launched normally.
 */
export async function getInitialNotification(): Promise<Record<string, string> | null> {
  const response = await Notifications.getLastNotificationResponseAsync();
  if (!response) {
    return null;
  }
  return ((response as any).request?.content?.data ?? (response as any).data ?? {}) as Record<string, string>;
}