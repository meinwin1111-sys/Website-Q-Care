import type { User } from "../types";
import api from "./api";

export type AuthResponse = {
  token: string;
  user: User;
};

function normalizeUser(user: Partial<User> | null | undefined): User {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role === "admin" ? "admin" : "customer",
  };
}

function persistAuth(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("qcare_token", token);
  localStorage.setItem("qcare_user", JSON.stringify(user));
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  const user = normalizeUser(data.user);
  persistAuth(data.token, user);
  return { token: data.token, user };
}

export async function register(name: string, email: string, phone: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, phone, password });
  const user = normalizeUser(data.user);
  persistAuth(data.token, user);
  return { token: data.token, user };
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.put("/auth/change-password", { currentPassword, newPassword });
  return data;
}

export function getStoredAuth() {
  if (typeof window === "undefined") return { token: null as string | null, user: null as User | null };
  const token = localStorage.getItem("qcare_token");
  const userRaw = localStorage.getItem("qcare_user");
  return { token, user: userRaw ? (JSON.parse(userRaw) as User) : null };
}
