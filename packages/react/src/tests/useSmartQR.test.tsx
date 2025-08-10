import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSmartQR } from "../hooks/useSmartQR";

vi.useFakeTimers();

describe("useSmartQR", () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.resetAllMocks();
  });

  it("resolves and executes with navigate override", async () => {
    const navigate = vi.fn();
    const loadRules = () => ({
      rules: [
        {
          os: { include: ["iOS", "Android"] },
          default: { type: "deeplink", url: "app://foo" },
          fallback: { type: "web", url: "https://example.com/mobile" }
        },
        {
          default: { type: "web", url: "https://example.com/desktop" }
        }
      ]
    });

    const { result } = renderHook(() =>
      useSmartQR({ loadRules, timeoutMs: 1500, navigate })
    );

    await act(async () => {
      const p = result.current.run();
      // advance timers to trigger mobile fallback
      vi.advanceTimersByTime(1600);
      await p;
    });

    expect(result.current.status).toBe("done");
    expect(navigate).toHaveBeenCalled(); // deep link or fallback
  });
});
