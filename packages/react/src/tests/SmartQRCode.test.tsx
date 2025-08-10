import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SmartQRCode } from "../components/SmartQRCode";
import * as core from "@smartqr/core";

beforeEach(() => {
  vi.restoreAllMocks();
});

vi.spyOn(core, "generateQRCode").mockImplementation(
  async (payload: string, opts?: core.GenerateQROptions) =>
    `<svg data-payload="${payload}" data-size="${opts?.size}" data-transparent="${opts?.transparentLight}" data-level="${opts?.level}"></svg>`
);

describe("<SmartQRCode />", () => {
  it("renders a QR with correct props", async () => {
    render(<SmartQRCode value="https://example.com" size={256} transparentLight level="H" />);
    const container = screen.getByTestId("smartqr-container");
    expect(container).toHaveAttribute("role", "img");
    expect(container.innerHTML).toContain('data-payload="https://example.com"');
    expect(container.innerHTML).toContain('data-size="256"');
    expect(container.innerHTML).toContain('data-transparent="true"');
    expect(container.innerHTML).toContain('data-level="H"');
  });

  it("resolves on click when onClickResolve is true", async () => {
    vi.useFakeTimers();
    const onResolved = vi.fn();
    vi.spyOn(core, "resolveAndExecute").mockResolvedValue({
      action: { type: "web", url: "https://resolved.com" }
    } as any);

    render(
      <SmartQRCode
        value="https://example.com"
        onClickResolve
        onResolved={onResolved}
        timeoutMs={1000}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);
    vi.advanceTimersByTime(1100);

    await waitFor(() => expect(onResolved).toHaveBeenCalled());
  });
});
