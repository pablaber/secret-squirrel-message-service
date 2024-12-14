import { pino } from "pino";

const logLevel = Deno.env.get("LOG_LEVEL") || "info";

export const logger = pino({
  level: logLevel,
  base: {
    hostname: undefined,
    pid: undefined,
  }
});
