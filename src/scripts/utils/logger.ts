import "dotenv/config";
import { createLogger, transports, format } from "winston";
import "winston-daily-rotate-file";
import color from "./color";

const infoFileRotateTransport = new transports.DailyRotateFile({
  level: "info",
  filename: "src/scripts/logs/info/%DATE%-info.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  zippedArchive: true,
});
const errorFileRotateTransport = new transports.DailyRotateFile({
  level: "error",
  filename: "src/scripts/logs/error/%DATE%-error.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  zippedArchive: true,
});

export const logger = createLogger({
  defaultMeta: {
    service: "Query Saver",
  },
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: `HH:mm:ss.SSS` }),
    format.json(),
    format.prettyPrint()
  ),
  transports: [
    infoFileRotateTransport,
    errorFileRotateTransport,
    new transports.Console({
      level: "debug",
      format: format.combine(
        format.prettyPrint(),
        format.errors({ stack: true }),
        format.printf(function ({ level, message, timestamp }) {
          return `${color(
            `${timestamp}`,
            "blackBright"
          )} [${level.toUpperCase()}]: ${color(`${message}`, "cyan")}`;
        }),
        format.colorize({ all: true })
      ),
    }),
  ],
});
