import { api } from "./axios";
import type { LoginRequest, RegisterRequest } from "../types/auth";

export const login = async (data: LoginRequest): Promise<string> => {
  const response = await api.post<string>("/auth/signin", data);
  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};