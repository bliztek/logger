import { logger, LoggingService } from "@bliztek/logger";

/**
 * DEMO CONFIGURATION
 * -------------------
 * Run this file with different environment setups to see behavior changes:
 *
 * Examples:
 *  1️⃣ No logging (default behavior):
 *      LOGGER_CONTEXT_POLICY=none tsx packages/logger/examples/demo.ts
 *
 *  2️⃣ Log *everything*:
 *      LOGGER_CONTEXT_POLICY=all tsx packages/logger/examples/demo.ts
 *
 *  3️⃣ Log only specific contexts:
 *      LOGGER_CONTEXT_POLICY=none LOGGER_CONTEXTS=user,db tsx packages/logger/examples/demo.ts
 *
 *  4️⃣ Log everything except one context (by prefixing with "!"):
 *      LOGGER_CONTEXT_POLICY=all LOGGER_CONTEXTS=!auth tsx packages/logger/examples/demo.ts
 *
 * You can also use DEBUG=true to drop the minimum level threshold to "DEBUG".
 */

// ────────────────────────────────────────────────────────────────
// Create some contextual loggers
// ────────────────────────────────────────────────────────────────
const systemLog = logger.child("system");
const userLog = logger.child("user");
const authLog = logger.child("auth");
const dbLog = logger.child("db");

// ────────────────────────────────────────────────────────────────
// Display environment setup summary
// ────────────────────────────────────────────────────────────────
console.log("\n=== LOGGER DEMO START ===");
console.log("NODE_ENV:", process.env.NODE_ENV ?? "(not set)");
console.log("DEBUG:", process.env.DEBUG);
console.log("LOGGER_CONTEXT_POLICY:", process.env.LOGGER_CONTEXT_POLICY);
console.log("LOGGER_CONTEXTS:", process.env.LOGGER_CONTEXTS);
console.log("==========================\n");

// ────────────────────────────────────────────────────────────────
// Demo 1: Default behavior (policy controls output)
// ────────────────────────────────────────────────────────────────
systemLog.info("System initialized"); // logs if policy = all or explicitly enabled
userLog.debug("Debugging user profile load");
authLog.info("Auth token refreshed");
dbLog.warn("DB connection latency high");

// ────────────────────────────────────────────────────────────────
// Demo 2: Manual override within code
// ────────────────────────────────────────────────────────────────
logger.setContextPolicy("all"); // Force everything to log regardless of env
logger.enableContexts("user", "db"); // Optional: explicitly control contexts
console.log("\n--- After forcing policy=all ---\n");

systemLog.info("Forced log: system event");
userLog.info("Forced log: user event");
authLog.info("Forced log: auth event");
dbLog.info("Forced log: database event");

// ────────────────────────────────────────────────────────────────
// Demo 3: Custom instance example
// ────────────────────────────────────────────────────────────────
const apiLogger = new LoggingService({ level: "DEBUG", context: "api" });
apiLogger.debug("GET /api/users", { userId: 42 });
apiLogger.info("Response sent", { status: 200 });

// ────────────────────────────────────────────────────────────────
// Done
// ────────────────────────────────────────────────────────────────
console.log("\n=== LOGGER DEMO COMPLETE ===\n");
