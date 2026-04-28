import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import ConfirmDialog from "../../components/ConfirmDialog";

describe("ConfirmDialog", () => {
  test("renderar ingenting när open är false", () => {
    render(
      <ConfirmDialog
        open={false}
        title="Ta bort"
        message="Är du säker?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("visar titel, meddelande och knappar när open är true", () => {
    render(
      <ConfirmDialog
        open
        title="Ta bort tjänst"
        message="Är du säker?"
        confirmText="Ta bort"
        cancelText="Avbryt"
        danger
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Ta bort tjänst")).toBeInTheDocument();
    expect(screen.getByText("Är du säker?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ta bort" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Avbryt" })).toBeInTheDocument();
  });

  test("anropar onConfirm när bekräftelseknappen klickas", async () => {
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Ta bort tjänst"
        message="Är du säker?"
        confirmText="Ta bort"
        cancelText="Avbryt"
        danger
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Ta bort" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("anropar onCancel när avbryt klickas", async () => {
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Ta bort tjänst"
        message="Är du säker?"
        confirmText="Ta bort"
        cancelText="Avbryt"
        danger
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Avbryt" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("anropar onCancel när stängknappen klickas", async () => {
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Ta bort tjänst"
        message="Är du säker?"
        confirmText="Ta bort"
        cancelText="Avbryt"
        danger
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Stäng dialog" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("anropar onCancel när Escape trycks", async () => {
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Ta bort tjänst"
        message="Är du säker?"
        confirmText="Ta bort"
        cancelText="Avbryt"
        danger
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    await userEvent.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("inaktiverar knappar och visar Vänta när loading är true", () => {
    render(
      <ConfirmDialog
        open
        title="Ta bort tjänst"
        message="Är du säker?"
        confirmText="Ta bort"
        cancelText="Avbryt"
        danger
        loading
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Avbryt" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Vänta..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Stäng dialog" })).toBeDisabled();
  });
});