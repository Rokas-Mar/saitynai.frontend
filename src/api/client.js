import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const token = localStorage.getItem("accessToken");
if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

export function setAuthToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

let isRefreshing = false;
let refreshQueue = [];

function subscribeTokenRefresh(cb) {
  refreshQueue.push(cb);
}

function onRefreshed(newToken) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url !== "/auth/login" &&
      original.url !== "/auth/refresh"
    ) {
      original._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          const res = await api.post("/auth/refresh");
          const newToken = res.data.accessToken;

          localStorage.setItem("accessToken", newToken);
          setAuthToken(newToken);

          isRefreshing = false;
          onRefreshed(newToken);

          return api(original);
        }

        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      } catch {
        isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
