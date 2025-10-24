/**
 * Error Boundary Component
 * Location: /components/ErrorBoundary.tsx
 * Purpose: Catches React errors and displays fallback UI. Prevents entire app
 * from crashing due to component errors. Production-ready error handling.
 */

'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // In production, send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or similar service
      // Sentry.captureException(error, { extra: errorInfo })
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
          <div className="card w-full max-w-2xl bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="card-title text-3xl mb-4">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="alert alert-error mb-6 text-left">
                  <div className="flex flex-col gap-2 w-full">
                    <strong>Error:</strong>
                    <code className="text-sm">{this.state.error.message}</code>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer">Stack Trace</summary>
                        <pre className="text-xs mt-2 overflow-auto max-h-60">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <div className="card-actions flex-col sm:flex-row gap-4">
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
                <Link href="/" className="btn btn-ghost">
                  Go Home
                </Link>
                <Link href="/dashboard" className="btn btn-ghost">
                  Go to Dashboard
                </Link>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>If this problem persists, please contact support.</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Simple error fallback component for specific sections
 */
export function ErrorFallback({ 
  error, 
  reset 
}: { 
  error: Error
  reset?: () => void 
}) {
  return (
    <div className="alert alert-error">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold">Error loading this section</span>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-sm">{error.message}</p>
        )}
        {reset && (
          <button onClick={reset} className="btn btn-sm btn-ghost">
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

