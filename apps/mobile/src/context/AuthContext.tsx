import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  authApi,
  AuthUser,
  registerUnauthorizedHandler,
  tokenStore,
} from "../lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  // Hydrate session on mount: if a token exists, fetch the user.
  useEffect(() => {
    registerUnauthorizedHandler(clearSession);

    (async () => {
      try {
        const token = await tokenStore.get();
        if (token) {
          const hydratedUser = await authApi.me();
          setUser(hydratedUser);
        }
      } catch {
        await tokenStore.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser, token } = await authApi.login(email, password);
    await tokenStore.set(token);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      passwordConfirmation: string,
    ) => {
      const { user: newUser, token } = await authApi.register(
        name,
        email,
        password,
        passwordConfirmation,
      );
      await tokenStore.set(token);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the network call fails, clear the local session.
    } finally {
      await tokenStore.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}