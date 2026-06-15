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
import { registerForPushNotifications } from "../lib/notifications";

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

  // Register the device token once the user is authenticated.
  useEffect(() => {
    if (isAuthenticated) {
      void registerForPushNotifications();
    }
  }, [isAuthenticated]);

  // Foreground + interaction listeners.
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