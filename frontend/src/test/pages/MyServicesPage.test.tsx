import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import MyServicesPage from "../../pages/MyServicesPage";
import { deleteService, getMyServices } from "../../api/serviceApi";

vi.mock("../../api/serviceApi", () => ({
  getMyServices: vi.fn(),
  deleteService: vi.fn(),
}));

const mockedGetMyServices = vi.mocked(getMyServices);
const mockedDeleteService = vi.mocked(deleteService);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/services/my"]}>
      <Routes>
        <Route path="/services/my" element={<MyServicesPage />} />
        <Route path="/services/edit/:id" element={<div>Redigera tjänst</div>} />
        <Route path="/services/create" element={<div>Skapa tjänst</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const myServices = [
  {
    id: 1,
    title: "Hundpromenad",
    description: "Promenerar hund",
    price: 200,
    location: "Malmö",
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
];

describe("MyServicesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renderar användarens tjänster och statistik", async () => {
    mockedGetMyServices.mockResolvedValue(myServices);

    renderPage();

    expect(screen.getByText("Laddar dina tjänster...")).toBeInTheDocument();

    expect(await screen.findByText("Hundpromenad")).toBeInTheDocument();
    expect(screen.getByText("Promenerar hund")).toBeInTheDocument();
    expect(screen.getByText("Malmö")).toBeInTheDocument();
    expect(screen.getByText("200 kr")).toBeInTheDocument();

    expect(screen.getByText("Upplagda tider")).toBeInTheDocument();
    expect(screen.getAllByText("Lediga tider").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bokade tider").length).toBeGreaterThanOrEqual(1);
  });

  test("navigerar till redigeringssidan", async () => {
    mockedGetMyServices.mockResolvedValue(myServices);

    renderPage();

    await screen.findByText("Hundpromenad");

    await userEvent.click(screen.getByRole("button", { name: "Redigera" }));

    expect(await screen.findByText("Redigera tjänst")).toBeInTheDocument();
  });

  test("öppnar dialog när användaren klickar på ta bort", async () => {
    mockedGetMyServices.mockResolvedValue(myServices);

    renderPage();

    await screen.findByText("Hundpromenad");

    await userEvent.click(screen.getByRole("button", { name: "Ta bort" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Ta bort tjänst")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Är du säker på att du vill ta bort tjänsten? Det går inte att ångra."
      )
    ).toBeInTheDocument();
  });

  test("avbryter borttagning när användaren klickar på avbryt", async () => {
    mockedGetMyServices.mockResolvedValue(myServices);

    renderPage();

    await screen.findByText("Hundpromenad");

    await userEvent.click(screen.getByRole("button", { name: "Ta bort" }));
    await userEvent.click(screen.getByRole("button", { name: "Avbryt" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockedDeleteService).not.toHaveBeenCalled();
  });

  test("tar bort tjänst efter bekräftelse", async () => {
    mockedGetMyServices.mockResolvedValue(myServices);
    mockedDeleteService.mockResolvedValue(undefined);

    renderPage();

    await screen.findByText("Hundpromenad");

    await userEvent.click(screen.getByRole("button", { name: "Ta bort" }));

    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Ta bort" }));

    await waitFor(() => {
      expect(mockedDeleteService).toHaveBeenCalledWith(1);
    });

    expect(await screen.findByText("Tjänsten togs bort.")).toBeInTheDocument();
    expect(screen.queryByText("Hundpromenad")).not.toBeInTheDocument();
  });

  test("visar tomt läge om användaren inte har några tjänster", async () => {
    mockedGetMyServices.mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText("Du har inte skapat några tjänster ännu")
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Skapa första tjänsten" })
    );

    expect(await screen.findByText("Skapa tjänst")).toBeInTheDocument();
  });
});