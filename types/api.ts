/**
 * API Response Types
 * Location: /types/api.ts
 * Purpose: TypeScript interfaces for all API responses. Ensures type safety
 * on the client side when consuming API endpoints.
 */

import { Carrier, Shipment, TrackingEvent, DashboardStats } from './index'
import { Integration, Product, ProductLink, SyncLog } from './products'

/**
 * Base API response structure
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
  meta?: ApiMeta
}

/**
 * API error structure
 */
export interface ApiError {
  code: string
  message: string
  details?: any
  field?: string
}

/**
 * API metadata (for pagination, etc.)
 */
export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  hasMore?: boolean
  [key: string]: any
}

// ============================================================================
// Carriers API Responses
// ============================================================================

export interface CarriersResponse {
  success: true
  data: {
    carriers: Carrier[]
  }
}

// ============================================================================
// Shipments API Responses
// ============================================================================

export interface ShipmentsListResponse {
  success: true
  data: {
    shipments: Shipment[]
  }
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ShipmentResponse {
  success: true
  data: {
    shipment: Shipment
  }
  message?: string
}

export interface ShipmentDeleteResponse {
  success: true
}

// ============================================================================
// Tracking Events API Responses
// ============================================================================

export interface TrackingEventResponse {
  success: true
  data: {
    event: TrackingEvent
  }
  message?: string
}

// ============================================================================
// Dashboard API Responses
// ============================================================================

export interface DashboardStatsResponse {
  success: true
  data: {
    stats: DashboardStats
  }
}

// ============================================================================
// Integrations API Responses
// ============================================================================

export interface IntegrationsListResponse {
  success: true
  data: {
    integrations: Integration[]
  }
}

export interface IntegrationResponse {
  success: true
  data: {
    integration: Integration
  }
  message?: string
}

export interface ShopifyProductsSyncResponse {
  success: true
  data: {
    message: string
    synced: number
    total: number
    errors?: string[]
  }
}

// ============================================================================
// Products API Responses
// ============================================================================

export interface ProductsListResponse {
  success: true
  data: {
    products: Product[]
  }
  meta?: {
    page: number
    limit: number
    total: number
  }
}

export interface ProductResponse {
  success: true
  data: {
    product: Product
  }
  message?: string
}

// ============================================================================
// Product Links API Responses
// ============================================================================

export interface ProductLinksListResponse {
  success: true
  data: {
    product_links: ProductLink[]
  }
}

export interface ProductLinkResponse {
  success: true
  data: {
    product_link: ProductLink
  }
  message?: string
}

export interface ProductSyncResponse {
  success: true
  data: {
    message: string
    results: {
      price_synced: boolean
      inventory_synced: boolean
      errors: string[]
    }
  }
}

// ============================================================================
// Health Check API Response
// ============================================================================

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  environment: string
  checks: {
    database: 'healthy' | 'unhealthy' | 'unknown'
  }
  responseTime?: string
  error?: string
}

// ============================================================================
// Error Response Type
// ============================================================================

export interface ErrorResponse {
  success: false
  error: ApiError
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && 'data' in response
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: ApiResponse
): response is ErrorResponse {
  return response.success === false && 'error' in response
}

// ============================================================================
// API Client Helper
// ============================================================================

/**
 * Type-safe API fetch wrapper
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()
    return data as ApiResponse<T>
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server. Please check your connection.',
      },
    }
  }
}

/**
 * Type-safe API GET request
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET' })
}

/**
 * Type-safe API POST request
 */
export async function apiPost<T>(
  endpoint: string,
  body: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Type-safe API PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  body: any
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/**
 * Type-safe API DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}

