import {
  LEVELS,
  isBrowser,
  envDebugOn,
  timestamp,
  nodeColor,
  browserCss,
} from "./utils";
import type { LevelName, LevelNum } from "./types";

export interface ILogger {
  setLevel(level: LevelName): void;
  getLevel(): LevelName;
  child(context: string): ILogger;
  enableContexts(...contexts: string[]): void;
  disableContexts(...contexts: string[]): void;
  setContextPolicy(policy: "all" | "none"): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export class LoggingService implements ILogger {
  private levelName: LevelName;
  private levelNum: LevelNum;
  private context?: string;

  private static enabledContexts: Set<string> = new Set();
  private static contextPolicy: "all" | "none" = "none"; // default: nothing logs

  constructor(opts?: { level?: LevelName; context?: string }) {
    const isDev =
      (typeof process !== "undefined" &&
        process.env.NODE_ENV === "development") ||
      (typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_NODE_ENV === "development");

    const defaultLevel: LevelName = envDebugOn() || isDev ? "DEBUG" : "INFO";
    this.levelName = opts?.level ?? defaultLevel;
    this.levelNum = LEVELS[this.levelName];
    this.context = opts?.context;

    // ✅ Lazy-load env config only once
    if (
      typeof process !== "undefined" &&
      LoggingService.enabledContexts.size === 0
    ) {
      const envContexts =
        process.env.LOGGER_CONTEXTS ??
        process.env.NEXT_PUBLIC_LOGGER_CONTEXTS ??
        "";
      if (envContexts) {
        LoggingService.setGlobalContexts(
          envContexts
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        );
      }

      const envPolicy = (process.env.LOGGER_CONTEXT_POLICY ??
        process.env.NEXT_PUBLIC_LOGGER_CONTEXT_POLICY) as
        | "all"
        | "none"
        | undefined;

      if (envPolicy) LoggingService.contextPolicy = envPolicy;
    }
  }

  // ---- Global config methods ----
  static setGlobalContexts(contexts: string[]) {
    LoggingService.enabledContexts = new Set(
      contexts.map((c) => c.toLowerCase())
    );
  }

  enableContexts(...contexts: string[]) {
    contexts.forEach((c) =>
      LoggingService.enabledContexts.add(c.toLowerCase())
    );
  }

  disableContexts(...contexts: string[]) {
    contexts.forEach((c) =>
      LoggingService.enabledContexts.delete(c.toLowerCase())
    );
  }

  static setDefaultContextPolicy(policy: "all" | "none") {
    LoggingService.contextPolicy = policy;
  }

  setContextPolicy(policy: "all" | "none") {
    LoggingService.contextPolicy = policy;
  }

  setLevel(level: LevelName) {
    this.levelName = level;
    this.levelNum = LEVELS[level];
  }

  getLevel(): LevelName {
    return this.levelName;
  }

  child(context: string): ILogger {
    return new LoggingService({ level: this.levelName, context });
  }

  // ---- Core decision logic ----
  private shouldLog(lvl: LevelNum): boolean {
    const policy = LoggingService.contextPolicy;
    const ctx = this.context?.toLowerCase();

    // No context provided
    if (!ctx) return policy === "all" && lvl >= this.levelNum;

    // Policy = 'all' → log everything except explicitly disabled (!ctx)
    if (policy === "all") {
      const disabled = LoggingService.enabledContexts.has(`!${ctx}`);
      return lvl >= this.levelNum && !disabled;
    }

    // Policy = 'none' → log only enabled contexts
    const enabled = LoggingService.enabledContexts.has(ctx);
    return lvl >= this.levelNum && enabled;
  }

  // ---- Formatting and emitting ----
  private prefix(lvl: LevelName) {
    const ctx = this.context ? ` [${this.context}]` : "";
    return `[${timestamp()}] [${lvl}]${ctx}`;
  }

  private emit(lvl: LevelName, lvlNum: LevelNum, args: unknown[]) {
    if (!this.shouldLog(lvlNum)) return;
    const pre = this.prefix(lvl);
    const payload =
      args.length === 1 && typeof args[0] === "object"
        ? [JSON.stringify(args[0], null, 2)]
        : args;

    const fn =
      console[lvl.toLowerCase() as "debug" | "info" | "warn" | "error"];
    if (typeof fn === "function") {
      if (isBrowser()) fn(`%c${pre}`, browserCss(lvl), ...payload);
      else fn(nodeColor(lvl, pre), ...payload);
    }
  }

  debug = (...args: unknown[]) => this.emit("DEBUG", LEVELS.DEBUG, args);
  info = (...args: unknown[]) => this.emit("INFO", LEVELS.INFO, args);
  warn = (...args: unknown[]) => this.emit("WARN", LEVELS.WARN, args);
  error = (...args: unknown[]) => this.emit("ERROR", LEVELS.ERROR, args);
}

// Export singleton
export const logger = new LoggingService();
