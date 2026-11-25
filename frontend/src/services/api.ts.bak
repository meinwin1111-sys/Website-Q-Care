import axios from "axios";

const api = axios.create({
  baseURL: "https://nonchurched-cecille-griseous.ngrok-free.dev/api",
  timeout: 20000,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

function clearStoredAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("qcare_token");
  localStorage.removeItem("qcare_user");
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("qcare_token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearStoredAuth();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
