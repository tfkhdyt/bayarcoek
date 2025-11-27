import chalk from "chalk";
import { existsSync, mkdirSync, appendFileSync } from "fs";
import { dirname } from "path";

interface LoggerOptions {
  verbose?: boolean;
  quiet?: boolean;
  logFile?: string;
}

interface Stats {
  filesProcessed: number;
  totalSize: number;
  startTime: number;
}

/**
 * Logger utility for consistent console output with optional file logging
 */
export class Logger {
  private verbose: boolean;
  private quiet: boolean;
  private logFile?: string;
  private stats: Stats;

  /**
   * Initialize the logger
   */
  constructor(options: LoggerOptions = {}) {
    this.verbose = options.verbose || false;
    this.quiet = options.quiet || false;
    this.logFile = options.logFile;
    this.stats = {
      filesProcessed: 0,
      totalSize: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Log info message
   */
  info(message: string): void {
    if (!this.quiet) {
      console.log(message);
      this._writeToFile(message);
    }
  }

  /**
   * Log verbose message
   */
  verbose_msg(message: string): void {
    if (this.verbose && !this.quiet) {
      console.log(chalk.gray(message));
      this._writeToFile(message);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string): void {
    console.warn(chalk.yellow.bold("Warning") + ": " + message);
    this._writeToFile("Warning: " + message);
  }

  /**
   * Log error message
   */
  error(message: string): void {
    console.error(chalk.red.bold("Error") + ": " + message);
    this._writeToFile("Error: " + message);
  }

  /**
   * Log success message
   */
  success(message: string): void {
    if (!this.quiet) {
      console.log(chalk.green.bold("✓") + " " + message);
      this._writeToFile(message);
    }
  }

  /**
   * Track file processing statistics
   */
  trackFile(fileSize: number = 0): void {
    this.stats.filesProcessed++;
    this.stats.totalSize += fileSize;
  }

  /**
   * Get elapsed time in seconds
   */
  getElapsedTime(): string {
    return ((Date.now() - this.stats.startTime) / 1000).toFixed(2);
  }

  /**
   * Log summary statistics
   */
  logSummary(): void {
    const elapsed = this.getElapsedTime();
    const totalSizeMB = (this.stats.totalSize / (1024 * 1024)).toFixed(2);
    const summary = `Processed ${this.stats.filesProcessed} files (${totalSizeMB} MB) in ${elapsed}s`;
    this.info(chalk.blue.bold("Summary") + ": " + summary);
  }

  /**
   * Write to log file if configured
   */
  private _writeToFile(message: string): void {
    if (!this.logFile) return;
    try {
      const logDir = dirname(this.logFile);
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }
      appendFileSync(this.logFile, message + "\n");
    } catch (err) {
      console.error("Failed to write to log file:", (err as Error).message);
    }
  }
}

export default Logger;
