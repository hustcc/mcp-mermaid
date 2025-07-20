/**
 * Unified logger for consistent logging across the application
 */
const prefix = "[MCP-Mermaid]";

/**
 * Log info message
 */
export function info(message: string, ...args: unknown[]): void {
  console.log(`${prefix} ℹ️  ${message}`, ...args);
}

/**
 * Log warning message
 */
export function warn(message: string, ...args: unknown[]): void {
  console.warn(`${prefix} ⚠️  ${message}`, ...args);
}

/**
 * Log error message
 */
export function error(message: string, error?: unknown): void {
  console.error(`${prefix} ❌ ${message}`, error || "");
}

/**
 * Log success message
 */
export function success(message: string, ...args: unknown[]): void {
  console.log(`${prefix} ✅ ${message}`, ...args);
}

/**
 * Log server startup information
 */
export function serverStartup(
  serverType: string,
  port: number,
  endpoint: string,
): void {
  const serverUrl = `http://localhost:${port}${endpoint}`;
  const healthUrl = `http://localhost:${port}/health`;
  const pingUrl = `http://localhost:${port}/ping`;

  console.log(
    `${prefix} 🚀 ${serverType} running on: \x1b[32m\u001B[4m${serverUrl}\u001B[0m\x1b[0m`,
  );
  console.log("\nTest endpoints:");
  console.log(`• Health check: \u001B[4m${healthUrl}\u001B[0m`);
  console.log(`• Ping test: \u001B[4m${pingUrl}\u001B[0m`);
}

/**
 * Log cleanup information
 */
export function cleanup(message: string): void {
  console.log(`${prefix} 🧹 ${message}`);
}

/**
 * Logger object for backward compatibility
 */
export const Logger = {
  info,
  warn,
  error,
  success,
  serverStartup,
  cleanup,
};
