import { pino } from "pino";

const logLevel = process.env.LOG_LEVEL || "info";

export const logger = pino({
  level: logLevel,
  base: {
    hostname: undefined,
    pid: undefined,
  }
});
