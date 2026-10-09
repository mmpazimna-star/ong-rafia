import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const apiBaseUrl = /^https?:\/\//.test(configuredApiUrl)
  ? configuredApiUrl
  : `https://${configuredApiUrl}`;

const api = axios.create({
  baseURL: apiBaseUrl
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authorization = error.config?.headers?.Authorization;
    if (error.response?.status === 401 && authorization?.startsWith("Bearer ")) {
      window.dispatchEvent(new Event("admin-auth-expired"));
    }
    return Promise.reject(error);
  }
);

export default api;
