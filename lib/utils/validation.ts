/**
 * Validation Utilities
 * Location: /lib/utils/validation.ts
 * Purpose: Centralized validation functions for consistent input validation
 * across the application. Ensures data integrity and security.
 */

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

/**
 * Validates UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validates tracking number format (basic)
 */
export function isValidTrackingNumber(trackingNumber: string): boolean {
  // Basic validation: alphanumeric, 6-50 characters
  const trackingRegex = /^[A-Za-z0-9]{6,50}$/
  return trackingRegex.test(trackingNumber.replace(/[\s-]/g, ''))
}

/**
 * Validates shipment status
 */
export function isValidShipmentStatus(status: string): boolean {
  const validStatuses = ['pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled']
  return validStatuses.includes(status)
}

/**
 * Validates platform type
 */
export function isValidPlatform(platform: string): boolean {
  const validPlatforms = ['shopify', 'tiktok_shop']
  return validPlatforms.includes(platform)
}

/**
 * Validates product status
 */
export function isValidProductStatus(status: string): boolean {
  const validStatuses = ['active', 'draft', 'archived']
  return validStatuses.includes(status)
}

/**
 * Validates sync status
 */
export function isValidSyncStatus(status: string): boolean {
  const validStatuses = ['pending', 'synced', 'error', 'disabled']
  return validStatuses.includes(status)
}

/**
 * Sanitizes string input (removes potential XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validates string length
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  const length = str.trim().length
  return length >= min && length <= max
}

/**
 * Validates positive number
 */
export function isPositiveNumber(num: any): boolean {
  return typeof num === 'number' && !isNaN(num) && num > 0
}

/**
 * Validates integer
 */
export function isValidInteger(num: any): boolean {
  return Number.isInteger(num) && num >= 0
}

/**
 * Validates price format
 */
export function isValidPrice(price: any): boolean {
  if (typeof price !== 'number') return false
  if (isNaN(price)) return false
  if (price < 0) return false
  // Check max 2 decimal places
  return /^\d+(\.\d{1,2})?$/.test(price.toString())
}

/**
 * Validates Shopify domain
 */
export function isValidShopifyDomain(domain: string): boolean {
  const shopifyRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/
  return shopifyRegex.test(domain) || /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(domain)
}

/**
 * Validates access token format (basic check)
 */
export function isValidAccessToken(token: string): boolean {
  // Basic validation: non-empty, reasonable length
  return token.length >= 10 && token.length <= 500 && /^[A-Za-z0-9_-]+$/.test(token)
}

/**
 * Comprehensive request body validator
 */
export interface ValidationRule {
  field: string
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'uuid'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  custom?: (value: any) => boolean
  customError?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateRequest(
  data: any,
  rules: ValidationRule[]
): ValidationResult {
  const errors: Record<string, string> = {}

  for (const rule of rules) {
    const value = data[rule.field]

    // Check required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[rule.field] = `${rule.field} is required`
      continue
    }

    // Skip validation if field is not required and not provided
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue
    }

    // Type validation
    if (rule.type) {
      switch (rule.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors[rule.field] = `${rule.field} must be a string`
          }
          break
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors[rule.field] = `${rule.field} must be a number`
          }
          break
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors[rule.field] = `${rule.field} must be a boolean`
          }
          break
        case 'email':
          if (!isValidEmail(value)) {
            errors[rule.field] = `${rule.field} must be a valid email`
          }
          break
        case 'url':
          if (!isValidUrl(value)) {
            errors[rule.field] = `${rule.field} must be a valid URL`
          }
          break
        case 'uuid':
          if (!isValidUUID(value)) {
            errors[rule.field] = `${rule.field} must be a valid UUID`
          }
          break
      }
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors[rule.field] = `${rule.field} must be at least ${rule.minLength} characters`
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[rule.field] = `${rule.field} must be at most ${rule.maxLength} characters`
      }
    }

    // Range validation for numbers
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors[rule.field] = `${rule.field} must be at least ${rule.min}`
      }
      if (rule.max !== undefined && value > rule.max) {
        errors[rule.field] = `${rule.field} must be at most ${rule.max}`
      }
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors[rule.field] = rule.customError || `${rule.field} is invalid`
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

