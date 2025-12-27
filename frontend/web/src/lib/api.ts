import axios, { type AxiosInstance, type AxiosResponse } from "axios";

type StoredAuth = {
  token?: string;
  user?: unknown;
};

const getToken = (): string | null => {
  try {
    // New storage: token only
    const tokenOnly = localStorage.getItem("securityToken");
    if (typeof tokenOnly === "string" && tokenOnly.trim()) return tokenOnly;

    // Backward compatibility: older storage shape
    const raw = localStorage.getItem("securityAuth");
    if (raw) {
      const parsed = JSON.parse(raw) as StoredAuth;
      if (typeof parsed?.token === "string" && parsed.token.trim()) return parsed.token;
    }

    // Backward compatibility with older storage shape
    const legacy = localStorage.getItem("securityUser");
    if (legacy) {
      const parsed = JSON.parse(legacy) as any;
      if (typeof parsed?.token === "string" && parsed.token.trim()) return parsed.token;
    }
  } catch {
    // ignore
  }

  return null;
};

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // Axios v1 headers typing can be AxiosHeaders; cast for compatibility.
      (config.headers as any) = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const originalRequest = error?.config as any;

    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("securityToken");
      localStorage.removeItem("securityAuth");
      localStorage.removeItem("securityUser");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
