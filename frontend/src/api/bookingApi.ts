import { api } from "./axios";

export const createBooking = async (data: {
  serviceId: number;
  startTime: string;
  endTime: string;
}) => {
  const response = await api.post("/bookings", data);
  return response.data;
};