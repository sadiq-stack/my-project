/**
 * Form Input Component
 * Location: /components/FormInput.tsx
 * Purpose: Reusable form input with built-in validation, error display,
 * and accessibility features. Ensures consistent form styling and UX.
 */

import { InputHTMLAttributes, useState } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  showCharCount?: boolean
  maxLength?: number
}

export default function FormInput({
  label,
  error,
  helperText,
  icon,
  showCharCount,
  maxLength,
  className = '',
  required,
  value,
  ...props
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const charCount = typeof value === 'string' ? value.length : 0

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          className={`input input-bordered w-full ${
            icon ? 'pl-10' : ''
          } ${error ? 'input-error' : ''} ${
            isFocused ? 'input-primary' : ''
          } ${className}`}
          value={value}
          maxLength={maxLength}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label={label}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
      </div>

      {(error || helperText || showCharCount) && (
        <label className="label">
          {error ? (
            <span id={`${props.id}-error`} className="label-text-alt text-error" role="alert">
              {error}
            </span>
          ) : helperText ? (
            <span id={`${props.id}-helper`} className="label-text-alt text-gray-500">
              {helperText}
            </span>
          ) : (
            <span></span>
          )}
          
          {showCharCount && maxLength && (
            <span className={`label-text-alt ${charCount > maxLength * 0.9 ? 'text-warning' : 'text-gray-500'}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </label>
      )}
    </div>
  )
}

/**
 * Form Textarea Component
 */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helperText?: string
  showCharCount?: boolean
  maxLength?: number
}

export function FormTextarea({
  label,
  error,
  helperText,
  showCharCount,
  maxLength,
  className = '',
  required,
  value,
  ...props
}: FormTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const charCount = typeof value === 'string' ? value.length : 0

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      <textarea
        className={`textarea textarea-bordered w-full ${
          error ? 'textarea-error' : ''
        } ${isFocused ? 'textarea-primary' : ''} ${className}`}
        value={value}
        maxLength={maxLength}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={label}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
        }
        {...props}
      />

      {(error || helperText || showCharCount) && (
        <label className="label">
          {error ? (
            <span id={`${props.id}-error`} className="label-text-alt text-error" role="alert">
              {error}
            </span>
          ) : helperText ? (
            <span id={`${props.id}-helper`} className="label-text-alt text-gray-500">
              {helperText}
            </span>
          ) : (
            <span></span>
          )}
          
          {showCharCount && maxLength && (
            <span className={`label-text-alt ${charCount > maxLength * 0.9 ? 'text-warning' : 'text-gray-500'}`}>
              {charCount}/{maxLength}
            </span>
          )}
        </label>
      )}
    </div>
  )
}

/**
 * Form Select Component
 */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
}

export function FormSelect({
  label,
  error,
  helperText,
  options,
  className = '',
  required,
  ...props
}: FormSelectProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text font-semibold">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      <select
        className={`select select-bordered w-full ${
          error ? 'select-error' : ''
        } ${isFocused ? 'select-primary' : ''} ${className}`}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={label}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
        }
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {(error || helperText) && (
        <label className="label">
          {error ? (
            <span id={`${props.id}-error`} className="label-text-alt text-error" role="alert">
              {error}
            </span>
          ) : helperText ? (
            <span id={`${props.id}-helper`} className="label-text-alt text-gray-500">
              {helperText}
            </span>
          ) : null}
        </label>
      )}
    </div>
  )
}

