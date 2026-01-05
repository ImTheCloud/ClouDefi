import { forwardRef } from 'react'
import type {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
} from 'react'
import clsx from 'clsx'

type ButtonVariant = 'primary' | 'ghost' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  fullWidth?: boolean
}

export const Button = ({ variant = 'primary', fullWidth, className, ...props }: ButtonProps) => (
  <button
    className={clsx('btn', `btn-${variant}`, fullWidth && 'w-full', className)}
    {...props}
  />
)

export const Card = ({
  title,
  actions,
  children,
  subdued,
}: {
  title?: string
  actions?: ReactNode
  subdued?: boolean
  children: ReactNode
}) => (
  <div className={clsx('card', subdued && 'card-subtle')}>
    {(title || actions) && (
      <div className="card-head">
        {title && <h3>{title}</h3>}
        {actions}
      </div>
    )}
    <div className="card-body">{children}</div>
  </div>
)

export const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) => (
  <label className="field">
    <div className="field-top">
      <span>{label}</span>
      {hint && <small>{hint}</small>}
    </div>
    {children}
    {error && <div className="field-error">{error}</div>}
  </label>
)

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={clsx('input', className)} {...props} />
  ),
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={clsx('input', 'textarea', className)} {...props} />
  ),
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={clsx('input', 'select', className)} {...props}>
      {children}
    </select>
  ),
)

export const Badge = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) => (
  <span className={clsx('badge', `badge-${tone}`)}>{children}</span>
)

export const Modal = ({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) => {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
