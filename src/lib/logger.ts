import pino, { Logger as PinoLogger } from "pino";

// The base Pino logger instance
const pinoLogger: PinoLogger =
  process.env["NODE_ENV"] === "production"
    ? // JSON in production
      pino({ level: "warn" })
    : // Pretty print in development
      pino({
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
        level: "debug",
      });

// Extended logger interface that supports our application's logging pattern
export interface Logger {
  debug(action: string, message: string, context?: object): void;
  info(action: string, message: string, context?: object): void;
  warn(action: string, message: string, context?: object): void;
  error(action: string, message: string, context?: object): void;
  child(bindings: object): Logger;
}

// Implementation of our custom logger that wraps Pino
class CustomLogger implements Logger {
  private logger: PinoLogger;

  constructor(logger: PinoLogger) {
    this.logger = logger;
  }

  debug(action: string, message: string, context: object = {}) {
    this.logger.debug({ action, ...context }, message);
  }

  info(action: string, message: string, context: object = {}) {
    this.logger.info({ action, ...context }, message);
  }

  warn(action: string, message: string, context: object = {}) {
    this.logger.warn({ action, ...context }, message);
  }

  error(action: string, message: string, context: object = {}) {
    this.logger.error({ action, ...context }, message);
  }

  child(bindings: object): Logger {
    return new CustomLogger(this.logger.child(bindings));
  }
}

// Export the enhanced logger
export const logger: Logger = new CustomLogger(pinoLogger);