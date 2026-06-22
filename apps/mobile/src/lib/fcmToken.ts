import messaging from "@react-native-firebase/messaging";
import { api } from "./api";

/**
 * Fetch the current native FCM token from the Firebase SDK and sync it
 * to the Laravel backend after checking runtime permissions.
 */
export async function syncFcmToken(): Promise<string | null> {
  try {
    // 🚨 1. Request notification permission (Android 13+ runtime grant check)
    const authStatus = await messaging().requestPermission();
    const granted =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!granted) {
      console.warn("Notification permission not granted.");
      return null;
    }

    // 2. Register device for remote messages (Required for iOS, safe cross-platform no-op for Android)
    await messaging().registerDeviceForRemoteMessages();

    // 3. Fetch native token
    const token = await messaging().getToken();
    if (!token) {
      return null;
    }

    // 4. Safely push to Sanctum-protected route
    await api.post("/auth/fcm-token", { fcm_token: token });
    return token;
  } catch (error) {
    console.warn("Non-fatal: Failed to sync FCM token:", error);
    return null;
  }
}

/**
 * Listen for token rotations (app reinstalls, periodic security updates from Google).
 */
export function registerTokenRefreshHandler(): () => void {
  return messaging().onTokenRefresh(async (token: string) => {
    try {
      await api.post("/auth/fcm-token", { fcm_token: token });
    } catch {
      // Non-fatal; will re-sync on next app boot sequence
    }
  });
}