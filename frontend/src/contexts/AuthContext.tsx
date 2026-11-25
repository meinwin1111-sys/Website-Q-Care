import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { getStoredAuth, login as loginService, register as registerService } from "../services/authService";

export type UserRole = "customer" | "admin";

export type User = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
};

type UpdateProfilePayload = {
  name: string;
  email: string;
  phone: string;
};

type AuthContextValue = {
  isLoggedIn: boolean;
  role: UserRole;
  loggedInName: string;
  loggedInEmail: string;
  profilePhone: string;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, phone: string, password: string) => Promise<User>;
  logout: () => void;
  updateProfile: (payload: UpdateProfilePayload) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ isLoggedIn, role, loggedInName, loggedInEmail, profilePhone }, setAuthState] = useState(() => {
    const { token, user } = getStoredAuth();

    return {
      isLoggedIn: Boolean(token && user),
      role: user?.role ?? "customer",
      loggedInName: user?.name ?? "",
      loggedInEmail: user?.email ?? "",
      profilePhone: user?.phone ?? "",
    };
  });

  const value = useMemo<AuthContextValue>(() => ({
    isLoggedIn,
    role,
    loggedInName,
    loggedInEmail,
    profilePhone,
    login: async (email, password) => {
      const auth = await loginService(email, password);
      const user = auth.user;
      setAuthState({
        isLoggedIn: true,
        role: user.role,
        loggedInName: user.name,
        loggedInEmail: user.email,
        profilePhone: user.phone ?? "",
      });
      return user;
    },
    register: async (name, email, phone, password) => {
      const auth = await registerService(name, email, phone, password);
      const user = auth.user;
      setAuthState({
        isLoggedIn: true,
        role: user.role,
        loggedInName: user.name,
        loggedInEmail: user.email,
        profilePhone: user.phone ?? "",
      });
      return user;
    },
    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("qcare_token");
        localStorage.removeItem("qcare_user");
      }
      setAuthState({
        isLoggedIn: false,
        role: "customer",
        loggedInName: "",
        loggedInEmail: "",
        profilePhone: "",
      });
    },
    updateProfile: ({ name, email, phone }) => {
      setAuthState((current) => ({
        ...current,
        loggedInName: name,
        loggedInEmail: email,
        profilePhone: phone,
      }));
    },
  }), [isLoggedIn, role, loggedInEmail, loggedInName, profilePhone]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
