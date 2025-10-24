/**
 * Error Handler Utility
 * Location: /lib/utils/error-handler.ts
 * Purpose: Centralized error handling for try-catch blocks and async operations.
 * Ensures consistent error processing across the application.
 */

import { NextResponse } from 'next/server'
import { PostgrestError } from '@supabase/supabase-js'
import { logger } from './logger'
import { errorResponse, ErrorCode, internalErrorResponse } from './api-response'

/**
 * Handle Supabase errors
 */
export function handleSupabaseError(error: PostgrestError, operation: string): NextResponse {
  logger.error(`Supabase error during ${operation}`, error, {
    code: error.code,
    details: error.details,
    hint: error.hint,
  })

  // Check for specific error codes
  if (error.code === 'PGRST116') {
    return errorResponse(
      ErrorCode.NOT_FOUND,
      'Resource not found',
      { operation }
    )
  }

  if (error.code === '23505') {
    return errorResponse(
      ErrorCode.CONFLICT,
      'Resource already exists',
      { operation }
    )
  }

  if (error.code === '23503') {
    return errorResponse(
      ErrorCode.BAD_REQUEST,
      'Invalid reference. Related resource not found.',
      { operation }
    )
  }

  return errorResponse(
    ErrorCode.DATABASE_ERROR,
    `Database ${operation} failed`,
    { hint: error.hint }
  )
}

/**
 * Handle fetch/external API errors
 */
export function handleExternalApiError(
  error: any,
  service: string
): NextResponse {
  logger.error(`External API error (${service})`, error)

  return errorResponse(
    ErrorCode.EXTERNAL_API_ERROR,
    `Failed to communicate with ${service}. Please try again later.`,
    { service }
  )
}

/**
 * Handle unknown errors
 */
export function handleUnknownError(error: unknown, context?: string): NextResponse {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
  
  logger.error(
    context ? `Unknown error in ${context}` : 'Unknown error',
    error instanceof Error ? error : undefined,
    { context }
  )

  return internalErrorResponse(
    process.env.NODE_ENV === 'development' 
      ? errorMessage 
      : 'An unexpected error occurred. Please try again.'
  )
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleUnknownError(error, context)
    }
  }
}

/**
 * Handle validation errors
 */
export function handleValidationErrors(errors: Record<string, string>): NextResponse {
  logger.warn('Validation errors', { errors })

  return errorResponse(
    ErrorCode.VALIDATION_ERROR,
    'Invalid input data',
    errors
  )
}

/**
 * Assert condition or throw error
 */
export function assert(condition: boolean, message: string, code: ErrorCode = ErrorCode.BAD_REQUEST): void {
  if (!condition) {
    throw new ApiError(message, code)
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Handle ApiError instances
 */
export function handleApiError(error: ApiError): NextResponse {
  return errorResponse(
    error.code,
    error.message,
    error.details,
    undefined,
    error.statusCode
  )
}

/**
 * Safe async function executor with error handling
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<[T | null, Error | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    if (errorMessage) {
      logger.error(errorMessage, error instanceof Error ? error : undefined)
    }
    return [null, error instanceof Error ? error : new Error('Unknown error')]
  }
}

