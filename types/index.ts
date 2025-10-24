/**
 * TypeScript Type Definitions
 * Location: /types/index.ts
 * Purpose: Central location for all TypeScript types and interfaces used
 * throughout the application. Ensures type safety and better code quality.
 */

export interface Carrier {
  id: string
  name: string
  slug: string
  website?: string
  logo_url?: string
  tracking_url_template?: string
  is_active: boolean
  created_at: string
}

export interface Shipment {
  id: string
  user_id: string
  carrier_id: string
  tracking_number: string
  title?: string
  description?: string
  origin?: string
  destination?: string
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'cancelled'
  estimated_delivery_date?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  carrier?: Carrier
  tracking_events?: TrackingEvent[]
}

export interface TrackingEvent {
  id: string
  shipment_id: string
  status: string
  location?: string
  description: string
  event_time: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  company_name?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_shipments: number
  in_transit: number
  delivered: number
  pending: number
}

