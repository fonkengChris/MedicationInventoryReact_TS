import { describe, expect, it, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import AdminMedicationsPage from "../AdminMedicationsPage";
import { renderWithProviders } from "../../test/testUtils";
import { server } from "../../test/server";

describe("AdminMedicationsPage", () => {
  beforeEach(() => {
    localStorage.setItem("token", "fake-token");
  });

  it("renders medications fetched from the API", async () => {
    server.use(
      http.get("http://localhost:5000/api/medications", () =>
        HttpResponse.json([
          {
            _id: "1",
            name: "Aspirin",
            dosage: "500mg",
            form: "tablet",
            route: "oral",
            manufacturer: "HealthCorp",
            notes: "Take with water",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
      )
    );

    renderWithProviders(<AdminMedicationsPage />);

    expect(await screen.findByText(/aspirin/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add medication/i })).toBeVisible();
  });

  it("shows an empty state when no medications exist", async () => {
    server.use(
      http.get("http://localhost:5000/api/medications", () =>
        HttpResponse.json([])
      )
    );

    renderWithProviders(<AdminMedicationsPage />);

    expect(
      await screen.findByText(/no medications found/i)
    ).toBeInTheDocument();
  });

  it("displays an error message when the API call fails", async () => {
    server.use(
      http.get("http://localhost:5000/api/medications", () =>
        HttpResponse.json(
          { message: "Server error" },
          {
            status: 500,
          }
        )
      )
    );

    renderWithProviders(<AdminMedicationsPage />);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it("allows deleting a medication", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("http://localhost:5000/api/medications", () =>
        HttpResponse.json([
          {
            _id: "1",
            name: "Ibuprofen",
            dosage: "200mg",
            form: "tablet",
            route: "oral",
            manufacturer: "Wellness Labs",
            notes: "Take after meals",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
      ),
      http.delete("http://localhost:5000/api/medications/1", () =>
        HttpResponse.json({ message: "Deleted" })
      )
    );

    renderWithProviders(<AdminMedicationsPage />);

    const deleteIconButton = await screen.findByTestId("DeleteIcon");
    await user.click(deleteIconButton.closest("button")!);

    await user.click(
      await screen.findByRole("button", { name: /^delete$/i })
    );

    expect(
      await screen.findByText(/no medications found/i)
    ).toBeInTheDocument();
  });
});

