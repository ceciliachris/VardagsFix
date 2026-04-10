import axios, { type InternalAxiosRequestConfig } from "axios";
import { getToken, removeToken } from "../utils/storage";

export const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      removeToken();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);