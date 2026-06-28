import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { useAuth } from "./AuthContext";
import {
  ensureNotificationChannel,
  getInitialNotification,
} from "../lib/notifications";
import { registerTokenRefreshHandler, syncFcmToken } from "../lib/fcmToken";

export interface BehavioralAlert {
  event_id: string;
  pet_id: string;
  event_type: string;
  severity: string;
  body: string;
  received_at: number;
}

interface NotificationContextValue {
  alerts: BehavioralAlert[];
  clearAlerts: () => void;
  /**
   * Set to the event_id when a notification is TAPPED (or launched the app
   * from a killed state). AppTabs watches this to deep-link to the Alerts
   * screen, per the AT2 UX spec. Consumers call consumeDeepLink() after
   * routing so it fires once.
   */
  pendingDeepLink: string | null;
  consumeDeepLink: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<BehavioralAlert[]>([]);
  const [pendingDeepLink, setPendingDeepLink] = useState<string | null>(null);
  const responseSub = useRef<Notifications.Subscription | null>(null);
  const coldStartHandled = useRef(false);

  const addAlert = useCallback((alert: BehavioralAlert) => {
    setAlerts((prev) => {
      // De-dupe: prevent identical event configurations from stacking
      if (prev.some((a) => a.event_id === alert.event_id)) return prev;
      return [alert, ...prev];
    });
  }, []);

  const alertFromNotification = useCallback(
    (notification: Notifications.Notification): BehavioralAlert | null => {
      const data = notification.request.content.data as Record<string, string>;
      if (!data?.event_id) return null;
      return {
        event_id: data.event_id,
        pet_id: data.pet_id ?? "",
        event_type: data.event_type ?? "unknown",
        severity: data.severity ?? "info",
        body: notification.request.content.body ?? "New alert",
        received_at: Date.now(),
      };
    },
    [],
  );

  // ── On mount: create channel + handle killed-state cold start ──
  useEffect(() => {
    void ensureNotificationChannel();

    // If the app was launched by tapping a push (killed state), retrieve it
    // here — and deep-link to it, since a cold start IS a tap.
    if (!coldStartHandled.current) {
      coldStartHandled.current = true;
      void getInitialNotification().then((data) => {
        if (data?.event_id) {
          addAlert({
            event_id: data.event_id,
            pet_id: data.pet_id ?? "",
            event_type: data.event_type ?? "unknown",
            severity: data.severity ?? "info",
            body: data.body ?? "Behavioral alert detected",
            received_at: Date.now(),
          });
          setPendingDeepLink(data.event_id);
        }
      });
    }
  }, [addAlert]);

  // Sync the FCM token once authenticated, and keep it synced on refresh.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    void syncFcmToken();
    const unsubscribe = registerTokenRefreshHandler();
    return unsubscribe;
  }, [isAuthenticated]);

  // Foreground (received) + interaction (tapped) listeners.
  useEffect(() => {
    // 1. Native Firebase Foreground Listener with Telemetry
    const unsubscribeFirebaseForeground = messaging().onMessage(async (remoteMessage) => {
      // 🚨 TELEMETRY LOG: Spits out the exact payload shape arriving from the backend
      console.log("🔥 FOREGROUND FCM RECEIVED:", JSON.stringify(remoteMessage, null, 2));

      const data = remoteMessage.data as Record<string, string>;
      if (!data) {
        console.log("⚠️ FCM Drop: No data payload found in remote message.");
        return;
      }

      console.log("📊 Extracted Payload Data Block:", data);

      if (!data.event_id) {
        console.log("⚠️ FCM Drop: 'event_id' key missing or named differently in data block.");
        return;
      }

      addAlert({
        event_id: data.event_id,
        pet_id: data.pet_id ?? "",
        event_type: data.event_type ?? "unknown",
        severity: data.severity ?? "info",
        body: remoteMessage.notification?.body ?? data.body ?? "Behavioral alert detected",
        received_at: Date.now(),
      });
    });

    // 2. Tap on a notification tray item
    responseSub.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const alert = alertFromNotification(response.notification);
        if (alert) {
          addAlert(alert);
          setPendingDeepLink(alert.event_id);
        }
      },
    );

    return () => {
      unsubscribeFirebaseForeground();
      responseSub.current?.remove();
    };
  }, [addAlert, alertFromNotification]);

  const clearAlerts = useCallback(() => setAlerts([]), []);
  const consumeDeepLink = useCallback(() => setPendingDeepLink(null), []);

  return (
    <NotificationContext.Provider
      value={{ alerts, clearAlerts, pendingDeepLink, consumeDeepLink }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (ctx === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}