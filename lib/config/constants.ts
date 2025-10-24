/**
 * Application Constants
 * Location: /lib/config/constants.ts
 * Purpose: Centralized constants for the application.
 * Makes it easy to update values and maintain consistency.
 */

/**
 * API Rate Limiting
 */
export const RATE_LIMITS = {
  // General endpoints
  DEFAULT: {
    interval: 60000, // 1 minute
    requests: 30,
  },
  
  // Auth endpoints
  AUTH: {
    interval: 60000, // 1 minute
    requests: 5,
  },
  
  // Shipments endpoints
  SHIPMENTS_READ: {
    interval: 60000,
    requests: 50,
  },
  SHIPMENTS_WRITE: {
    interval: 60000,
    requests: 20,
  },
  
  // Integration endpoints
  INTEGRATIONS_READ: {
    interval: 60000,
    requests: 30,
  },
  INTEGRATIONS_WRITE: {
    interval: 60000,
    requests: 5,
  },
  
  // Sync operations
  SYNC: {
    interval: 300000, // 5 minutes
    requests: 3,
  },
} as const

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

/**
 * Validation Limits
 */
export const VALIDATION_LIMITS = {
  // Strings
  TRACKING_NUMBER: { min: 6, max: 50 },
  TITLE: { min: 1, max: 200 },
  DESCRIPTION: { min: 0, max: 2000 },
  LOCATION: { min: 0, max: 200 },
  URL: { min: 0, max: 500 },
  EMAIL: { min: 5, max: 254 },
  PASSWORD: { min: 6, max: 100 },
  NAME: { min: 1, max: 100 },
  
  // Numbers
  PRICE: { min: 0, max: 999999.99 },
  INVENTORY: { min: 0, max: 999999 },
} as const

/**
 * Shipment Statuses
 */
export const SHIPMENT_STATUS = {
  PENDING: 'pending',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const

export const SHIPMENT_STATUSES = Object.values(SHIPMENT_STATUS)

/**
 * Product Statuses
 */
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
} as const

export const PRODUCT_STATUSES = Object.values(PRODUCT_STATUS)

/**
 * Sync Statuses
 */
export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCED: 'synced',
  ERROR: 'error',
  DISABLED: 'disabled',
} as const

export const SYNC_STATUSES = Object.values(SYNC_STATUS)

/**
 * Integration Platforms
 */
export const PLATFORM = {
  SHOPIFY: 'shopify',
  TIKTOK_SHOP: 'tiktok_shop',
} as const

export const PLATFORMS = Object.values(PLATFORM)

/**
 * Sync Types
 */
export const SYNC_TYPE = {
  PRICE: 'price',
  INVENTORY: 'inventory',
  FULL: 'full',
} as const

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  CARRIERS: 3600, // 1 hour
  PRODUCTS: 300, // 5 minutes
  INTEGRATIONS: 600, // 10 minutes
  DASHBOARD_STATS: 60, // 1 minute
} as const

/**
 * File Upload Limits
 */
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
} as const

/**
 * Shopify Configuration
 */
export const SHOPIFY_CONFIG = {
  API_VERSION: '2024-01',
  REQUIRED_SCOPES: [
    'read_products',
    'write_products',
    'read_inventory',
    'write_inventory',
  ],
} as const

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  // Auth
  UNAUTHORIZED: 'Authentication required. Please sign in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  
  // Validation
  INVALID_INPUT: 'Invalid input data provided.',
  REQUIRED_FIELD: 'This field is required.',
  
  // Database
  NOT_FOUND: 'The requested resource was not found.',
  ALREADY_EXISTS: 'A resource with this identifier already exists.',
  DATABASE_ERROR: 'A database error occurred. Please try again.',
  
  // Rate Limiting
  RATE_LIMIT: 'Too many requests. Please try again later.',
  
  // Server
  INTERNAL_ERROR: 'An internal server error occurred. Please try again.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
} as const

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SYNCED: 'Synced successfully',
} as const

/**
 * Routes
 */
export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  SHIPMENTS: '/shipments',
  ADD_SHIPMENT: '/add-shipment',
  TRACK: '/track',
  INTEGRATIONS: '/integrations',
  PRODUCTS: '/products',
  PRODUCT_LINKS: '/product-links',
} as const

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  CARRIERS: '/api/carriers',
  SHIPMENTS: '/api/shipments',
  DASHBOARD_STATS: '/api/dashboard/stats',
  INTEGRATIONS: '/api/integrations',
  PRODUCTS: '/api/products',
  PRODUCT_LINKS: '/api/product-links',
  HEALTH: '/api/health',
} as const

