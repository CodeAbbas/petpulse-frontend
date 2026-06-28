import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { useAuth } from "./AuthContext";
import { ensureNotificationChannel } from "../lib/notifications";
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
   * screen. Consumers call consumeDeepLink() after routing so it fires once.
   */
  pendingDeepLink: string | null;
  consumeDeepLink: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

/**
 * Build a BehavioralAlert from an FCM RemoteMessage's data block.
 * The backend FcmService sends { event_id, pet_id, event_type, severity }
 * in `data`, and title/body in `notification`.
 */
function alertFromRemoteMessage(
  message: FirebaseMessagingTypes.RemoteMessage,
): BehavioralAlert | null {
  const data = (message.data ?? {}) as Record<string, string>;
  if (!data.event_id) return null;
  return {
    event_id: data.event_id,
    pet_id: data.pet_id ?? "",
    event_type: data.event_type ?? "unknown",
    severity: data.severity ?? "info",
    body: message.notification?.body ?? data.body ?? "Behavioral alert detected",
    received_at: Date.now(),
  };
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<BehavioralAlert[]>([]);
  const [pendingDeepLink, setPendingDeepLink] = useState<string | null>(null);
  const coldStartHandled = useRef(false);

  const addAlert = useCallback((alert: BehavioralAlert) => {
    setAlerts((prev) => {
      // De-dupe: a tapped notification can also have fired the foreground
      // listener earlier, and retries share an event_id.
      if (prev.some((a) => a.event_id === alert.event_id)) return prev;
      return [alert, ...prev];
    });
  }, []);

  // ── On mount: create channel + handle killed-state cold start ──
  useEffect(() => {
    void ensureNotificationChannel();

    // Firebase: if the app was launched from a KILLED state by tapping an
    // FCM notification, getInitialNotification() returns it once. A cold
    // start IS a tap, so we deep-link to it.
    if (!coldStartHandled.current) {
      coldStartHandled.current = true;
      void messaging()
        .getInitialNotification()
        .then((message) => {
          if (!message) return;
          const alert = alertFromRemoteMessage(message);
          if (alert) {
            addAlert(alert);
            setPendingDeepLink(alert.event_id);
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

  // ── FCM listeners (all via Firebase — the channel the backend sends to) ──
  useEffect(() => {
    // 1. FOREGROUND: message arrives while the app is open. Update state.
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      console.log("🔥 FOREGROUND FCM:", JSON.stringify(remoteMessage?.data));
      const alert = alertFromRemoteMessage(remoteMessage);
      if (alert) {
        addAlert(alert);
      } else {
        console.log("⚠️ FCM drop: no event_id in data block.");
      }
    });

    // 2. BACKGROUND-TAP: app was backgrounded (not killed) and the user
    // tapped the notification. Firebase fires this — Expo's listener would
    // NOT, since these are direct FCM messages. Log AND deep-link.
    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        const alert = alertFromRemoteMessage(remoteMessage);
        if (alert) {
          addAlert(alert);
          setPendingDeepLink(alert.event_id);
        }
      },
    );

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, [addAlert]);

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