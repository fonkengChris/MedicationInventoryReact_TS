import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("renders provided children", () => {
    render(<Button onClick={() => void 0}>Click me</Button>);

    expect(screen.getByRole("button", { name: /click me/i })).toBeVisible();
  });

  it("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Press</Button>);

    await user.click(screen.getByRole("button", { name: /press/i }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

