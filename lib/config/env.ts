/**
 * Environment Configuration
 * Location: /lib/config/env.ts
 * Purpose: Validates and exports environment variables with type safety.
 * Ensures all required environment variables are present at build/runtime.
 */

import { logger } from '../utils/logger'

/**
 * Environment variable schema
 */
interface EnvironmentVariables {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string

  // App
  NEXT_PUBLIC_APP_URL: string
  NODE_ENV: 'development' | 'production' | 'test'

  // Optional: Security
  ENCRYPTION_KEY?: string
  ENCRYPTION_IV?: string
  CRON_SECRET?: string

  // Optional: External Services
  SENTRY_DSN?: string
  SHOPIFY_API_VERSION?: string
}

/**
 * Validate required environment variables
 */
function validateEnv(): EnvironmentVariables {
  const errors: string[] = []

  // Required variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
  ]

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }

  // Validate URL formats
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    }
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_APP_URL)
    } catch {
      errors.push('NEXT_PUBLIC_APP_URL must be a valid URL')
    }
  }

  // Validate encryption configuration
  if (process.env.ENCRYPTION_KEY) {
    if (process.env.ENCRYPTION_KEY.length !== 64) {
      errors.push('ENCRYPTION_KEY must be 64 characters (32 bytes in hex)')
    }
    if (!process.env.ENCRYPTION_IV) {
      errors.push('ENCRYPTION_IV is required when ENCRYPTION_KEY is set')
    } else if (process.env.ENCRYPTION_IV.length !== 32) {
      errors.push('ENCRYPTION_IV must be 32 characters (16 bytes in hex)')
    }
  }

  // Log warnings for missing optional vars in production
  if (process.env.NODE_ENV === 'production') {
    const recommendedVars = ['ENCRYPTION_KEY', 'CRON_SECRET', 'SENTRY_DSN']
    for (const varName of recommendedVars) {
      if (!process.env[varName]) {
        logger.warn(`Recommended environment variable not set: ${varName}`)
      }
    }
  }

  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.join('\n')}`
    logger.error(errorMessage)
    throw new Error(errorMessage)
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    ENCRYPTION_IV: process.env.ENCRYPTION_IV,
    CRON_SECRET: process.env.CRON_SECRET,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION || '2024-01',
  }
}

// Validate and export environment variables
export const env = validateEnv()

// Export helper functions
export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

