/**
 * Empty State Component
 * Location: /components/EmptyState.tsx
 * Purpose: Beautiful empty states with actions to guide users.
 * Better UX than just showing "No data" messages.
 */

import Link from 'next/link'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body items-center text-center py-16">
        {icon ? (
          <div className="text-6xl mb-4">{icon}</div>
        ) : (
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 text-base-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        )}
        
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-md">{description}</p>

        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {action && (
              action.href ? (
                <Link href={action.href} className="btn btn-primary">
                  {action.label}
                </Link>
              ) : (
                <button onClick={action.onClick} className="btn btn-primary">
                  {action.label}
                </button>
              )
            )}
            {secondaryAction && (
              secondaryAction.href ? (
                <Link href={secondaryAction.href} className="btn btn-ghost">
                  {secondaryAction.label}
                </Link>
              ) : (
                <button onClick={secondaryAction.onClick} className="btn btn-ghost">
                  {secondaryAction.label}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Specific Empty States
 */

export function NoShipmentsEmpty({ onAddClick }: { onAddClick?: () => void }) {
  return (
    <EmptyState
      icon="📦"
      title="No Shipments Yet"
      description="Start tracking your packages by adding your first shipment. Get real-time updates and never miss a delivery."
      action={{
        label: "Add Your First Shipment",
        href: "/add-shipment",
      }}
      secondaryAction={{
        label: "Learn More",
        href: "/#features",
      }}
    />
  )
}

export function NoResultsEmpty({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon="🔍"
      title="No Results Found"
      description="We couldn't find any shipments matching your search. Try adjusting your filters or search query."
      action={onClear ? {
        label: "Clear Filters",
        onClick: onClear,
      } : undefined}
    />
  )
}

export function NoIntegrationsEmpty() {
  return (
    <EmptyState
      icon="🔗"
      title="No Integrations Yet"
      description="Connect your Shopify or TikTok Shop account to start syncing products and managing your inventory seamlessly."
      action={{
        label: "Add Integration",
        href: "/integrations",
      }}
    />
  )
}

export function NoProductsEmpty() {
  return (
    <EmptyState
      icon="📦"
      title="No Products Synced"
      description="Sync products from your Shopify store to start managing and linking them to TikTok Shop."
      action={{
        label: "Go to Integrations",
        href: "/integrations",
      }}
    />
  )
}

export function NoProductLinksEmpty() {
  return (
    <EmptyState
      icon="🔗"
      title="No Product Links"
      description="Create links between your Shopify and TikTok Shop products to enable automatic price and inventory syncing."
      action={{
        label: "Create Link",
        href: "/product-links",
      }}
    />
  )
}

export function ErrorState({ 
  onRetry, 
  message = "Something went wrong" 
}: { 
  onRetry?: () => void
  message?: string 
}) {
  return (
    <EmptyState
      icon="⚠️"
      title="Oops! Something Went Wrong"
      description={message}
      action={onRetry ? {
        label: "Try Again",
        onClick: onRetry,
      } : undefined}
      secondaryAction={{
        label: "Go Home",
        href: "/",
      }}
    />
  )
}

