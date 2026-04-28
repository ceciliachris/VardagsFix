import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import ServicesPage from "../../pages/ServicePage";
import { getAllServices } from "../../api/serviceApi";
import { getToken } from "../../utils/storage";

vi.mock("../../api/serviceApi", () => ({
  getAllServices: vi.fn(),
}));

vi.mock("../../utils/storage", () => ({
  getToken: vi.fn(),
}));

const mockedGetAllServices = vi.mocked(getAllServices);
const mockedGetToken = vi.mocked(getToken);

function createToken(email: string) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: email }));
  return `${header}.${payload}.signature`;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/services"]}>
      <Routes>
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/bookings/create/:id" element={<div>Bokningssida</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const services = [
  {
    id: 1,
    title: "Hundpromenad",
    description: "Promenerar hund",
    price: 200,
    location: "Malmö",
    user: {
      id: 1,
      name: "Anna",
      email: "anna@test.com",
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
  },
  {
    id: 2,
    title: "Gräsklippning",
    description: "Klipper gräs",
    price: 300,
    location: "Lund",
    user: {
      id: 2,
      name: "Cecilia",
      email: "cecilia@test.com",
    },
    availableSlots: [
      {
        id: 20,
        startTime: "2035-06-01T10:00:00",
        endTime: "2035-06-01T11:00:00",
        booked: false,
      },
    ],
  },
];

describe("ServicesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renderar tjänster och visar endast framtida obokade tider som lediga", async () => {
    mockedGetToken.mockReturnValue(createToken("cecilia@test.com"));
    mockedGetAllServices.mockResolvedValue(services);

    renderPage();

    expect(screen.getByText("Laddar tjänster...")).toBeInTheDocument();

    expect(await screen.findByText("Hundpromenad")).toBeInTheDocument();
    expect(screen.getByText("Gräsklippning")).toBeInTheDocument();

    expect(screen.getByText("Lediga tider")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
  });

  test("filtrerar tjänster via sökfältet", async () => {
    mockedGetToken.mockReturnValue(createToken("cecilia@test.com"));
    mockedGetAllServices.mockResolvedValue(services);

    renderPage();

    await screen.findByText("Hundpromenad");

    await userEvent.type(
      screen.getByLabelText("Sök"),
      "gräs"
    );

    expect(screen.queryByText("Hundpromenad")).not.toBeInTheDocument();
    expect(screen.getByText("Gräsklippning")).toBeInTheDocument();
  });

  test("visar egen tjänst som Din tjänst och utan bokningsknapp", async () => {
    mockedGetToken.mockReturnValue(createToken("cecilia@test.com"));
    mockedGetAllServices.mockResolvedValue(services);

    renderPage();

    await screen.findByText("Gräsklippning");

    expect(screen.getByText("Din tjänst")).toBeInTheDocument();
    expect(
      screen.getByText("Detta är din egen tjänst och kan därför inte bokas av dig.")
    ).toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: "Se lediga tider" })).toHaveLength(1);
  });

  test("navigerar till bokningssidan när användaren klickar på Se lediga tider", async () => {
    mockedGetToken.mockReturnValue(createToken("cecilia@test.com"));
    mockedGetAllServices.mockResolvedValue(services);

    renderPage();

    await screen.findByText("Hundpromenad");

    await userEvent.click(screen.getByRole("button", { name: "Se lediga tider" }));

    expect(await screen.findByText("Bokningssida")).toBeInTheDocument();
  });
});