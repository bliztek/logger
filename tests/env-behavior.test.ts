import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoggingService } from "../src/logger";

describe("Environment variable behavior", () => {
  beforeEach(() => {
    delete process.env.DEBUG;
    delete process.env.LOGGER_CONTEXTS;
  });

  it("respects DEBUG=true for default level", () => {
    process.env.DEBUG = "true";
    const log = new LoggingService({ context: "envtest" });
    expect(log.getLevel()).toBe("DEBUG");
  });

  it("filters based on LOGGER_CONTEXTS", () => {
    process.env.LOGGER_CONTEXTS = "user";
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const log = new LoggingService({ context: "db" });
    log.info("nope");
    expect(spy).not.toHaveBeenCalled();
  });
});
