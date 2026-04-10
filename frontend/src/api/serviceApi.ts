import { api } from "./axios";

export const getAllServices = async () => {
  const response = await api.get("/services");
  return response.data;
};

export const createService = async (data: {
  title: string;
  description: string;
  price: number;
}) => {
  const response = await api.post("/services", data);
  return response.data;
};