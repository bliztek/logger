# @bliztek/logger

A lightweight contextual logger for **Node.js** and **Next.js** environments.

![Tests](https://github.com/bliztek/logger/actions/workflows/ci.yml/badge.svg)
![npm version](https://img.shields.io/npm/v/@bliztek/logger.svg)
![license](https://img.shields.io/npm/l/@bliztek/logger.svg)
[![codecov](https://codecov.io/gh/bliztek/logger/graph/badge.svg?token=HDFH8TX66I)](https://codecov.io/gh/bliztek/logger)

Supports:

* Log levels (`DEBUG`, `INFO`, `WARN`, `ERROR`)
* Context isolation (`user`, `auth`, `db`, etc.)
* Context policies (`none` or `all`)
* Runtime and environment-based filtering (`LOGGER_CONTEXTS`, `LOGGER_CONTEXT_POLICY`, `DEBUG`)
* Pretty colors (Node and browser-safe)
* TypeScript-first API

---

## 🚀 Installation

Install with **pnpm**, **npm**, or **yarn**:

```bash
# pnpm (recommended)
pnpm add @bliztek/logger

# npm
npm install @bliztek/logger

# yarn
yarn add @bliztek/logger
```

---

## 🧩 Example Usage

### Basic

```ts
import { logger } from "@bliztek/logger";

logger.info("Server starting...");
logger.warn("Low memory warning");
logger.error("Something went wrong", { code: 500 });
```

---

### With Contexts

```ts
import { logger } from "@bliztek/logger";

// Create scoped loggers
const userLog = logger.child("user");
const authLog = logger.child("auth");

// Enable only specific contexts
logger.enableContexts("user");

userLog.info("User logged in", { id: 42 });
authLog.info("Token refreshed"); // won't log because "auth" not enabled
```

---

### Using Environment Variables

You can configure the logger globally:

```bash
# .env or shell
DEBUG=true
LOGGER_CONTEXTS=user,auth
LOGGER_CONTEXT_POLICY=all
```

**Behavior summary:**

* `LOGGER_CONTEXT_POLICY=none` → nothing logs unless explicitly enabled.
* `LOGGER_CONTEXT_POLICY=all` → all contexts log unless prefixed with `!` in `LOGGER_CONTEXTS`.

---

### Custom Log Level

```ts
import { LoggingService } from "@bliztek/logger";

const debugLogger = new LoggingService({ level: "DEBUG", context: "api" });
debugLogger.setContextPolicy("all");
debugLogger.debug("Detailed debugging info");
```

---

### Browser Support

Works seamlessly in browser builds (e.g., Next.js `app/` or React apps):

```ts
"use client";

import { logger } from "@bliztek/logger";

const uiLogger = logger.child("ui");
uiLogger.setContextPolicy("all");
uiLogger.info("Button clicked!");
```

Logs appear styled in DevTools:

* Gray for DEBUG
* Teal for INFO
* Yellow for WARN
* Red for ERROR

---

## ⚙️ Environment Variables

| Variable                      | Description                                                                            | Example                               |
| ----------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------- |
| `DEBUG`                       | Enables debug-level logging globally                                                   | `DEBUG=true`                          |
| `NEXT_PUBLIC_DEBUG`           | Same as `DEBUG`, but for browser environments                                          | `NEXT_PUBLIC_DEBUG=true`              |
| `LOGGER_CONTEXT_POLICY`       | Controls global behavior (`none` = nothing logs, `all` = all logs)                     | `LOGGER_CONTEXT_POLICY=all`           |
| `LOGGER_CONTEXTS`             | Comma-separated list of enabled contexts (or `!context` to disable under `all` policy) | `LOGGER_CONTEXTS=user,db,!auth`       |
| `NEXT_PUBLIC_LOGGER_CONTEXTS` | Same, but browser-safe                                                                 | `NEXT_PUBLIC_LOGGER_CONTEXTS=ui,test` |

---

## 📦 API Reference

### `logger: LoggingService`

Global singleton instance (default level auto-detected).

#### `.child(context: string)`

Creates a namespaced logger for the given context.

#### `.setLevel(level: "DEBUG" | "INFO" | "WARN" | "ERROR")`

Adjusts verbosity.

#### `.enableContexts(...contexts: string[])`

Enables one or more logging contexts.

#### `.disableContexts(...contexts: string[])`

Disables contexts.

#### `.setContextPolicy(policy: "all" | "none")`

Sets the runtime context policy.

#### `.debug()` / `.info()` / `.warn()` / `.error()`

Standard log methods.

---

## 🧠 Example Output

```
[2025-10-05T17:22:44.012Z] [INFO] [user] User logged in {"id":42}
[2025-10-05T17:22:44.014Z] [WARN] [auth] Token nearing expiry
```

---

## 🛠 Development

### Build

```bash
pnpm build
# or
npm run build
# or
yarn build
```

### Lint

```bash
pnpm lint
# or
npm run lint
# or
yarn lint
```

### Test

```bash
pnpm vitest
# or
npm run test
# or
yarn test
```

### Example Run

```bash
LOGGER_CONTEXT_POLICY=all DEBUG=true tsx packages/logger/examples/demo.ts
```

---

## 🧪 Example File

See [`examples/demo.ts`](./examples/demo.ts) for a working demonstration.

---

## 📄 License

MIT © Bliztek, LLC
