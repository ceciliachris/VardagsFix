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

export const getMyServices = async () => {
  const response = await api.get("/services/my");
  return response.data;
};

export const deleteService = async (id: number) => {
  await api.delete(`/services/${id}`);
};

export const updateService = async (
  id: number,
  data: {
    title: string;
    description: string;
    price: number;
  }
) => {
  const response = await api.put(`/services/${id}`, data);
  return response.data;
};