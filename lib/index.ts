import { color } from "termcolors";

export type LogLevel = "error" | "warn" | "info" | "debug";

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export type EgonLogConfig = {
  logLevel: LogLevel;
};

export class EgonLog {
  private logLevel: LogLevel;
  private timers: Record<string, number> = {};

  constructor(config: EgonLogConfig) {
    this.logLevel = config.logLevel;
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    return LOG_LEVELS[messageLevel] <= LOG_LEVELS[this.logLevel];
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case "error":
        console.error(color.red(prefix, ...args));
        break;
      case "warn":
        console.warn(color.yellow(prefix, ...args));
        break;
      case "info":
        console.info(color.green(prefix, ...args));
        break;
      case "debug":
        console.debug(prefix, ...args);
        break;
    }
  }

  error(...args: unknown[]): void {
    this.log("error", ...args);
  }

  warn(...args: unknown[]): void {
    this.log("warn", ...args);
  }

  info(...args: unknown[]): void {
    this.log("info", ...args);
  }

  debug(...args: unknown[]): void {
    this.log("debug", ...args);
  }

  table(...args: unknown[]): void {
    if (!this.shouldLog("debug")) {
      return;
    }
    console.table(...args);
  }

  highlight(...args: unknown[]): void {
    if (!this.shouldLog("debug")) {
      return;
    }
    const highlighted = args.map((arg) =>
      typeof arg === "string" ? color.bgWhite.black(arg) : arg
    );
    console.log(...highlighted);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  getLogLevel(): LogLevel {
    return this.logLevel;
  }

  startTimer(label: string): void {
    this.timers[label] = performance.now();
  }

  endTimer(label: string): void {
    if (this.timers[label]) {
      const duration = performance.now() - this.timers[label];
      this.info(`Timer [${label}]: ${duration.toFixed(2)} ms`);
      delete this.timers[label];
    } else {
      this.warn(`No timer found for label: ${label}`);
    }
  }

  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    try {
      return await fn();
    } finally {
      this.endTimer(label);
    }
  }
}
