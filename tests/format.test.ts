import { describe, expect, it, vi } from "vitest";
import { logger } from "../src/logger";

describe("Log format", () => {
  it("includes timestamp and context", () => {
    // explicitly allow logging for this test
    logger.setContextPolicy("all");

    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const testLog = logger.child("test");
    testLog.info("format");

    // make sure a log actually occurred
    expect(spy).toHaveBeenCalled();

    const args = spy.mock.calls[0][0];
    expect(args).toMatch(/\[\d{4}-\d{2}-\d{2}T/); // ISO timestamp
    expect(args).toContain("[INFO]");
    expect(args).toContain("[test]");
  });
});
