import {
  LEVELS,
  isBrowser,
  envDebugOn,
  timestamp,
  nodeColor,
  browserCss,
} from "./utils.js";
import type { LevelName, LevelNum } from "./types.js";
import { getEnvVar } from "./env.js";

export class LoggingService {
  private levelName: LevelName;
  private levelNum: LevelNum;
  private context?: string;

  private static enabledContexts = new Set<string>();
  private static contextPolicy: "all" | "none" = "none";

  constructor(opts?: { level?: LevelName; context?: string }) {
    // ✅ detect dev mode safely for Node + Browser + Vite
    const isDev =
      getEnvVar("NODE_ENV") === "development" ||
      getEnvVar("NEXT_PUBLIC_NODE_ENV") === "development" ||
      getEnvVar("MODE") === "development";

    const defaultLevel: LevelName = envDebugOn() || isDev ? "DEBUG" : "INFO";
    this.levelName = opts?.level ?? defaultLevel;
    this.levelNum = LEVELS[this.levelName];
    this.context = opts?.context;

    // ✅ initialize from environment safely
    if (LoggingService.enabledContexts.size === 0) {
      const envContexts = (getEnvVar("LOGGER_CONTEXTS") ??
        getEnvVar("NEXT_PUBLIC_LOGGER_CONTEXTS") ??
        "") as string | boolean;

      if (typeof envContexts === "string" && envContexts.trim()) {
        LoggingService.enabledContexts = new Set(
          envContexts
            .split(",")
            .map((c) => c.trim().toLowerCase())
            .filter(Boolean)
        );
      }

      const envPolicy = (getEnvVar("LOGGER_CONTEXT_POLICY") ??
        getEnvVar("NEXT_PUBLIC_LOGGER_CONTEXT_POLICY")) as
        | "all"
        | "none"
        | undefined;
      if (envPolicy) LoggingService.contextPolicy = envPolicy;
    }
  }

  // ——————————————————————————————————————
  // Config helpers
  // ——————————————————————————————————————
  setLevel(level: LevelName) {
    this.levelName = level;
    this.levelNum = LEVELS[level];
  }
  getLevel() {
    return this.levelName;
  }
  child(context: string) {
    return new LoggingService({ level: this.levelName, context });
  }
  enableContexts(...c: string[]) {
    c.forEach((ctx) => LoggingService.enabledContexts.add(ctx.toLowerCase()));
  }
  disableContexts(...c: string[]) {
    c.forEach((ctx) =>
      LoggingService.enabledContexts.delete(ctx.toLowerCase())
    );
  }
  setContextPolicy(policy: "all" | "none") {
    LoggingService.contextPolicy = policy;
  }

  // ——————————————————————————————————————
  // Core decision logic
  // ——————————————————————————————————————
  private shouldLog(lvl: LevelNum): boolean {
    const policy = LoggingService.contextPolicy;
    const ctx = this.context?.toLowerCase();

    if (!ctx) return policy === "all" && lvl >= this.levelNum;

    if (policy === "all") {
      const disabled = LoggingService.enabledContexts.has(`!${ctx}`);
      return lvl >= this.levelNum && !disabled;
    }

    if (policy === "none") {
      const enabled = LoggingService.enabledContexts.has(ctx);
      return lvl >= this.levelNum && enabled;
    }

    return false;
  }

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

    const method = lvl.toLowerCase() as "debug" | "info" | "warn" | "error";
    const fn =
      console && typeof console[method] === "function"
        ? console[method]
        : console.log;

    try {
      if (isBrowser()) fn(`%c${pre}`, browserCss(lvl), ...payload);
      else fn(nodeColor(lvl, pre), ...payload);
    } catch {
      /* ignore console internals */
    }
  }

  debug = (...a: unknown[]) => this.emit("DEBUG", LEVELS.DEBUG, a);
  info = (...a: unknown[]) => this.emit("INFO", LEVELS.INFO, a);
  warn = (...a: unknown[]) => this.emit("WARN", LEVELS.WARN, a);
  error = (...a: unknown[]) => this.emit("ERROR", LEVELS.ERROR, a);
}

export const logger = new LoggingService();
