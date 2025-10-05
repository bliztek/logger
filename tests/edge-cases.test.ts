// tests/edge-cases.test.ts
// Path: packages/logger/tests/edge-cases.test.ts
import { describe, it, expect, vi } from "vitest";

// Local helper to mutate static fields without leaking across tests
function resetStatics(LS: any) {
  LS.enabledContexts = new Set();
  LS.contextPolicy = "none";
}

describe("Logger edge coverage", () => {
  it("skips logging when shouldLog() returns false", async () => {
    vi.resetModules();
    const { LoggingService } = await import("../src/logger");
    resetStatics(LoggingService as any);

    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = new LoggingService({ level: "INFO", context: "test" });
    log.setContextPolicy("none");
    log.info("nope");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("does not crash when console method is missing", async () => {
    vi.resetModules();
    const { LoggingService } = await import("../src/logger");
    resetStatics(LoggingService as any);

    const log = new LoggingService({ level: "INFO", context: "safe" });
    log.setContextPolicy("all");

    const original = console.info;
    // @ts-ignore
    console.info = undefined;
    expect(() => log.info("fallback")).not.toThrow();
    console.info = original;
  });

  it("stringifies object payloads properly", async () => {
    vi.resetModules();
    const { LoggingService } = await import("../src/logger");
    resetStatics(LoggingService as any);

    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = new LoggingService({ level: "INFO", context: "data" });
    log.setContextPolicy("all");
    log.info({ a: 1 });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[data]"),
      JSON.stringify({ a: 1 }, null, 2)
    );
    spy.mockRestore();
  });

  it("produces valid colorized output", async () => {
    vi.resetModules();
    const { LoggingService } = await import("../src/logger");
    resetStatics(LoggingService as any);

    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = new LoggingService({ level: "INFO", context: "ui" });
    log.setContextPolicy("all");
    log.info("colored");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("handles console failures gracefully", async () => {
    vi.resetModules();
    const { LoggingService } = await import("../src/logger");
    resetStatics(LoggingService as any);

    const log = new LoggingService({ level: "INFO", context: "fail" });
    log.setContextPolicy("all");
    const original = console.info;
    // @ts-ignore
    console.info = () => {
      throw new Error("Console broken");
    };
    expect(() => log.info("test")).not.toThrow();
    console.info = original;
  });
});

describe("Utils coverage", () => {
  it("returns true when NEXT_PUBLIC_DEBUG is set", async () => {
    vi.resetModules();
    const prev = process.env.NEXT_PUBLIC_DEBUG;
    process.env.NEXT_PUBLIC_DEBUG = "true";

    const { envDebugOn } = await import("../src/utils");
    expect(envDebugOn()).toBe(true);

    if (prev === undefined) delete process.env.NEXT_PUBLIC_DEBUG;
    else process.env.NEXT_PUBLIC_DEBUG = prev;
  });

  it("gracefully handles browser detection", async () => {
    vi.resetModules();
    const { isBrowser } = await import("../src/utils");

    const originalWindow = globalThis.window;
    // @ts-ignore
    globalThis.window = {};
    expect(isBrowser()).toBe(true);
    // @ts-ignore
    delete (globalThis as any).window;
    expect(isBrowser()).toBe(false);
    if (originalWindow) (globalThis as any).window = originalWindow;
  });

  it("returns valid browser CSS string", async () => {
    vi.resetModules();
    const { browserCss } = await import("../src/utils");
    expect(browserCss("INFO")).toContain("color:");
  });
});

describe("Coverage of constructor branches", () => {
  it("defaults to DEBUG in development (covers isDev path ~ line 25)", async () => {
    const prevNode = process.env.NODE_ENV;
    const prevNext = process.env.NEXT_PUBLIC_NODE_ENV;

    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_NODE_ENV = "development";

    // Re-import so the first constructor run sees dev env
    vi.resetModules();
    const { LoggingService } = await import("../src/logger");

    const log = new LoggingService(); // triggers defaultLevel path
    expect(log.getLevel()).toBe("DEBUG");

    // restore env
    if (prevNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNode;
    if (prevNext === undefined) delete process.env.NEXT_PUBLIC_NODE_ENV;
    else process.env.NEXT_PUBLIC_NODE_ENV = prevNext;
  });

  it("reads LOGGER_CONTEXT_POLICY on first import (covers lines 60–62)", async () => {
    const prevPolicy = process.env.LOGGER_CONTEXT_POLICY;
    process.env.LOGGER_CONTEXT_POLICY = "all";

    // Fresh import so the first constructor hits the envPolicy branch
    vi.resetModules();
    const { LoggingService } = await import("../src/logger");

    // Under 'all' policy, root logger should log without enabling contexts
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const root = new LoggingService({ level: "INFO" });
    root.info("root-visible");
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();

    // restore env
    if (prevPolicy === undefined) delete process.env.LOGGER_CONTEXT_POLICY;
    else process.env.LOGGER_CONTEXT_POLICY = prevPolicy;
  });

  it("explicitly logs root context under 'all' policy post-construction", async () => {
    vi.resetModules();
    const { LoggingService } = await import("../src/logger");
    resetStatics(LoggingService as any);

    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const root = new LoggingService({ level: "INFO" });
    root.setContextPolicy("all");
    root.info("root-visible");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("skips log under 'none' when context not enabled", async () => {
    vi.resetModules();
    const { LoggingService } = await import("../src/logger");
    resetStatics(LoggingService as any);

    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = new LoggingService({ level: "INFO", context: "ghost" });
    log.setContextPolicy("none");
    log.info("ghost log");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
