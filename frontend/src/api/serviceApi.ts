import { api } from "./axios";

export const getAllServices = async () => {
  const response = await api.get("/services");
  return response.data;
};