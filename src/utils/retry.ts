import { Logger } from "./logger";

export interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3 */
  maxAttempts?: number;
  /** Base delay in milliseconds between retries. Default: 500 */
  delayMs?: number;
  /** Whether to use exponential back-off. Default: true */
  exponential?: boolean;
  /** HTTP status codes that should trigger a retry. Default: [503, 429, 502, 504] */
  retryableStatusCodes?: number[];
}

/**
 * Returns true when the thrown value looks like a retryable HTTP error
 * (i.e. it carries a `status` or `statusCode` property that matches one of
 * the configured status codes).
 */
function isRetryableError(
  error: unknown,
  retryableStatusCodes: number[],
): boolean {
  if (error && typeof error === "object") {
    const status =
      (error as Record<string, unknown>).status ??
      (error as Record<string, unknown>).statusCode;
    if (typeof status === "number" && retryableStatusCodes.includes(status)) {
      return true;
    }
    // Also match against the error message for HTTP errors that embed the
    // status code as text (e.g. "Server error '503 Service Temporarily
    // Unavailable'").
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string") {
      for (const code of retryableStatusCodes) {
        // Use word-boundary matching to avoid false positives like "5030".
        if (new RegExp(`\\b${code}\\b`).test(message)) return true;
      }
    }
  }
  return false;
}

/**
 * Executes `fn`, retrying on transient errors (e.g. 503 / 502 / 504 / 429).
 *
 * @param fn      Async function to execute.
 * @param options Retry configuration.
 * @returns       The resolved value of `fn`.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 500,
    exponential = true,
    retryableStatusCodes = [503, 429, 502, 504],
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const retryable = isRetryableError(error, retryableStatusCodes);

      if (attempt < maxAttempts && retryable) {
        const wait = exponential ? delayMs * 2 ** (attempt - 1) : delayMs;
        Logger.warn(
          `Attempt ${attempt}/${maxAttempts} failed with a retryable error. Retrying in ${wait}ms…`,
          error instanceof Error ? error.message : error,
        );
        await new Promise((resolve) => setTimeout(resolve, wait));
      } else {
        throw error;
      }
    }
  }

  // Should never reach here, but satisfies the TypeScript compiler.
  throw lastError;
}
