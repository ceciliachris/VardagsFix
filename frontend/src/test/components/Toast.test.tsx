import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Toast from "../../components/Toast";

describe("Toast", () => {
  test("visar felmeddelande", () => {
    render(
      <Toast
        message="Något gick fel."
        type="error"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Fel")).toBeInTheDocument();
    expect(screen.getByText("Något gick fel.")).toBeInTheDocument();
  });

  test("visar successmeddelande", () => {
    render(
      <Toast
        message="Allt gick bra."
        type="success"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("Klart")).toBeInTheDocument();
    expect(screen.getByText("Allt gick bra.")).toBeInTheDocument();
  });

  test("anropar onClose när användaren klickar på stäng", async () => {
    const onClose = vi.fn();

    render(
      <Toast
        message="Stäng mig."
        type="success"
        onClose={onClose}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "×" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("renderar ingenting när message är tomt", () => {
    render(
      <Toast
        message=""
        type="success"
        onClose={vi.fn()}
      />
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});