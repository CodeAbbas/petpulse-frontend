import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Notifications from "expo-notifications";
import { useAuth } from "./AuthContext";
import {
  ensureNotificationChannel,
  getInitialNotification,
  registerForPushNotifications,
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
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState<BehavioralAlert[]>([]);
  const receivedSub = useRef<Notifications.Subscription | null>(null);
  const responseSub = useRef<Notifications.Subscription | null>(null);
  const coldStartHandled = useRef(false);

  const pushAlert = useCallback((notification: Notifications.Notification) => {
    const data = notification.request.content.data as Record<string, string>;
    if (!data?.event_id) return;

    setAlerts((prev) => [
      {
        event_id: data.event_id,
        pet_id: data.pet_id ?? "",
        event_type: data.event_type ?? "unknown",
        severity: data.severity ?? "info",
        body: notification.request.content.body ?? "New alert",
        received_at: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  // ── On mount: create channel + handle killed-state cold start ──
  useEffect(() => {
    // Channel MUST exist before any notification can display on Android 8+.
    void ensureNotificationChannel();

    // If the app was launched by tapping a push (killed state), retrieve
    // it here — the live listeners below only catch notifications that
    // arrive while JS is already running.
    if (!coldStartHandled.current) {
      coldStartHandled.current = true;
      void getInitialNotification().then((data) => {
        if (data?.event_id) {
          setAlerts((prev) => [
            {
              event_id: data.event_id,
              pet_id: data.pet_id ?? "",
              event_type: data.event_type ?? "unknown",
              severity: data.severity ?? "info",
              body: data.body ?? "Behavioral alert detected",
              received_at: Date.now(),
            },
            ...prev,
          ]);
        }
      });
    }
  }, []);

  // Sync the FCM token once authenticated, and keep it synced on refresh.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Boot sync: push the current native token to the backend.
    void syncFcmToken();

    // Subscribe to token rotation so the DB never holds a stale token.
    const unsubscribe = registerTokenRefreshHandler();
    return unsubscribe;
  }, [isAuthenticated]);

  // Foreground + interaction listeners (for non-cold-start taps).
  useEffect(() => {
    receivedSub.current = Notifications.addNotificationReceivedListener(pushAlert);
    responseSub.current = Notifications.addNotificationResponseReceivedListener(
      (response) => pushAlert(response.notification),
    );

    return () => {
      receivedSub.current?.remove();
      responseSub.current?.remove();
    };
  }, [pushAlert]);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return (
    <NotificationContext.Provider value={{ alerts, clearAlerts }}>
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