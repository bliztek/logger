import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoggingService, logger } from "../src/logger";

describe("Context-based filtering", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    logger.disableContexts("user", "db", "test");
  });

  it("can instantiate a custom LoggingService", () => {
    const custom = new LoggingService({ context: "custom" });
    expect(custom).toBeInstanceOf(LoggingService);
  });

  it("logs when policy is 'all'", () => {
    logger.setContextPolicy("all"); // ✅ open logging

    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const userLog = logger.child("user");
    userLog.info("visible");

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[user]"),
      "visible"
    );
  });

  it("logs only when context is enabled under 'none' policy", () => {
    logger.setContextPolicy("none"); // ✅ strict mode

    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const userLog = logger.child("user");
    const dbLog = logger.child("db");

    logger.enableContexts("user");
    userLog.info("user ok");
    dbLog.info("db no");

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[user]"),
      "user ok"
    );
    expect(spy).not.toHaveBeenCalledWith(
      expect.stringContaining("[db]"),
      "db no"
    );
  });

  it("supports multiple enabled contexts", () => {
    logger.setContextPolicy("none");
    logger.enableContexts("user", "db");

    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const userLog = logger.child("user");
    const dbLog = logger.child("db");

    userLog.info("user ok");
    dbLog.info("db ok");

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
