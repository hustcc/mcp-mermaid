import { describe, expect, it, vi } from "vitest";
import { withRetry } from "../../src/utils/retry";

// Silence logger output during tests
vi.mock("../../src/utils/logger", () => ({
  Logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

describe("withRetry", () => {
  it("resolves immediately when fn succeeds on the first attempt", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn, { maxAttempts: 3, delayMs: 0 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on a retryable status code and succeeds eventually", async () => {
    const retryableError = Object.assign(
      new Error("503 Service Temporarily Unavailable"),
      {
        status: 503,
      },
    );
    const fn = vi
      .fn()
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValue("recovered");

    const result = await withRetry(fn, {
      maxAttempts: 3,
      delayMs: 0,
      exponential: false,
    });
    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on a retryable status code embedded in the error message", async () => {
    const retryableError = new Error(
      "Server error '503 Service Temporarily Unavailable'",
    );
    const fn = vi
      .fn()
      .mockRejectedValueOnce(retryableError)
      .mockResolvedValue("recovered");

    const result = await withRetry(fn, {
      maxAttempts: 3,
      delayMs: 0,
      exponential: false,
    });
    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws immediately (no retry) for non-retryable errors", async () => {
    const nonRetryableError = new Error("Bad request");
    const fn = vi.fn().mockRejectedValue(nonRetryableError);

    await expect(
      withRetry(fn, {
        maxAttempts: 3,
        delayMs: 0,
        retryableStatusCodes: [503],
      }),
    ).rejects.toThrow("Bad request");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("exhausts all retries and throws the last error", async () => {
    const retryableError = Object.assign(new Error("503"), { status: 503 });
    const fn = vi.fn().mockRejectedValue(retryableError);

    await expect(
      withRetry(fn, { maxAttempts: 3, delayMs: 0, exponential: false }),
    ).rejects.toThrow("503");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("retries on 429 (Too Many Requests) by default", async () => {
    const rateLimitError = Object.assign(new Error("429"), { status: 429 });
    const fn = vi
      .fn()
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValue("done");

    const result = await withRetry(fn, { maxAttempts: 2, delayMs: 0 });
    expect(result).toBe("done");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("respects custom retryableStatusCodes", async () => {
    const err = Object.assign(new Error("418"), { status: 418 });
    const fn = vi.fn().mockRejectedValueOnce(err).mockResolvedValue("teapot");

    const result = await withRetry(fn, {
      maxAttempts: 2,
      delayMs: 0,
      retryableStatusCodes: [418],
    });
    expect(result).toBe("teapot");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
