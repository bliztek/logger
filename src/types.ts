export type LevelName = "DEBUG" | "INFO" | "WARN" | "ERROR";
export type LevelNum = 10 | 20 | 30 | 40;

export interface ILogger {
  setLevel(level: LevelName): void;
  getLevel(): LevelName;
  child(context: string): ILogger;
  enableContexts(...contexts: string[]): void;
  disableContexts(...contexts: string[]): void;
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}
