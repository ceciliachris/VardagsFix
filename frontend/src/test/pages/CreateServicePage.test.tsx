import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import CreateServicePage from "../../pages/CreateServicePage";
import { createService } from "../../api/serviceApi";

vi.mock("../../api/serviceApi", () => ({
  createService: vi.fn(),
}));

const mockedCreateService = vi.mocked(createService);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/services/create"]}>
      <Routes>
        <Route path="/services/create" element={<CreateServicePage />} />
        <Route path="/services" element={<div>Alla tjänster</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillBasicServiceInfo() {
  await userEvent.type(screen.getByLabelText("Titel"), "Hundpromenad");
  await userEvent.type(
    screen.getByLabelText("Beskrivning"),
    "En promenad med hunden"
  );
  await userEvent.type(screen.getByLabelText("Plats"), "Malmö");
  await userEvent.type(screen.getByLabelText("Pris"), "200");
}

async function addSlot(
  startDate: string,
  startTime: string,
  endDate: string,
  endTime: string
) {
  await userEvent.type(screen.getByLabelText("Startdatum"), startDate);
  await userEvent.selectOptions(screen.getByLabelText("Starttid"), startTime);
  await userEvent.type(screen.getByLabelText("Slutdatum"), endDate);
  await userEvent.selectOptions(screen.getByLabelText("Sluttid"), endTime);

  await userEvent.click(screen.getByRole("button", { name: "Lägg till tid" }));
}

describe("CreateServicePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("visar felmeddelande om användaren försöker skapa tjänst utan tillgänglig tid", async () => {
    renderPage();

    await fillBasicServiceInfo();

    await userEvent.click(screen.getByRole("button", { name: "Skapa" }));

    expect(
      await screen.findByText("Du måste lägga till minst en tillgänglig tid.")
    ).toBeInTheDocument();

    expect(mockedCreateService).not.toHaveBeenCalled();
  });

  test("hindrar sluttid som är före starttid", async () => {
    renderPage();

    await addSlot("2035-05-01", "12:00", "2035-05-01", "10:00");

    expect(
      await screen.findByText(
        "Sluttid för tillgänglig tid måste vara efter starttid."
      )
    ).toBeInTheDocument();

    expect(screen.queryByText("Tid 1")).not.toBeInTheDocument();
  });

  test("hindrar tider som redan har passerat", async () => {
    renderPage();

    await addSlot("2020-05-01", "10:00", "2020-05-01", "11:00");

    expect(
      await screen.findByText("Du kan inte lägga till en tid som redan har passerat.")
    ).toBeInTheDocument();

    expect(screen.queryByText("Tid 1")).not.toBeInTheDocument();
  });

  test("hindrar överlappande tider", async () => {
    renderPage();

    await addSlot("2035-05-01", "10:00", "2035-05-01", "11:00");

    expect(await screen.findByText("Tid 1")).toBeInTheDocument();

    await addSlot("2035-05-01", "10:30", "2035-05-01", "11:30");

    expect(
      await screen.findByText("Tiderna får inte överlappa varandra.")
    ).toBeInTheDocument();

    expect(screen.queryByText("Tid 2")).not.toBeInTheDocument();
  });

  test("skickar korrekt payload när tjänsten skapas", async () => {
    mockedCreateService.mockResolvedValue({ id: 1 });

    renderPage();

    await fillBasicServiceInfo();
    await addSlot("2035-05-01", "10:00", "2035-05-01", "11:00");

    await userEvent.click(screen.getByRole("button", { name: "Skapa" }));

    await waitFor(() => {
      expect(mockedCreateService).toHaveBeenCalledWith({
        title: "Hundpromenad",
        description: "En promenad med hunden",
        price: 200,
        location: "Malmö",
        availableSlots: [
          {
            startTime: "2035-05-01T10:00",
            endTime: "2035-05-01T11:00",
          },
        ],
      });
    });

    expect(await screen.findByText("Tjänsten skapades.")).toBeInTheDocument();
  });

  test("kan ta bort en tillagd tid", async () => {
    renderPage();

    await addSlot("2035-05-01", "10:00", "2035-05-01", "11:00");

    expect(await screen.findByText("Tid 1")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Ta bort tid" }));

    expect(screen.queryByText("Tid 1")).not.toBeInTheDocument();
  });
});