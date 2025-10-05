import type { LevelName, LevelNum } from "./types";

export const LEVELS: Record<LevelName, LevelNum> = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
};

export const isBrowser = () => typeof window !== "undefined";

export const envDebugOn = () => {
  const sv =
    typeof process !== "undefined" &&
    process.env.DEBUG?.toLowerCase() === "true";
  const cv =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_DEBUG?.toLowerCase() === "true";
  return sv || cv;
};

export const timestamp = () => new Date().toISOString();

export const nodeColor = (lvl: LevelName, s: string) => {
  const map: Record<LevelName, string> = {
    DEBUG: "\x1b[90m",
    INFO: "\x1b[36m",
    WARN: "\x1b[33m",
    ERROR: "\x1b[31m",
  };
  return `${map[lvl]}${s}\x1b[0m`;
};

export const browserCss = (lvl: LevelName) => {
  const map: Record<LevelName, string> = {
    DEBUG: "color: gray",
    INFO: "color: teal",
    WARN: "color: goldenrod",
    ERROR: "color: crimson",
  };
  return map[lvl];
};
