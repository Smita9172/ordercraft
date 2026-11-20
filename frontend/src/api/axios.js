import axios from "axios";

const BASE = "http://127.0.0.1:8000/api";
const api = axios.create({ baseURL: BASE });

// Request interceptor: har request mein token
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("access");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Response interceptor: 401 par token refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const refresh = localStorage.getItem("refresh");
    if (
      err.response?.status === 401 &&
      !original._retry &&
      refresh &&
      !original.url.includes("/auth/")
    ) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${BASE}/auth/refresh/`, { refresh });
        localStorage.setItem("access", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;