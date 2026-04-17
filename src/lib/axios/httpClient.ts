import axios from "axios";
import { getAccessToken } from "../cookieUtils";

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // Crucial for sending HttpOnly cookies (refresh token)
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the access token
httpClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
