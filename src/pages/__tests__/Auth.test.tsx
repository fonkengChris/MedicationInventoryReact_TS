import { describe, expect, it, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import Auth from "../Auth";
import { server } from "../../test/server";
import { renderWithProviders } from "../../test/testUtils";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe("Auth page", () => {
  beforeEach(() => {
    localStorage.clear();
    navigateMock.mockReset();
  });

  it("signs in and navigates to home on success", async () => {
    server.use(
      http.post("http://localhost:5000/api/auth", async ({ request }) => {
        const body = (await request.json()) as { email: string };
        return HttpResponse.json({
          token: "test-token",
          user: { email: body.email, username: "Test User", role: "admin" },
        });
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<Auth />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(localStorage.getItem("token")).toBe("test-token")
    );
    expect(navigateMock).toHaveBeenCalledWith("/");
  });

  it("shows error from server when login fails", async () => {
    server.use(
      http.post("http://localhost:5000/api/auth", () =>
        HttpResponse.json(
          { message: "Invalid credentials" },
          { status: 400 }
        )
      )
    );

    const user = userEvent.setup();
    renderWithProviders(<Auth />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "Password123!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid credentials/i)
    ).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});

