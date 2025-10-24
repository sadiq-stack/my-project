/**
 * Loading Component
 * Location: /components/Loading.tsx
 * Purpose: Reusable loading spinner component using DaisyUI loading indicator.
 * Displays while data is being fetched or processed.
 */

export default function Loading() {
  return (
    <div 
      className="flex justify-center items-center min-h-[400px]" 
      role="status" 
      aria-live="polite"
      aria-label="Loading content"
    >
      <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true"></span>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

