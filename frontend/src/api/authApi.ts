import { api } from "./axios";
import type { LoginRequest } from "../types/auth";

export const login = async (data: LoginRequest): Promise<string> => {
  const response = await api.post<string>("/auth/signin", data);
  return response.data;
};