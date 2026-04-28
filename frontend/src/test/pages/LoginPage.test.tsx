import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import LoginPage from "../../pages/LoginPage";
import { login } from "../../api/authApi";
import { saveToken } from "../../utils/storage";

vi.mock("../../api/authApi", () => ({
  login: vi.fn(),
}));

vi.mock("../../utils/storage", () => ({
  saveToken: vi.fn(),
}));

const mockedLogin = vi.mocked(login);
const mockedSaveToken = vi.mocked(saveToken);

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/services" element={<div>Alla tjänster</div>} />
        <Route path="/register" element={<div>Registrera konto</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("skickar rätt inloggningsdata och sparar token", async () => {
    mockedLogin.mockResolvedValue("test-token");

    renderPage();

    await userEvent.type(screen.getByLabelText("E-post"), "test@test.com");
    await userEvent.type(screen.getByLabelText("Lösenord"), "password123");

    await userEvent.click(screen.getByRole("button", { name: "Logga in" }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "password123",
      });
    });

    expect(mockedSaveToken).toHaveBeenCalledWith("test-token");
    expect(await screen.findByText("Inloggning lyckades.")).toBeInTheDocument();
  });

  test("visar felmeddelande om login misslyckas", async () => {
    mockedLogin.mockRejectedValue({
      response: {
        data: {
          message: "Fel e-post eller lösenord.",
        },
      },
    });

    renderPage();

    await userEvent.type(screen.getByLabelText("E-post"), "fel@test.com");
    await userEvent.type(screen.getByLabelText("Lösenord"), "wrong");

    await userEvent.click(screen.getByRole("button", { name: "Logga in" }));

    expect(await screen.findByText("Fel e-post eller lösenord.")).toBeInTheDocument();
    expect(mockedSaveToken).not.toHaveBeenCalled();
  });

  test("navigerar till registreringssidan via länken", async () => {
    renderPage();

    await userEvent.click(screen.getByRole("link", { name: "Registrera dig här" }));

    expect(await screen.findByText("Registrera konto")).toBeInTheDocument();
  });
});