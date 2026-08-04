import axios from "axios";

// baseURL defaults to proxy path during development
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api" || "/api",
  withCredentials: true, // Enable cookies for session management
});

// automatically attach stored API key to each request (production-safe)
api.interceptors.request.use((config) => {
  // Use sessionStorage instead of localStorage for better security
  // sessionStorage is cleared when the browser tab closes
  const apiKey = sessionStorage.getItem("apiKey");
  if (apiKey) {
    config.headers = config.headers || {};
    config.headers["x-api-key"] = apiKey;
  }
  return config;
});

// Handle 401 responses by clearing auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials on unauthorized
      sessionStorage.removeItem("apiKey");
      // Redirect to login could be handled by Redux
    }
    return Promise.reject(error);
  }
);

export default api;
