import axios, { type InternalAxiosRequestConfig } from "axios";
import { getToken } from "../utils/storage";

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