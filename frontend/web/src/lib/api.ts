import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

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
      const parsed = JSON.parse(legacy) as unknown;
      if (
        parsed &&
        typeof parsed === "object" &&
        "token" in parsed &&
        typeof (parsed as { token?: unknown }).token === "string" &&
        (parsed as { token: string }).token.trim()
      ) {
        return (parsed as { token: string }).token;
      }
    }
  } catch {
    // ignore
  }

  return null;
};

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 30_000,
  // Do not force Content-Type globally.
  // Axios will set the correct boundary for FormData automatically.
  headers: {},
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      const headers = (config.headers ?? {}) as AxiosRequestHeaders;
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    }

    const headers = (config.headers ?? {}) as AxiosRequestHeaders;

    // If sending FormData, let the browser/axios set multipart boundary.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (headers["Content-Type"]) delete headers["Content-Type"];
      if (headers["content-type"]) delete (headers as any)["content-type"];
      config.headers = headers;
      return config;
    }

    // Default JSON Content-Type for typical API calls.
    if (!headers["Content-Type"] && !(headers as any)["content-type"]) {
      headers["Content-Type"] = "application/json";
    }
    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const originalRequest = error?.config as (Record<string, unknown> & { _retry?: boolean }) | undefined;

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
