/**
 * API Response Utilities
 * Location: /lib/utils/api-response.ts
 * Purpose: Standardized API response formats for consistent client-side handling.
 * Ensures all API responses follow the same structure.
 */

import { NextResponse } from 'next/server'
import { logger } from './logger'

/**
 * Standard success response interface
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    [key: string]: any
  }
}

/**
 * Standard error response interface
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    field?: string
  }
}

/**
 * Error codes enum
 */
export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
}

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  meta?: any,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta,
    },
    { status }
  )
}

/**
 * Create error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  details?: any,
  field?: string,
  status?: number
): NextResponse<ApiErrorResponse> {
  // Determine status code based on error code
  const statusCode = status || getStatusCodeFromErrorCode(code)

  // Log error
  logger.error(`API Error: ${code} - ${message}`, undefined, { code, details, field })

  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
        field,
      },
    },
    { status: statusCode }
  )
}

/**
 * Get HTTP status code from error code
 */
function getStatusCodeFromErrorCode(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.BAD_REQUEST:
    case ErrorCode.VALIDATION_ERROR:
      return 400
    case ErrorCode.UNAUTHORIZED:
      return 401
    case ErrorCode.FORBIDDEN:
      return 403
    case ErrorCode.NOT_FOUND:
      return 404
    case ErrorCode.CONFLICT:
      return 409
    case ErrorCode.RATE_LIMIT_EXCEEDED:
      return 429
    case ErrorCode.INTERNAL_ERROR:
    case ErrorCode.DATABASE_ERROR:
    case ErrorCode.EXTERNAL_API_ERROR:
      return 500
    default:
      return 500
  }
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  errors: Record<string, string>
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ErrorCode.VALIDATION_ERROR,
    'Validation failed',
    errors
  )
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(
  message: string = 'Authentication required'
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ErrorCode.UNAUTHORIZED,
    message
  )
}

/**
 * Not found response
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ErrorCode.NOT_FOUND,
    `${resource} not found`
  )
}

/**
 * Rate limit response
 */
export function rateLimitResponse(
  retryAfter?: number
): NextResponse<ApiErrorResponse> {
  const response = errorResponse(
    ErrorCode.RATE_LIMIT_EXCEEDED,
    'Too many requests. Please try again later.'
  )

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString())
  }

  return response
}

/**
 * Internal server error response
 */
export function internalErrorResponse(
  message: string = 'An internal server error occurred'
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ErrorCode.INTERNAL_ERROR,
    message
  )
}

/**
 * Database error response
 */
export function databaseErrorResponse(
  operation: string = 'operation'
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ErrorCode.DATABASE_ERROR,
    `Database ${operation} failed. Please try again.`
  )
}

/**
 * Conflict response
 */
export function conflictResponse(
  message: string = 'Resource already exists'
): NextResponse<ApiErrorResponse> {
  return errorResponse(
    ErrorCode.CONFLICT,
    message
  )
}

/**
 * Created response
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return successResponse(data, message, undefined, 201)
}

/**
 * No content response
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiSuccessResponse<T[]>> {
  return successResponse(
    data,
    undefined,
    {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    }
  )
}

