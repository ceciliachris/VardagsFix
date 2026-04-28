import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import CreateBookingPage from "../../pages/CreateBookingPage";
import { createBooking } from "../../api/bookingApi";
import { getAllServices } from "../../api/serviceApi";

vi.mock("../../api/bookingApi", () => ({
  createBooking: vi.fn(),
}));

vi.mock("../../api/serviceApi", () => ({
  getAllServices: vi.fn(),
}));

const mockedCreateBooking = vi.mocked(createBooking);
const mockedGetAllServices = vi.mocked(getAllServices);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/bookings/create/1"]}>
      <Routes>
        <Route path="/bookings/create/:id" element={<CreateBookingPage />} />
        <Route path="/services" element={<div>Alla tjänster</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const serviceWithMixedSlots = {
  id: 1,
  title: "Hundpromenad",
  description: "En promenad med hunden",
  price: 200,
  user: {
    id: 2,
    name: "Cecilia",
    email: "cecilia@test.com",
  },
  availableSlots: [
    {
      id: 10,
      startTime: "2035-05-01T10:00:00",
      endTime: "2035-05-01T11:00:00",
      booked: false,
    },
    {
      id: 11,
      startTime: "2035-05-01T12:00:00",
      endTime: "2035-05-01T13:00:00",
      booked: true,
    },
    {
      id: 12,
      startTime: "2020-05-01T10:00:00",
      endTime: "2020-05-01T11:00:00",
      booked: false,
    },
  ],
};

describe("CreateBookingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("visar endast framtida och obokade tider", async () => {
    mockedGetAllServices.mockResolvedValue([serviceWithMixedSlots]);

    renderPage();

    expect(screen.getByText("Laddar tjänst...")).toBeInTheDocument();

    expect(await screen.findByText("Hundpromenad")).toBeInTheDocument();
    expect(screen.getByText("1 lediga")).toBeInTheDocument();

    expect(screen.getAllByText(/2035-05-01/)).toHaveLength(2);
    expect(screen.getByText("2035-05-01 10:00")).toBeInTheDocument();
    expect(screen.getByText("2035-05-01 11:00")).toBeInTheDocument();

    expect(screen.queryByText(/2020-05-01/)).not.toBeInTheDocument();
    expect(screen.queryByText("2035-05-01 12:00")).not.toBeInTheDocument();
    expect(screen.queryByText("2035-05-01 13:00")).not.toBeInTheDocument();
  });

  test("visar felmeddelande om användaren försöker boka utan att välja tid", async () => {
    mockedGetAllServices.mockResolvedValue([serviceWithMixedSlots]);

    renderPage();

    await screen.findByText("Hundpromenad");

    await userEvent.click(screen.getByRole("button", { name: "Boka" }));

    expect(
      await screen.findByText("Du måste välja en tillgänglig tid.")
    ).toBeInTheDocument();

    expect(mockedCreateBooking).not.toHaveBeenCalled();
  });

  test("skickar korrekt bokningsdata när användaren väljer tid och bokar", async () => {
    mockedGetAllServices.mockResolvedValue([serviceWithMixedSlots]);
    mockedCreateBooking.mockResolvedValue({ id: 100, status: "BOOKED" });

    renderPage();

    await screen.findByText("Hundpromenad");

    await userEvent.click(screen.getByRole("radio"));

    await userEvent.type(
      screen.getByLabelText("Meddelande till utföraren"),
      "Hej! Jag vill boka denna tid."
    );

    await userEvent.click(screen.getByRole("button", { name: "Boka" }));

    await waitFor(() => {
      expect(mockedCreateBooking).toHaveBeenCalledWith({
        serviceId: 1,
        slotId: 10,
        message: "Hej! Jag vill boka denna tid.",
      });
    });

    expect(await screen.findByText("Bokningen skapades.")).toBeInTheDocument();
  });

  test("visar tomt läge och inaktiverar bokningsknappen när inga framtida lediga tider finns", async () => {
    mockedGetAllServices.mockResolvedValue([
      {
        ...serviceWithMixedSlots,
        availableSlots: [
          {
            id: 11,
            startTime: "2035-05-01T12:00:00",
            endTime: "2035-05-01T13:00:00",
            booked: true,
          },
          {
            id: 12,
            startTime: "2020-05-01T10:00:00",
            endTime: "2020-05-01T11:00:00",
            booked: false,
          },
        ],
      },
    ]);

    renderPage();

    await screen.findByText("Hundpromenad");

    expect(
      screen.getByText("Det finns inga framtida lediga tider för denna tjänst.")
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Boka" })).toBeDisabled();
  });
});