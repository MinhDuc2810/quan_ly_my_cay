import axios from "axios";

const baseURL = "https://seoul-spicy-production.up.railway.app/api/";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Clean prepended warnings from JSON string
function cleanJsonResponse(data: any) {
  if (typeof data === "string") {
    const jsonStart = data.indexOf("{");
    const jsonEnd = data.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = data.substring(jsonStart, jsonEnd + 1);
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        return data;
      }
    }
  }
  return data;
}

// Interceptor to handle responses and logouts on unauthorized
api.interceptors.response.use(
  (response) => {
    // Attempt to clean prepended warnings if the response is a string
    if (typeof response.data === "string" && response.data.trim().startsWith("<br />")) {
      response.data = cleanJsonResponse(response.data);
    }
    return response;
  },
  (error) => {
    // Also try to clean error response data if it's a string
    if (error.response?.data && typeof error.response.data === "string" && error.response.data.trim().startsWith("<br />")) {
      error.response.data = cleanJsonResponse(error.response.data);
    }
    
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
