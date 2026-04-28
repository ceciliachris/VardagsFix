import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  cancelBooking,
  createBooking,
  getBookingsForMyServices,
  getMyBookings,
} from "../../api/bookingApi";
import { api } from "../../api/axios";

vi.mock("../../api/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe("bookingApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("createBooking skickar korrekt data till rätt endpoint", async () => {
    const request = {
      serviceId: 1,
      slotId: 10,
      message: "Jag vill boka tiden.",
    };

    const response = { id: 100, status: "BOOKED" };

    mockedApi.post.mockResolvedValue({ data: response });

    const result = await createBooking(request);

    expect(mockedApi.post).toHaveBeenCalledWith("/bookings", request);
    expect(result).toEqual(response);
  });

  test("getMyBookings hämtar användarens bokningar", async () => {
    const bookings = [{ id: 1, status: "BOOKED" }];

    mockedApi.get.mockResolvedValue({ data: bookings });

    const result = await getMyBookings();

    expect(mockedApi.get).toHaveBeenCalledWith("/bookings/my");
    expect(result).toEqual(bookings);
  });

  test("getBookingsForMyServices hämtar bokningar på användarens tjänster", async () => {
    const bookings = [{ id: 2, status: "BOOKED" }];

    mockedApi.get.mockResolvedValue({ data: bookings });

    const result = await getBookingsForMyServices();

    expect(mockedApi.get).toHaveBeenCalledWith("/bookings/my-services");
    expect(result).toEqual(bookings);
  });

  test("cancelBooking avbokar bokning via rätt endpoint", async () => {
    const response = { id: 5, status: "CANCELLED" };

    mockedApi.patch.mockResolvedValue({ data: response });

    const result = await cancelBooking(5);

    expect(mockedApi.patch).toHaveBeenCalledWith("/bookings/5/cancel");
    expect(result).toEqual(response);
  });
});