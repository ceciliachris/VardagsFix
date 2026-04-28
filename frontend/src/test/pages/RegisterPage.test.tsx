import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import RegisterPage from "../../pages/RegisterPage";
import { register } from "../../api/authApi";

vi.mock("../../api/authApi", () => ({
  register: vi.fn(),
}));

const mockedRegister = vi.mocked(register);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<div>Logga in</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("skickar rätt registreringsdata", async () => {
    mockedRegister.mockResolvedValue({
      id: 1,
      name: "Cecilia",
      email: "cecilia@test.com",
    });

    renderPage();

    await userEvent.type(screen.getByLabelText("Namn"), "Cecilia");
    await userEvent.type(screen.getByLabelText("E-post"), "cecilia@test.com");
    await userEvent.type(screen.getByLabelText("Lösenord"), "password123");

    await userEvent.click(screen.getByRole("button", { name: "Registrera" }));

    await waitFor(() => {
      expect(mockedRegister).toHaveBeenCalledWith({
        name: "Cecilia",
        email: "cecilia@test.com",
        password: "password123",
      });
    });

    expect(
      await screen.findByText("Konto skapat! Du kan nu logga in.")
    ).toBeInTheDocument();
  });

  test("visar felmeddelande om registrering misslyckas", async () => {
    mockedRegister.mockRejectedValue({
      response: {
        data: {
          message: "Email already exists",
        },
      },
    });

    renderPage();

    await userEvent.type(screen.getByLabelText("Namn"), "Cecilia");
    await userEvent.type(screen.getByLabelText("E-post"), "cecilia@test.com");
    await userEvent.type(screen.getByLabelText("Lösenord"), "password123");

    await userEvent.click(screen.getByRole("button", { name: "Registrera" }));

    expect(await screen.findByText("Email already exists")).toBeInTheDocument();
  });

  test("navigerar till login via länken", async () => {
    renderPage();

    await userEvent.click(screen.getByRole("link", { name: "Logga in här" }));

    expect(await screen.findByText("Logga in")).toBeInTheDocument();
  });
});