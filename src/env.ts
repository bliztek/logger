/**
 * Cross-platform environment variable getter
 * Works in Node, Browser, and Vite environments safely.
 */
export function getEnvVar(key: string): string | undefined {
  // 🟩 Node / Vitest / Jest
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }

  // 🟦 Browser (with optional injected globals)
  if (typeof window !== "undefined") {
    const win = window as any;
    if (win.__LOGGER_ENV__?.[key]) return win.__LOGGER_ENV__[key];
  }

  // 🟨 Vite / ESM (import.meta.env)
  // Access import.meta dynamically via Function constructor to avoid TS parse errors
  try {
    const metaEnv = new Function(
      "return typeof import !== 'undefined' && import.meta?.env ? import.meta.env : undefined"
    )();
    if (metaEnv && key in metaEnv) {
      return metaEnv[key];
    }
  } catch {
    // ignored if import.meta is unavailable
  }

  return undefined;
}
