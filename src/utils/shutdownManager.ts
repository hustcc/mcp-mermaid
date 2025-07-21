import { Logger } from "./logger";

/**
 * Centralized shutdown manager for handling cleanup and graceful shutdown
 */
export class ShutdownManager {
  private cleanupHandlers: Array<() => void | Promise<void>> = [];
  private isShuttingDown = false;

  /**
   * Register a cleanup handler
   */
  registerCleanup(handler: () => void | Promise<void>): void {
    this.cleanupHandlers.push(handler);
  }

  async cleanup(): Promise<void> {
    if (this.isShuttingDown) {
      Logger.warn("Shutdown already in progress, forcing exit...");
      process.exit(1);
    }

    this.isShuttingDown = true;
    Logger.info("🔄 Shutting down gracefully...");

    // Execute all cleanup handlers with timeout
    const cleanupPromises = this.cleanupHandlers.map(async (handler) => {
      try {
        await Promise.race([
          handler(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Cleanup timeout")), 3000),
          ),
        ]);
      } catch (error) {
        Logger.error("Error during cleanup", error);
      }
    });

    await Promise.all(cleanupPromises);
    Logger.success("Cleanup completed");
    process.exit(0);
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  setupSignalHandlers(): void {
    // Remove any existing listeners to avoid duplicates
    process.removeAllListeners("SIGINT");
    process.removeAllListeners("SIGTERM");

    process.once("SIGINT", this.cleanup.bind(this));
    process.once("SIGTERM", this.cleanup.bind(this));
  }
}

// Global shutdown manager instance
export const shutdownManager = new ShutdownManager();
