import { api } from "./axios";

type CreateBookingData = {
  serviceId: number;
  slotId: number;
  message?: string;
};

export const createBooking = async (data: CreateBookingData) => {
  const response = await api.post("/bookings", data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my");
  return response.data;
};

export const getBookingsForMyServices = async () => {
  const response = await api.get("/bookings/my-services");
  return response.data;
};

export const cancelBooking = async (id: number) => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
};