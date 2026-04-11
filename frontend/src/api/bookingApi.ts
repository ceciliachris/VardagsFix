import { api } from "./axios";

export const createBooking = async (data: {
  serviceId: number;
  startTime: string;
  endTime: string;
}) => {
  const response = await api.post("/bookings", data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my");
  return response.data;
};

export const cancelBooking = async (id: number) => {
  await api.patch(`/bookings/${id}/cancel`);
};