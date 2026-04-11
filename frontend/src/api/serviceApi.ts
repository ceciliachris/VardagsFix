import { api } from "./axios";

type AvailableSlotRequest = {
  startTime: string;
  endTime: string;
};

type TaskServiceRequest = {
  title: string;
  description: string;
  price: number;
  location: string;
  availableSlots?: AvailableSlotRequest[];
};

export const getAllServices = async () => {
  const response = await api.get("/services");
  return response.data;
};

export const getMyServices = async () => {
  const response = await api.get("/services/my");
  return response.data;
};

export const createService = async (data: TaskServiceRequest) => {
  const response = await api.post("/services", data);
  return response.data;
};

export const updateService = async (id: number, data: TaskServiceRequest) => {
  const response = await api.put(`/services/${id}`, data);
  return response.data;
};

export const deleteService = async (id: number) => {
  const response = await api.delete(`/services/${id}`);
  return response.data;
};