/**
 * Logging utility for the application
 * Provides structured logging that works with Azure App Service and other environments
 * 
 * Configuration:
 * - Set LOG_LEVEL environment variable in Azure App Service to control log verbosity
 *   (DEBUG, INFO, WARN, ERROR - defaults to INFO if not set)
 * 
 * Usage with Azure App Service:
 * 1. This logging system outputs to console which is automatically captured by Azure App Service
 * 2. View logs in Azure Portal under your App Service > Monitoring > Log Stream
 * 3. For advanced log analysis, configure Application Insights or Log Analytics
 * 4. To export logs to other systems, consider adding Azure Monitor integration
 * 
 * Structured logging format is designed to be easily parsed by log analytics tools
 */

// Enum for log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Log message structure
export interface LogMessage {
  timestamp: string;
  level: LogLevel;
  module: string;
  action: string;
  message: string;
  userId?: string;
  email?: string;
  requestId?: string;
  clientIP?: string;
  error?: Error | unknown;
  data?: Record<string, unknown>;
}

/**
 * Creates a formatted log string that works well with Azure App Service logs
 */
function formatLogMessage(logMessage: LogMessage): string {
  const { timestamp, level, module, action, message, userId, email, requestId, clientIP, error, data } = logMessage;
  
  // Create base log message
  let logString = `[${timestamp}] [${level}] [${module}:${action}] ${message}`;
  
  // Add identity information if available
  if (userId) logString += ` | userId:${userId}`;
  if (email) logString += ` | email:${email}`;
  if (requestId) logString += ` | requestId:${requestId}`;
  if (clientIP) logString += ` | clientIP:${clientIP}`;
  
  // Add error information if available
  if (error) {
    if (error instanceof Error) {
      logString += ` | error:${error.message} | stack:${error.stack}`;
    } else {
      logString += ` | error:${String(error)}`;
    }
  }
  
  // Add additional data if available
  if (data && Object.keys(data).length > 0) {
    try {
      logString += ` | data:${JSON.stringify(data)}`;
    } catch (e) {
      logString += ` | data:[Error serializing data]`;
    }
  }
  
  return logString;
}

/**
 * Determines if a log message should be written based on environment and level
 */
function shouldLog(level: LogLevel): boolean {
  const envLogLevel = process.env.LOG_LEVEL || LogLevel.INFO;
  
  const levelPriority = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
  };
  
  return levelPriority[level] >= levelPriority[envLogLevel as LogLevel];
}

/**
 * Logs a message to the console in a format compatible with Azure App Service logs
 */
export function log(logMessage: Omit<LogMessage, 'timestamp'>): void {
  const timestamp = new Date().toISOString();
  const fullLogMessage = { ...logMessage, timestamp };
  
  if (!shouldLog(logMessage.level)) return;
  
  const formattedMessage = formatLogMessage(fullLogMessage);
  
  switch (logMessage.level) {
    case LogLevel.DEBUG:
      console.debug(formattedMessage);
      break;
    case LogLevel.INFO:
      console.log(formattedMessage);
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage);
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
}

/**
 * Creates a logger for a specific module
 */
export function createLogger(module: string) {
  return {
    debug: (action: string, message: string, options?: Omit<LogMessage, 'timestamp' | 'level' | 'module' | 'action' | 'message'>) => {
      log({ level: LogLevel.DEBUG, module, action, message, ...options });
    },
    info: (action: string, message: string, options?: Omit<LogMessage, 'timestamp' | 'level' | 'module' | 'action' | 'message'>) => {
      log({ level: LogLevel.INFO, module, action, message, ...options });
    },
    warn: (action: string, message: string, options?: Omit<LogMessage, 'timestamp' | 'level' | 'module' | 'action' | 'message'>) => {
      log({ level: LogLevel.WARN, module, action, message, ...options });
    },
    error: (action: string, message: string, options?: Omit<LogMessage, 'timestamp' | 'level' | 'module' | 'action' | 'message'>) => {
      log({ level: LogLevel.ERROR, module, action, message, ...options });
    }
  };
} 