// tests/level-filtering.test.ts
import { describe, expect, it, vi } from "vitest";
import { LoggingService } from "../src/logger";

describe("Level filtering", () => {
  it("does not log below set level", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const log = new LoggingService({ level: "INFO" });
    log.setContextPolicy("all"); // ensure output not filtered by context
    log.debug("hidden");
    expect(spy).not.toHaveBeenCalled();
  });

  it("logs equal or higher level", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const log = new LoggingService({ level: "WARN" });
    log.setContextPolicy("all"); // allow all contexts for this test
    log.warn("shown");
    expect(spy).toHaveBeenCalled();
  });
});
