/**
 * Logging Utility
 * Location: /lib/utils/logger.ts
 * Purpose: Centralized logging system for consistent error tracking and debugging.
 * In production, this can be integrated with services like Sentry, LogRocket, etc.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, any>
  timestamp: string
  userId?: string
  requestId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${
      entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : ''
    }${entry.userId ? ` | User: ${entry.userId}` : ''}${
      entry.requestId ? ` | Request: ${entry.requestId}` : ''
    }`
  }

  /**
   * Send log to external service (Sentry, LogRocket, etc.)
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // In production, implement integration with logging service
    // Example: Sentry.captureException(entry)
    // For now, this is a placeholder
    if (!this.isDevelopment && entry.level === 'error') {
      // TODO: Implement external error tracking
      console.error('Would send to external service:', entry)
    }
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
    }

    const formattedLog = this.formatLog(entry)

    // Console output
    switch (level) {
      case 'error':
        console.error(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedLog)
        }
        break
      default:
        console.log(formattedLog)
    }

    // Send to external service for errors
    if (level === 'error') {
      this.sendToExternalService(entry)
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context)
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context)
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    }
    this.log('error', message, errorContext)
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context)
  }

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, context?: Record<string, any>): void {
    this.info(`API Request: ${method} ${path}`, context)
  }

  /**
   * Log API response
   */
  apiResponse(method: string, path: string, status: number, duration?: number): void {
    const message = `API Response: ${method} ${path} - ${status}`
    const context = duration ? { duration: `${duration}ms` } : undefined

    if (status >= 500) {
      this.error(message, undefined, context)
    } else if (status >= 400) {
      this.warn(message, context)
    } else {
      this.info(message, context)
    }
  }

  /**
   * Log database query
   */
  dbQuery(operation: string, table: string, context?: Record<string, any>): void {
    this.debug(`DB Query: ${operation} on ${table}`, context)
  }

  /**
   * Log authentication event
   */
  auth(event: string, userId?: string, context?: Record<string, any>): void {
    this.info(`Auth: ${event}`, { ...context, userId })
  }

  /**
   * Log integration event
   */
  integration(platform: string, event: string, context?: Record<string, any>): void {
    this.info(`Integration (${platform}): ${event}`, context)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for testing or custom instances
export { Logger }

