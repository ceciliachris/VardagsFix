import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import EditServicePage from "../../pages/EditServicePage";
import { getAllServices, updateService } from "../../api/serviceApi";

vi.mock("../../api/serviceApi", () => ({
  getAllServices: vi.fn(),
  updateService: vi.fn(),
}));

const mockedGetAllServices = vi.mocked(getAllServices);
const mockedUpdateService = vi.mocked(updateService);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/services/edit/1"]}>
      <Routes>
        <Route path="/services/edit/:id" element={<EditServicePage />} />
        <Route path="/services/my" element={<div>Mina tjänster</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const mockService = [
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
    ],
  },
];

describe("EditServicePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("laddar och visar tjänstens data", async () => {
    mockedGetAllServices.mockResolvedValue(mockService);

    renderPage();

    expect(await screen.findByDisplayValue("Hundpromenad")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Promenerar hund")).toBeInTheDocument();
    expect(screen.getByDisplayValue("200")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Malmö")).toBeInTheDocument();
  });

  test("skickar inte uppdatering om titel saknas", async () => {
    mockedGetAllServices.mockResolvedValue(mockService);

    renderPage();

    await screen.findByDisplayValue("Hundpromenad");

    await userEvent.clear(screen.getByLabelText("Titel"));
    await userEvent.click(screen.getByRole("button", { name: "Spara" }));

    expect(mockedUpdateService).not.toHaveBeenCalled();
  });

  test("visar bokad tid som inte går att ta bort", async () => {
    mockedGetAllServices.mockResolvedValue(mockService);

    renderPage();

    expect(await screen.findByText("Tid 2")).toBeInTheDocument();
    expect(screen.getByText("Bokad")).toBeInTheDocument();

    expect(
      screen.getByText("Denna tid är redan bokad och kan därför inte tas bort.")
    ).toBeInTheDocument();

    expect(screen.getAllByRole("button", { name: "Ta bort tid" })).toHaveLength(1);
  });

  test("kan ta bort obokad tid", async () => {
    mockedGetAllServices.mockResolvedValue(mockService);

    renderPage();

    await screen.findByText("Tid 1");

    await userEvent.click(screen.getByRole("button", { name: "Ta bort tid" }));

    await waitFor(() => {
      expect(screen.getByText("Tid 1")).toBeInTheDocument();
    });

    expect(screen.queryByText("Tid 2")).not.toBeInTheDocument();
    expect(screen.getByText("Bokad")).toBeInTheDocument();
  });

  test("skickar korrekt payload vid uppdatering", async () => {
    mockedGetAllServices.mockResolvedValue(mockService);
    mockedUpdateService.mockResolvedValue({});

    renderPage();

    await screen.findByDisplayValue("Hundpromenad");

    await userEvent.type(screen.getByLabelText("Titel"), " Uppdaterad");

    await userEvent.click(screen.getByRole("button", { name: "Spara" }));

    expect(mockedUpdateService).toHaveBeenCalledTimes(1);

    const [id, payload] = mockedUpdateService.mock.calls[0];

    expect(id).toBe(1);
    expect(payload.title).toContain("Uppdaterad");
    expect(payload.availableSlots).toBeDefined();
    expect(payload.availableSlots!.length).toBe(2);
  });

  test("navigerar efter lyckad uppdatering", async () => {
    mockedGetAllServices.mockResolvedValue(mockService);
    mockedUpdateService.mockResolvedValue({});

    renderPage();

    await screen.findByDisplayValue("Hundpromenad");

    await userEvent.click(screen.getByRole("button", { name: "Spara" }));

    expect(await screen.findByText("Mina tjänster")).toBeInTheDocument();
  });
});