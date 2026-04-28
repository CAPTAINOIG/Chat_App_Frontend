import axios from "axios";
import useAuthStore from "../src/store/auth";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // timeout: 50000,
});

// ✅ Request interceptor to inject token dynamically
axiosInstance.interceptors.request.use((config) => {
  // Get token from auth store instead of localStorage
  const authStore = useAuthStore.getState();
  const token = authStore.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ Detect FormData automatically
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

// ✅ Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      const authStore = useAuthStore.getState();
      authStore.logout();
      // Redirect to signin page (you might want to handle this differently)
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
